import { supabase } from '../supabase'
import {
  FTS_COLUMN,
  VISIBILITY_COLUMN,
  SORT_DATE_KEY,
  AUTHOR_FIELD_KEY,
  DOC_SUMMARY_COLUMNS,
} from '../config/document-field-config'
import {
  PERSON_TABLE_FIELDS,
  PERSON_MULTISELECT_FILTER_FIELDS,
  PERSON_SORT_KEY,
  PERSON_ENRICHMENT_COLUMNS,
} from '../config/person-field-config'
import { RELATIONSHIP_SOURCE_KEY, RELATIONSHIP_TARGET_KEY } from '../config/relationship-field-config'
import { PAGE_SIZE, PersonRow, PersonSummary } from './types'

// ── Column sets ────────────────────────────────────────────────────────────

const PERSON_SEARCH_COLUMNS = [
  ...new Set(['id', ...PERSON_ENRICHMENT_COLUMNS.split(', '), ...PERSON_TABLE_FIELDS.map((f) => f.key)]),
].join(', ')

// ── Types ──────────────────────────────────────────────────────────────────

export interface PersonSearchParams {
  q?: string
  /**
   * Map of paramKey → selected values for every multiselect filter.
   * Keys match the `paramKey` fields in person-field-config.ts.
   */
  filters?: Record<string, string[]>
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
  const page = Math.max(1, params.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('persons')
    .select(PERSON_SEARCH_COLUMNS, { count: 'exact' })
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'english' })
  }

  // Apply multiselect filters generically from person-field-config.
  // Array columns use overlaps(); scalar columns use in().
  for (const field of PERSON_MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) {
      query = field.isArray
        ? query.overlaps(field.key, values)
        : query.in(field.key, values)
    }
  }

  query = query.order(PERSON_SORT_KEY, { ascending: true, nullsFirst: false }).range(from, to)

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
  const { data: rels } = await supabase
    .from('relationships')
    .select(RELATIONSHIP_SOURCE_KEY)
    .eq(RELATIONSHIP_TARGET_KEY, String(personId))

  const mentionedDocIds = [
    ...new Set(
      (rels ?? [])
        .map((r: Record<string, string>) => Number(r[RELATIONSHIP_SOURCE_KEY]))
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

// Re-export PersonSummary so callers only need to import from queries/persons if needed
export type { PersonSummary }
