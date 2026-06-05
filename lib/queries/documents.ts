import { supabase } from '../supabase'
import { FTS_COLUMN, VISIBILITY_COLUMN, getDocumentConfig, getPersonConfig, getContainerConfig, getRelationshipConfig } from '../config/db-config'
import { PAGE_SIZE, DocumentRow, PersonSummary, ContainerSummary } from './types'

// ── Types ──────────────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string
  date_from?: string
  date_to?: string
  filters?: Record<string, string[]>
  textFilters?: Record<string, string>
  page?: number
}

export interface SearchResult {
  records: DocumentRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DocumentEnrichment {
  authors: PersonSummary[]
  container: ContainerSummary | null
  mentionedPersons: Array<{ person: PersonSummary; relationship_type: string }>
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function searchDocuments(params: SearchParams): Promise<SearchResult> {
  const { TABLE_FIELDS, MULTISELECT_FILTER_FIELDS, TEXT_FILTER_FIELDS, SORT_DATE_KEY } = await getDocumentConfig()

  const TABLE_COLUMNS = [...new Set(['id', ...TABLE_FIELDS.map((f) => f.key)])].join(', ')

  const page = Math.max(1, params.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('documents')
    .select(TABLE_COLUMNS, { count: 'exact' })
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })
  }

  if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
  if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

  for (const field of MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) query = query.overlaps(field.key, values)
  }

  for (const field of TEXT_FILTER_FIELDS) {
    if (field.isArray) continue
    const value = params.textFilters?.[field.paramKey!]?.trim()
    if (value) query = query.ilike(field.key, `%${value}%`)
  }

  query = query.order(SORT_DATE_KEY, { ascending: true, nullsFirst: false }).range(from, to)

  const { data, count, error } = await query
  if (error) throw new Error(error.message)

  const total = count ?? 0
  return {
    records: (data ?? []) as unknown as DocumentRow[],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  }
}

export async function getDocument(id: number): Promise<Record<string, unknown> | null> {
  const { FIELDS } = await getDocumentConfig()
  const ALL_DOC_COLUMNS = [...new Set([...FIELDS.map((f) => f.key), 'id', VISIBILITY_COLUMN])].join(', ')

  const { data, error } = await supabase
    .from('documents')
    .select(ALL_DOC_COLUMNS)
    .eq('id', id)
    .eq(VISIBILITY_COLUMN, 'public')
    .single()

  if (error) return null
  return data as unknown as Record<string, unknown>
}

export async function getDocumentEnrichment(
  authorIds: string[],
  containerId: string | null,
  documentId: number,
): Promise<DocumentEnrichment> {
  const [{ PERSON_ENRICHMENT_COLUMNS }, { CONTAINER_SELECT_COLUMNS }, { RELATIONSHIP_SOURCE_KEY, RELATIONSHIP_TARGET_KEY, RELATIONSHIP_TYPE_KEY }] =
    await Promise.all([getPersonConfig(), getContainerConfig(), getRelationshipConfig()])

  const numericAuthorIds = authorIds
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0)
  const numericContainerId =
    containerId && Number.isFinite(Number(containerId)) ? Number(containerId) : null

  const [authorsRes, containerRes, relsRes] = await Promise.allSettled([
    numericAuthorIds.length > 0
      ? supabase.from('persons').select(PERSON_ENRICHMENT_COLUMNS).in('id', numericAuthorIds)
      : Promise.resolve({ data: [] as PersonSummary[], error: null }),

    numericContainerId
      ? supabase
          .from('containers')
          .select(CONTAINER_SELECT_COLUMNS)
          .eq('id', numericContainerId)
          .single()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from('relationships')
      .select(`${RELATIONSHIP_TYPE_KEY}, ${RELATIONSHIP_TARGET_KEY}`)
      .eq(RELATIONSHIP_SOURCE_KEY, String(documentId)),
  ])

  const authors: PersonSummary[] =
    authorsRes.status === 'fulfilled' && authorsRes.value.data
      ? (authorsRes.value.data as PersonSummary[])
      : []

  const container: ContainerSummary | null =
    containerRes.status === 'fulfilled' && containerRes.value.data
      ? (containerRes.value.data as unknown as ContainerSummary)
      : null

  let mentionedPersons: DocumentEnrichment['mentionedPersons'] = []

  if (relsRes.status === 'fulfilled' && relsRes.value.data) {
    const rels = relsRes.value.data as unknown as Record<string, string>[]

    const personIds = [
      ...new Set(
        rels
          .map((r) => Number(r[RELATIONSHIP_TARGET_KEY]))
          .filter((n) => Number.isFinite(n) && n > 0),
      ),
    ]

    if (personIds.length > 0) {
      const { data: persons } = await supabase
        .from('persons')
        .select(PERSON_ENRICHMENT_COLUMNS)
        .in('id', personIds)

      if (persons) {
        const byId = new Map(
          (persons as unknown as PersonSummary[]).map((p) => [p.id, p]),
        )
        mentionedPersons = rels
          .map((r) => {
            const person = byId.get(Number(r[RELATIONSHIP_TARGET_KEY]))
            return person ? { person, relationship_type: r[RELATIONSHIP_TYPE_KEY] } : null
          })
          .filter((x): x is DocumentEnrichment['mentionedPersons'][number] => x !== null)
      }
    }
  }

  return { authors, container, mentionedPersons }
}

export async function getArchiveDates(): Promise<(string | null)[]> {
  const { SORT_DATE_KEY } = await getDocumentConfig()
  const { data } = await supabase
    .from('documents')
    .select(SORT_DATE_KEY)
    .eq(VISIBILITY_COLUMN, 'public')
  return (data as unknown as Record<string, string | null>[] ?? []).map((d) => d[SORT_DATE_KEY])
}

export async function searchDocumentDates(
  params: Omit<SearchParams, 'page'>,
): Promise<(string | null)[]> {
  const { MULTISELECT_FILTER_FIELDS, TEXT_FILTER_FIELDS, SORT_DATE_KEY } = await getDocumentConfig()

  let query = supabase
    .from('documents')
    .select(SORT_DATE_KEY)
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'simple' })
  }
  if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
  if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

  for (const field of MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) query = query.overlaps(field.key, values)
  }

  for (const field of TEXT_FILTER_FIELDS) {
    if (field.isArray) continue
    const value = params.textFilters?.[field.paramKey!]?.trim()
    if (value) query = query.ilike(field.key, `%${value}%`)
  }

  const { data } = await query
  return (data as unknown as Record<string, string | null>[] ?? []).map((d) => d[SORT_DATE_KEY])
}
