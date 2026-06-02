import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from '../supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export type FilterType = 'text' | 'date-range' | 'multiselect'

/** Camelcase field config — mirrors the old FieldConfig interface */
export interface FieldConfig {
  id: number
  key: string
  label: string
  role?: string | null
  badge?: boolean
  filterType?: FilterType | null
  paramKey?: string | null
  showInTable: boolean
  showInDetail: boolean
  isArray?: boolean
  hideOnMobile?: boolean
  hideOnTablet?: boolean
  format?: 'date' | null
  maxTableLength?: number | null
  showInDocSummary?: boolean
  showInEnrichment?: boolean
  sortOrder: number
}

export interface ContainerFieldConfig {
  id: number
  key: string
  role: string | null
  sortOrder: number
}

export interface RelationshipFieldConfig {
  id: number
  key: string
  role: string | null
}

// ── DB row types (snake_case from Supabase) ────────────────────────────────

interface DocumentFieldRow {
  id: number; key: string;
  label: string;
  role: string | null;
  filter_type: string | null;
  param_key: string | null;
  show_in_table: boolean;
  show_in_detail: boolean;
  is_array: boolean;
  hide_on_mobile: boolean;
  hide_on_tablet: boolean;
  format: string | null;
  max_table_length: number | null;
  show_in_doc_summary: boolean;
  sort_order: number;
}

interface PersonFieldRow extends DocumentFieldRow {
  badge: boolean
  show_in_enrichment: boolean
}

interface ContainerFieldRow {
  id: number; key: string; role: string | null; sort_order: number
}

interface RelationshipFieldRow {
  id: number; key: string; role: string | null
}

// ── Transforms ─────────────────────────────────────────────────────────────

