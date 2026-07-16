import { cacheLife } from 'next/cache'
import { supabase } from '../supabase'
import { FTS_COLUMN, VISIBILITY_COLUMN, getDocumentConfig, getContainerConfig, getPersonConfig } from '../config/db-config'
import { containerDisplayName, type ContainerSummary } from './types'
import type { SearchParams } from './documents'
import type { PersonSearchParams } from './persons'
import { splitFilterValues, excludeFilter } from '../search-utils'

async function fetchFilterOptions(
  table: 'documents' | 'persons',
  fields: Array<{ key: string; isArray?: boolean; paramKey?: string | null }>,
): Promise<Record<string, string[]>> {
  const results = await Promise.all(
    fields.map(async (field) => {
      const { data } = await supabase
        .from(table)
        .select(field.key)
        .not(field.key, 'is', null)
        .eq(VISIBILITY_COLUMN, 'public')
      const raw = (data ?? []) as unknown as Record<string, string | string[] | null>[]
      const values = field.isArray
        ? [...new Set(raw.flatMap((d) => (d[field.key] as string[] | null) ?? []))]
        : [...new Set(raw.map((d) => d[field.key] as string).filter(Boolean))]
      return [field.paramKey!, values.sort()] as const
    }),
  )
  return Object.fromEntries(results)
}

export async function getDocumentFilterOptions(): Promise<Record<string, string[]>> {
  'use cache: remote'
  cacheLife('hours')
  const { MULTISELECT_FILTER_FIELDS } = await getDocumentConfig()
  return fetchFilterOptions('documents', MULTISELECT_FILTER_FIELDS)
}

export async function getPersonFilterOptions(): Promise<Record<string, string[]>> {
  'use cache: remote'
  cacheLife('hours')
  const { PERSON_MULTISELECT_FILTER_FIELDS } = await getPersonConfig()
  return fetchFilterOptions('persons', PERSON_MULTISELECT_FILTER_FIELDS)
}

// ── Facet counts ───────────────────────────────────────────────────────────
// For each multiselect field, count how many records contain each value
// given all OTHER active filters (q, dates, other groups). Used to show
// counts next to filter checkboxes and hide zero-count options.

type FacetCounts = Record<string, Record<string, number>>

function countFieldValues(
  rows: Record<string, unknown>[],
  fieldKey: string,
  isArray: boolean,
): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const val = row[fieldKey]
    const vals: string[] = isArray
      ? Array.isArray(val) ? (val as string[]) : []
      : val ? [val as string] : []
    for (const v of vals) {
      if (v) counts[v] = (counts[v] ?? 0) + 1
    }
  }
  return counts
}

export async function getDocumentFacetCounts(
  params: Pick<SearchParams, 'q' | 'date_from' | 'date_to' | 'filters' | 'containerIds'>,
  options?: {
    /** When provided, only count documents whose location field overlaps this set (e.g. geocoded locations for the map). */
    locationRestriction?: string[]
  },
): Promise<FacetCounts> {
  const { MULTISELECT_FILTER_FIELDS, SORT_DATE_KEY, LOCATION_FIELD_KEY, CONTAINER_FIELD_KEY } = await getDocumentConfig()

  const results = await Promise.all(
    MULTISELECT_FILTER_FIELDS.map(async (field) => {
      let query = supabase
        .from('documents')
        .select(field.key)
        .eq(VISIBILITY_COLUMN, 'public')

      if (params.q?.trim())
        query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })
      if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
      if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

      if (options?.locationRestriction?.length)
        query = query.overlaps(LOCATION_FIELD_KEY, options.locationRestriction)

      if (params.containerIds?.length) {
        const { include, exclude } = splitFilterValues(params.containerIds)
        if (include.length > 0) query = query.in(CONTAINER_FIELD_KEY, include)
        if (exclude.length > 0) query = query.or(excludeFilter(CONTAINER_FIELD_KEY, exclude, 'in'))
      }

      for (const other of MULTISELECT_FILTER_FIELDS) {
        const { include, exclude } = splitFilterValues(params.filters?.[other.paramKey!] ?? [])
        // Skip this field's own *include* selections so sibling checkbox counts show "if I
        // also picked this" totals rather than collapsing to the current OR-selection. Excludes
        // are subtractive rather than OR-widening, so a field's own excludes still apply to its
        // own counts — otherwise excluding every option in a group would never move its numbers.
        if (other.paramKey !== field.paramKey && include.length > 0) query = query.overlaps(other.key, include)
        if (exclude.length > 0) query = query.or(excludeFilter(other.key, exclude, 'ov'))
      }

      const { data } = await query
      const rows = (data ?? []) as unknown as Record<string, unknown>[]
      return [field.paramKey!, countFieldValues(rows, field.key, field.isArray ?? false)] as const
    }),
  )

  return Object.fromEntries(results)
}

