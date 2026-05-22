import { unstable_cache } from 'next/cache'
import { supabase } from './supabase'
import {
  UNIQUE_FIELDS,
  TABLE_FIELDS,
  MULTISELECT_FILTER_FIELDS,
  FTS_COLUMN,
  VISIBILITY_COLUMN,
  SORT_DATE_KEY,
  LOCATION_FIELD_KEY,
  AUTHOR_FIELD_KEY,
  DOC_SUMMARY_COLUMNS,
} from './field-config'
import {
  PERSON_TABLE_FIELDS,
  PERSON_MULTISELECT_FILTER_FIELDS,
  PERSON_SORT_KEY,
  PERSON_ENRICHMENT_COLUMNS,
} from './person-field-config'

export const PAGE_SIZE = 20

// ── Search params ──────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string
  /** ISO date string e.g. "1790-06-01" */
  date_from?: string
  /** ISO date string e.g. "1848-12-31" */
  date_to?: string
  /**
   * Map of paramKey → selected values for every multiselect filter.
   * Keys match the `paramKey` fields defined in field-config.ts.
   * Adding a new multiselect filter to the config automatically
   * applies it here — no code changes required.
   */
  filters?: Record<string, string[]>
  page?: number
}

// ── Column sets (all derived from config — no hardcoded column names) ──────

// All document columns: every field key + the two system columns
const ALL_DOC_COLUMNS = [...UNIQUE_FIELDS.map((f) => f.key), 'id', VISIBILITY_COLUMN].join(', ')

// Table query columns: id + all showInTable fields (title included via showInDocSummary isn't needed here — title is already in TABLE_FIELDS via enriched fields)
const TABLE_COLUMNS = [...new Set(['id', ...TABLE_FIELDS.map((f) => f.key)])].join(', ')

// DOC_SUMMARY_COLUMNS and PERSON_ENRICHMENT_COLUMNS are imported from the config files

// PERSON_SEARCH_COLUMNS: enrichment fields cover all fields needed for display name + table columns
const PERSON_SEARCH_COLUMNS = [...new Set(['id', ...PERSON_ENRICHMENT_COLUMNS.split(', '), ...PERSON_TABLE_FIELDS.map((f) => f.key)])].join(', ')

// ── Document types ─────────────────────────────────────────────────────────

export interface DocumentRow {
  id: number
  title: string | null
  date: string | null
  short_summary: string | null
  provisional_category: string[] | null
  crossdressing_activities: string[] | null
  locations_mentioned: string[] | null
  [key: string]: unknown
}

export interface SearchResult {
  records: DocumentRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// ── Person / container types ───────────────────────────────────────────────

export interface PersonSummary {
  id: number
  title: string | null
  given_names: string | null
  name_title: string[] | string | null
  person_type: string[] | null
  presumptive_sex: string | null
  social_rank: string | null
  short_summary: string | null
}

export interface ContainerSummary {
  id: number
  title: string | null
  name_title: string | null
  short_name: string | null
  short_summary: string | null
  cite_as: string | null
  url: string | null
}

export interface DocumentEnrichment {
  authors: PersonSummary[]
  container: ContainerSummary | null
  mentionedPersons: Array<{ person: PersonSummary; relationship_type: string }>
}

/** Best human-readable name for a person record */
export function personDisplayName(p: PersonSummary): string {
  const surname = Array.isArray(p.name_title) ? p.name_title[0] : p.name_title
  if (p.given_names && surname) return `${p.given_names} ${surname}`
  if (p.given_names) return p.given_names
  if (surname) return surname
  return p.title ?? `Person #${p.id}`
}

// ── Document queries ───────────────────────────────────────────────────────

export async function searchDocuments(params: SearchParams): Promise<SearchResult> {
  const page = Math.max(1, params.page ?? 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('documents')
    .select(TABLE_COLUMNS, { count: 'exact' })
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'english' })
  }

  if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
  if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

  // Apply all multiselect filters generically from the field config.
  // To add a new filter, add it to FIELDS in field-config.ts — nothing else needed here.
  for (const field of MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) query = query.overlaps(field.key, values)
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
  const { data, error } = await supabase
    .from('documents')
    .select(ALL_DOC_COLUMNS)
    .eq('id', id)
    .eq(VISIBILITY_COLUMN, 'public')
    .single()

  if (error) return null
  return data as unknown as Record<string, unknown>
}

