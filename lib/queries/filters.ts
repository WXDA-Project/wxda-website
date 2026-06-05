import { cacheLife } from 'next/cache'
import { supabase } from '../supabase'
import { FTS_COLUMN, VISIBILITY_COLUMN, getDocumentConfig, getPersonConfig } from '../config/db-config'
import type { SearchParams } from './documents'
import type { PersonSearchParams } from './persons'

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
  params: Pick<SearchParams, 'q' | 'date_from' | 'date_to' | 'filters'>,
  options?: {
    /** When provided, only count documents whose location field overlaps this set (e.g. geocoded locations for the map). */
    locationRestriction?: string[]
  },
): Promise<FacetCounts> {
  const { MULTISELECT_FILTER_FIELDS, SORT_DATE_KEY, LOCATION_FIELD_KEY } = await getDocumentConfig()

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

      for (const other of MULTISELECT_FILTER_FIELDS) {
        if (other.paramKey === field.paramKey) continue
        const vals = params.filters?.[other.paramKey!] ?? []
        if (vals.length > 0) query = query.overlaps(other.key, vals)
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
        if (other.paramKey === field.paramKey) continue
        const vals = params.filters?.[other.paramKey!] ?? []
        if (vals.length > 0) {
          query = other.isArray
            ? query.overlaps(other.key, vals)
            : query.in(other.key, vals)
        }
      }

      const { data } = await query
      const rows = (data ?? []) as unknown as Record<string, unknown>[]
      return [field.paramKey!, countFieldValues(rows, field.key, field.isArray ?? false)] as const
    }),
  )

  return Object.fromEntries(results)
}