function toFieldConfig(row: DocumentFieldRow | PersonFieldRow): FieldConfig {
  const personRow = row as PersonFieldRow
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    role: row.role,
    badge: 'badge' in personRow ? personRow.badge : undefined,
    filterType: row.filter_type as FilterType | null,
    paramKey: row.param_key,
    showInTable: row.show_in_table,
    showInDetail: row.show_in_detail,
    isArray: row.is_array,
    hideOnMobile: row.hide_on_mobile,
    hideOnTablet: row.hide_on_tablet,
    format: row.format as 'date' | null,
    maxTableLength: row.max_table_length,
    showInDocSummary: row.show_in_doc_summary,
    showInEnrichment: 'show_in_enrichment' in personRow ? personRow.show_in_enrichment : undefined,
    sortOrder: row.sort_order,
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function requireField<T extends { role?: string | null }>(fields: T[], role: string, context: string): T {
  const field = fields.find((f) => f.role === role)
  if (!field) throw new Error(`Missing required field config: role "${role}" not found in ${context}`)
  return field
}

// ── System columns (internal — not editable via admin) ─────────────────────

export const FTS_COLUMN = 'fts' as const
export const VISIBILITY_COLUMN = 'visibility' as const

// ── Document config ────────────────────────────────────────────────────────

export async function getDocumentConfig() {
  'use cache'
  cacheLife('max')
  cacheTag('field-config')

  const { data, error } = await supabase
    .from('document_field_config')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(`Failed to load document field config: ${error.message}`)

  const FIELDS = ((data ?? []) as DocumentFieldRow[]).map(toFieldConfig)

  const TABLE_FIELDS              = FIELDS.filter((f) => f.showInTable)
  const DETAIL_FIELDS             = FIELDS.filter((f) => f.showInDetail)
  const FILTER_FIELDS             = FIELDS.filter((f) => f.filterType)
  const MULTISELECT_FILTER_FIELDS = FIELDS.filter((f) => f.filterType === 'multiselect')
  const TEXT_FILTER_FIELDS        = FIELDS.filter((f) => f.filterType === 'text')
  const DOC_SUMMARY_COLUMNS       = ['id', ...FIELDS.filter((f) => f.showInDocSummary).map((f) => f.key)].join(', ')

  const DATE_FILTER_FIELD   = requireField(FIELDS, 'primary-date', 'document_field_config')
  const SORT_DATE_KEY       = DATE_FILTER_FIELD.key
  const LOCATION_FIELD_KEY  = requireField(FIELDS, 'location', 'document_field_config').key
  const AUTHOR_FIELD_KEY    = requireField(FIELDS, 'author-ref', 'document_field_config').key
  const CONTAINER_FIELD_KEY = requireField(FIELDS, 'container-ref', 'document_field_config').key
  const CITE_AS_KEY         = requireField(FIELDS, 'citation', 'document_field_config').key
  const SOURCE_URL_KEY      = requireField(FIELDS, 'source-url', 'document_field_config').key
  const DOC_TITLE_KEY       = requireField(FIELDS, 'doc-title', 'document_field_config').key
  const DOC_NAME_TITLE_KEY  = requireField(FIELDS, 'doc-name-title', 'document_field_config').key
  const DOC_SUMMARY_KEY     = requireField(FIELDS, 'doc-summary', 'document_field_config').key
  const DOC_CATEGORY_KEY    = requireField(FIELDS, 'doc-category', 'document_field_config').key

  return {
    FIELDS, TABLE_FIELDS, DETAIL_FIELDS, FILTER_FIELDS, MULTISELECT_FILTER_FIELDS, TEXT_FILTER_FIELDS,
    DOC_SUMMARY_COLUMNS,
    DATE_FILTER_FIELD, SORT_DATE_KEY, LOCATION_FIELD_KEY,
    AUTHOR_FIELD_KEY, CONTAINER_FIELD_KEY, CITE_AS_KEY, SOURCE_URL_KEY,
    DOC_TITLE_KEY, DOC_NAME_TITLE_KEY, DOC_SUMMARY_KEY, DOC_CATEGORY_KEY,
  }
}

// ── Person config ──────────────────────────────────────────────────────────

export async function getPersonConfig() {
  'use cache'
  cacheLife('max')
  cacheTag('field-config')

  const { data, error } = await supabase
    .from('person_field_config')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(`Failed to load person field config: ${error.message}`)

  const FIELDS = ((data ?? []) as PersonFieldRow[]).map(toFieldConfig)

  const PERSON_TABLE_FIELDS              = FIELDS.filter((f) => f.showInTable)
  const PERSON_DETAIL_FIELDS             = FIELDS.filter((f) => f.showInDetail)
  const PERSON_FILTER_FIELDS             = FIELDS.filter((f) => f.filterType)
  const PERSON_MULTISELECT_FILTER_FIELDS = FIELDS.filter((f) => f.filterType === 'multiselect')
  const PERSON_TEXT_FILTER_FIELDS        = FIELDS.filter((f) => f.filterType === 'text')
  const PERSON_BADGE_FIELDS              = FIELDS.filter((f) => f.badge)
  const PERSON_BADGE_KEYS                = PERSON_BADGE_FIELDS.map((f) => f.key)
  const PERSON_ENRICHMENT_COLUMNS        = ['id', ...FIELDS.filter((f) => f.showInEnrichment).map((f) => f.key)].join(', ')

  const PERSON_SORT_KEY       = requireField(FIELDS, 'person-sort', 'person_field_config').key
  const PERSON_NAME_TITLE_KEY = requireField(FIELDS, 'person-name-title', 'person_field_config').key
  const PERSON_TITLE_KEY      = requireField(FIELDS, 'person-title', 'person_field_config').key
  const PERSON_TYPE_KEY       = requireField(FIELDS, 'person-type', 'person_field_config').key
  const PERSON_SUMMARY_KEY    = requireField(FIELDS, 'person-summary', 'person_field_config').key

  return {
    FIELDS, PERSON_TABLE_FIELDS, PERSON_DETAIL_FIELDS,
    PERSON_FILTER_FIELDS, PERSON_MULTISELECT_FILTER_FIELDS, PERSON_TEXT_FILTER_FIELDS,
    PERSON_BADGE_FIELDS, PERSON_BADGE_KEYS, PERSON_ENRICHMENT_COLUMNS,
    PERSON_SORT_KEY, PERSON_NAME_TITLE_KEY, PERSON_TITLE_KEY,
    PERSON_TYPE_KEY, PERSON_SUMMARY_KEY,
  }
}

// ── Container config ───────────────────────────────────────────────────────

export async function getContainerConfig() {
  'use cache'
  cacheLife('max')
  cacheTag('field-config')

  const { data, error } = await supabase
    .from('container_field_config')
    .select('*')
    .order('sort_order')

  if (error) throw new Error(`Failed to load container field config: ${error.message}`)

  const FIELDS = ((data ?? []) as ContainerFieldRow[]).map((r): ContainerFieldConfig => ({
    id: r.id, key: r.key, role: r.role, sortOrder: r.sort_order,
  }))

  const CONTAINER_SELECT_COLUMNS  = ['id', ...FIELDS.map((f) => f.key)].join(', ')
  const CONTAINER_NAME_TITLE_KEY  = requireField(FIELDS, 'container-name-title', 'container_field_config').key
  const CONTAINER_SHORT_NAME_KEY  = requireField(FIELDS, 'container-short-name', 'container_field_config').key
  const CONTAINER_TITLE_KEY       = requireField(FIELDS, 'container-title', 'container_field_config').key
  const CONTAINER_SUMMARY_KEY     = requireField(FIELDS, 'container-summary', 'container_field_config').key
  const CONTAINER_SOURCE_URL_KEY  = requireField(FIELDS, 'container-source-url', 'container_field_config').key

  return {
    FIELDS, CONTAINER_SELECT_COLUMNS,
    CONTAINER_NAME_TITLE_KEY, CONTAINER_SHORT_NAME_KEY, CONTAINER_TITLE_KEY,
    CONTAINER_SUMMARY_KEY, CONTAINER_SOURCE_URL_KEY,
  }
}

// ── Relationship config ────────────────────────────────────────────────────

export async function getRelationshipConfig() {
  'use cache'
  cacheLife('max')
  cacheTag('field-config')

  const { data, error } = await supabase
    .from('relationship_field_config')
    .select('*')

  if (error) throw new Error(`Failed to load relationship field config: ${error.message}`)

  const FIELDS = ((data ?? []) as RelationshipFieldRow[]).map((r): RelationshipFieldConfig => ({
    id: r.id, key: r.key, role: r.role,
  }))

  const RELATIONSHIP_SOURCE_KEY = requireField(FIELDS, 'relationship-source', 'relationship_field_config').key
  const RELATIONSHIP_TARGET_KEY = requireField(FIELDS, 'relationship-target', 'relationship_field_config').key
  const RELATIONSHIP_TYPE_KEY   = requireField(FIELDS, 'relationship-type', 'relationship_field_config').key

  return { FIELDS, RELATIONSHIP_SOURCE_KEY, RELATIONSHIP_TARGET_KEY, RELATIONSHIP_TYPE_KEY }
}