export async function getPersonFacetCounts(
  params: Pick<PersonSearchParams, 'q' | 'filters'>,
): Promise<FacetCounts> {
  const { PERSON_MULTISELECT_FILTER_FIELDS } = await getPersonConfig()

  const results = await Promise.all(
    PERSON_MULTISELECT_FILTER_FIELDS.map(async (field) => {
      let query = supabase
        .from('persons')
        .select(field.key)
        .eq(VISIBILITY_COLUMN, 'public')

      if (params.q?.trim())
        query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })

      for (const other of PERSON_MULTISELECT_FILTER_FIELDS) {
        const { include, exclude } = splitFilterValues(params.filters?.[other.paramKey!] ?? [])
        const isSelf = other.paramKey === field.paramKey
        if (other.isArray) {
          if (!isSelf && include.length > 0) query = query.overlaps(other.key, include)
          if (exclude.length > 0) query = query.or(excludeFilter(other.key, exclude, 'ov'))
        } else {
          if (!isSelf && include.length > 0) query = query.in(other.key, include)
          if (exclude.length > 0) query = query.or(excludeFilter(other.key, exclude, 'in'))
        }
      }

      const { data } = await query
      const rows = (data ?? []) as unknown as Record<string, unknown>[]
      return [field.paramKey!, countFieldValues(rows, field.key, field.isArray ?? false)] as const
    }),
  )

  return Object.fromEntries(results)
}

// ── Container filter (documents belong to a publication/container) ────────
// The `container` column stores a container id (text), not a display value,
// so options/counts need a join against `containers` for the label.

export interface ContainerFilterOption {
  id: string
  label: string
}

export async function getContainerFilterOptions(): Promise<ContainerFilterOption[]> {
  'use cache: remote'
  cacheLife('hours')
  const { CONTAINER_FIELD_KEY } = await getDocumentConfig()
  const { CONTAINER_SELECT_COLUMNS, CONTAINER_NAME_TITLE_KEY, CONTAINER_SHORT_NAME_KEY, CONTAINER_TITLE_KEY } =
    await getContainerConfig()

  const { data: docRows } = await supabase
    .from('documents')
    .select(CONTAINER_FIELD_KEY)
    .not(CONTAINER_FIELD_KEY, 'is', null)
    .eq(VISIBILITY_COLUMN, 'public')

  const containerIds = [
    ...new Set(((docRows ?? []) as unknown as Record<string, string>[]).map((d) => d[CONTAINER_FIELD_KEY]).filter(Boolean)),
  ]
  if (containerIds.length === 0) return []

  const { data: containers } = await supabase
    .from('containers')
    .select(CONTAINER_SELECT_COLUMNS)
    .in('id', containerIds.map(Number).filter((n) => Number.isFinite(n)))

  return ((containers ?? []) as unknown as ContainerSummary[])
    .map((c) => ({
      id: String(c.id),
      label: containerDisplayName(c, { CONTAINER_NAME_TITLE_KEY, CONTAINER_SHORT_NAME_KEY, CONTAINER_TITLE_KEY }, c.id as number),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export async function getContainerFacetCounts(
  params: Pick<SearchParams, 'q' | 'date_from' | 'date_to' | 'filters' | 'containerIds'>,
): Promise<Record<string, number>> {
  const { MULTISELECT_FILTER_FIELDS, SORT_DATE_KEY, CONTAINER_FIELD_KEY } = await getDocumentConfig()

  let query = supabase
    .from('documents')
    .select(CONTAINER_FIELD_KEY)
    .not(CONTAINER_FIELD_KEY, 'is', null)
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim())
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })
  if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
  if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

  // Own excludes still narrow sibling container counts (subtractive); own includes are skipped
  // so picking one container doesn't zero out the others' counts.
  if (params.containerIds?.length) {
    const { exclude } = splitFilterValues(params.containerIds)
    if (exclude.length > 0) query = query.or(excludeFilter(CONTAINER_FIELD_KEY, exclude, 'in'))
  }

  for (const field of MULTISELECT_FILTER_FIELDS) {
    const { include, exclude } = splitFilterValues(params.filters?.[field.paramKey!] ?? [])
    if (include.length > 0) query = query.overlaps(field.key, include)
    if (exclude.length > 0) query = query.or(excludeFilter(field.key, exclude, 'ov'))
  }

  const { data } = await query
  const rows = (data ?? []) as unknown as Record<string, string>[]
  const counts: Record<string, number> = {}
  for (const row of rows) {
    const v = row[CONTAINER_FIELD_KEY]
    if (v) counts[v] = (counts[v] ?? 0) + 1
  }
  return counts
}