/**
 * Fetch enrichment data (authors, container, mentioned persons) for a document.
 * Called after getDocument so we can pass the already-resolved field values.
 */
export async function getDocumentEnrichment(
  authorIds: string[],
  containerId: string | null,
  documentId: number,
): Promise<DocumentEnrichment> {
  const numericAuthorIds = authorIds
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0)
  const numericContainerId =
    containerId && Number.isFinite(Number(containerId)) ? Number(containerId) : null

  // Fetch all three in parallel
  const [authorsRes, containerRes, relsRes] = await Promise.allSettled([
    numericAuthorIds.length > 0
      ? supabase.from('persons').select(PERSON_ENRICHMENT_COLUMNS).in('id', numericAuthorIds)
      : Promise.resolve({ data: [] as PersonSummary[], error: null }),

    numericContainerId
      ? supabase
          .from('containers')
          .select('id, title, name_title, short_name, short_summary, cite_as, url')
          .eq('id', numericContainerId)
          .single()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from('relationships')
      .select('relationship_type, target_record_pointer')
      .eq('source_record_pointer', String(documentId)),
  ])

  const authors: PersonSummary[] =
    authorsRes.status === 'fulfilled' && authorsRes.value.data
      ? (authorsRes.value.data as PersonSummary[])
      : []

  const container: ContainerSummary | null =
    containerRes.status === 'fulfilled' && containerRes.value.data
      ? (containerRes.value.data as ContainerSummary)
      : null

  // Resolve person IDs from relationships then fetch in one query
  let mentionedPersons: DocumentEnrichment['mentionedPersons'] = []

  if (relsRes.status === 'fulfilled' && relsRes.value.data) {
    const rels = relsRes.value.data as {
      relationship_type: string
      target_record_pointer: string
    }[]

    const personIds = [
      ...new Set(
        rels
          .map((r) => Number(r.target_record_pointer))
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
            const person = byId.get(Number(r.target_record_pointer))
            return person ? { person, relationship_type: r.relationship_type } : null
          })
          .filter((x): x is DocumentEnrichment['mentionedPersons'][number] => x !== null)
      }
    }
  }

  return { authors, container, mentionedPersons }
}

// ── Person search ──────────────────────────────────────────────────────────


export interface PersonSearchParams {
  q?: string
  /**
   * Map of paramKey → selected values for every multiselect filter.
   * Keys match the `paramKey` fields in person-field-config.ts.
   */
  filters?: Record<string, string[]>
  page?: number
}

export interface PersonRow {
  id: number
  title: string | null
  given_names: string | null
  name_title: string[] | string | null
  short_summary: string | null
  person_type: string[] | null
  presumptive_sex: string | null
  social_rank: string | null
  [key: string]: unknown
}

