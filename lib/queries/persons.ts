import { supabase } from '../supabase'
import { FTS_COLUMN, VISIBILITY_COLUMN, getDocumentConfig, getPersonConfig, getRelationshipConfig } from '../config/db-config'
import { PAGE_SIZE, PersonRow, PersonSummary } from './types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface PersonSearchParams {
  q?: string
  filters?: Record<string, string[]>
  textFilters?: Record<string, string>
  page?: number
}

export interface PersonSearchResult {
  records: PersonRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function searchPersons(params: PersonSearchParams): Promise<PersonSearchResult> {
  const { PERSON_TABLE_FIELDS, PERSON_MULTISELECT_FILTER_FIELDS, PERSON_TEXT_FILTER_FIELDS, PERSON_GIVEN_NAME_KEY, PERSON_ENRICHMENT_COLUMNS } =
    await getPersonConfig()

  const PERSON_SEARCH_COLUMNS = [
    ...new Set(['id', ...PERSON_ENRICHMENT_COLUMNS.split(', '), ...PERSON_TABLE_FIELDS.map((f) => f.key)]),
  ].join(', ')

  const page = Math.max(1, params.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('persons')
    .select(PERSON_SEARCH_COLUMNS, { count: 'exact' })
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })
  }

  for (const field of PERSON_MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) {
      query = field.isArray
        ? query.overlaps(field.key, values)
        : query.in(field.key, values)
    }
  }

  for (const field of PERSON_TEXT_FILTER_FIELDS) {
    if (field.isArray) continue
    const value = params.textFilters?.[field.paramKey!]?.trim()
    if (value) query = query.ilike(field.key, `%${value}%`)
  }

  query = query.order(PERSON_GIVEN_NAME_KEY, { ascending: true, nullsFirst: false }).range(from, to)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const total = count ?? 0
  return {
    records: (data ?? []) as unknown as PersonRow[],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

export async function getPerson(id: number): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as Record<string, unknown>
}

export async function getPersonDocuments(personId: number): Promise<{
  mentioned: Record<string, unknown>[]
  authored: Record<string, unknown>[]
}> {
  const [{ DOC_SUMMARY_COLUMNS, AUTHOR_FIELD_KEY, SORT_DATE_KEY }, { RELATIONSHIP_SOURCE_KEY, RELATIONSHIP_TARGET_KEY }] =
    await Promise.all([getDocumentConfig(), getRelationshipConfig()])

  const { data: rels } = await supabase
    .from('relationships')
    .select(RELATIONSHIP_SOURCE_KEY)
    .eq(RELATIONSHIP_TARGET_KEY, String(personId))

  const mentionedDocIds = [
    ...new Set(
      ((rels ?? []) as unknown as Record<string, string>[])
        .map((r) => Number(r[RELATIONSHIP_SOURCE_KEY]))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  ]

  const [mentionedRes, authoredRes] = await Promise.allSettled([
    mentionedDocIds.length > 0
      ? supabase
          .from('documents')
          .select(DOC_SUMMARY_COLUMNS)
          .in('id', mentionedDocIds)
          .eq(VISIBILITY_COLUMN, 'public')
          .order(SORT_DATE_KEY, { ascending: true, nullsFirst: false })
      : Promise.resolve({ data: [] }),

    supabase
      .from('documents')
      .select(DOC_SUMMARY_COLUMNS)
      .contains(AUTHOR_FIELD_KEY, [String(personId)])
      .eq(VISIBILITY_COLUMN, 'public')
      .order(SORT_DATE_KEY, { ascending: true, nullsFirst: false }),
  ])

  return {
    mentioned:
      mentionedRes.status === 'fulfilled' && mentionedRes.value.data
        ? (mentionedRes.value.data as unknown as Record<string, unknown>[])
        : [],
    authored:
      authoredRes.status === 'fulfilled' && authoredRes.value.data
        ? (authoredRes.value.data as unknown as Record<string, unknown>[])
        : [],
  }
}

export type { PersonSummary }