export interface PersonSearchResult {
  records: PersonRow[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

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

// ── Timeline distribution queries ─────────────────────────────────────────

/** All public document dates — used as the grey context layer in the timeline chart. */
export async function getArchiveDates(): Promise<(string | null)[]> {
  const { data } = await supabase
    .from('documents')
    .select(SORT_DATE_KEY)
    .eq(VISIBILITY_COLUMN, 'public')
  return (data as unknown as Record<string, string | null>[] ?? []).map((d) => d[SORT_DATE_KEY])
}

/**
 * Dates for documents matching the supplied filters — used as the crimson
 * foreground layer.  Mirrors the filter logic in searchDocuments but selects
 * only the date column and applies no pagination.
 */
export async function searchDocumentDates(
  params: Omit<SearchParams, 'page'>,
): Promise<(string | null)[]> {
  let query = supabase
    .from('documents')
    .select(SORT_DATE_KEY)
    .eq(VISIBILITY_COLUMN, 'public')

  if (params.q?.trim()) {
    query = query.textSearch(FTS_COLUMN, params.q.trim(), { type: 'websearch', config: 'english' })
  }
  if (params.date_from) query = query.gte(SORT_DATE_KEY, params.date_from)
  if (params.date_to)   query = query.lte(SORT_DATE_KEY, params.date_to)

  for (const field of MULTISELECT_FILTER_FIELDS) {
    const values = params.filters?.[field.paramKey!] ?? []
    if (values.length > 0) query = query.overlaps(field.key, values)
  }

  const { data } = await query
  return (data as unknown as Record<string, string | null>[] ?? []).map((d) => d[SORT_DATE_KEY])
}

// ── Map pin types and query ────────────────────────────────────────────────

export interface MapPin {
  location: string
  lat: number
  lng: number
  documents: Array<{ id: number; title: string | null; date: string | null }>
}

export async function getMapPins(): Promise<MapPin[]> {
  const [geocodesRes, docsRes] = await Promise.allSettled([
    supabase
      .from('geocode_cache')
      .select('location, lat, lng')
      .not('lat', 'is', null),

    supabase
      .from('documents')
      .select(`id, title, ${SORT_DATE_KEY}, ${LOCATION_FIELD_KEY}`)
      .eq(VISIBILITY_COLUMN, 'public')
      .not(LOCATION_FIELD_KEY, 'is', null),
  ])

  if (geocodesRes.status === 'rejected' || docsRes.status === 'rejected') return []

  const geocodes = (geocodesRes.value.data ?? []) as {
    location: string; lat: number; lng: number
  }[]
  const docs = (docsRes.value.data ?? []) as unknown as {
    id: number; title: string | null; date: string | null; locations_mentioned: string[]
  }[]

  const pinMap = new Map<string, MapPin>()
  for (const g of geocodes) {
    pinMap.set(g.location, { location: g.location, lat: g.lat, lng: g.lng, documents: [] })
  }
  for (const doc of docs) {
    for (const loc of doc.locations_mentioned ?? []) {
      const pin = pinMap.get(loc)
      if (pin) pin.documents.push({ id: doc.id, title: doc.title, date: doc.date })
    }
  }

  return Array.from(pinMap.values())
    .filter((p) => p.documents.length > 0)
    .sort((a, b) => a.location.localeCompare(b.location))
}

// ── Person detail queries ──────────────────────────────────────────────────

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
  // Find all documents that mention this person via the relationships table
  const { data: rels } = await supabase
    .from('relationships')
    .select('source_record_pointer')
    .eq('target_record_pointer', String(personId))

  const mentionedDocIds = [
    ...new Set(
      (rels ?? [])
        .map((r: { source_record_pointer: string }) => Number(r.source_record_pointer))
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

// ── Filter option generation ───────────────────────────────────────────────

async function fetchFilterOptions(
  table: 'documents' | 'persons',
  fields: Array<{ key: string; isArray?: boolean; paramKey?: string }>,
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

/** Distinct values for all document multiselect filters, cached for 1 hour. */
export const getDocumentFilterOptions = unstable_cache(
  () => fetchFilterOptions('documents', MULTISELECT_FILTER_FIELDS),
  ['wxda-document-filter-options'],
  { revalidate: 3600 },
)

/** Distinct values for all person multiselect filters, cached for 1 hour. */
export const getPersonFilterOptions = unstable_cache(
  () => fetchFilterOptions('persons', PERSON_MULTISELECT_FILTER_FIELDS),
  ['wxda-person-filter-options'],
  { revalidate: 3600 },
)
