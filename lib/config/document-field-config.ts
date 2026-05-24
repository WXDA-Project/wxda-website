/**
 * DOCUMENT FIELD CONFIG — single source of truth for the WXDA website.
 *
 * Every field that appears on the search page or record detail page is
 * declared here. To add, remove, or rename a field — including making it
 * filterable — edit ONLY this file. The search filters, results table,
 * detail page, and query builder all derive from it automatically.
 */

export type FilterType = 'text' | 'date-range' | 'multiselect'

/**
 * Semantic role for fields that are referenced by code outside the generic
 * config-driven loops (e.g. the map, enrichment queries, person badges).
 * Adding a role lets downstream code import a stable constant instead of a
 * raw string, so renaming a column only requires changing `key` here.
 */
export type FieldRole =
  | 'primary-date'   // documents: main date column (ORDER BY, date-range filter)
  | 'location'       // documents: array of location mentions (used by the map)
  | 'author-ref'     // documents: FK array of author person IDs
  | 'container-ref'  // documents: FK ID of the containing publication
  | 'citation'       // documents: cite-as attribution string
  | 'source-url'     // documents: original source URL
  | 'doc-title'      // documents: verbatim title column
  | 'doc-name-title' // documents: display name/title column (preferred over title)
  | 'doc-summary'    // documents: short summary column
  | 'doc-category'   // documents: category array column
  | 'person-sort'         // persons: default ORDER BY column
  | 'person-type'         // persons: person type column (used in chips and enrichment)
  | 'person-name-title'   // persons: name/title component used in display name composition
  | 'person-title'        // persons: canonical full name (display name fallback)
  | 'person-summary'      // persons: short summary column

export interface FieldConfig {
  /** Column name in the `documents` (or `persons`) Supabase table */
  key: string
  /** Human-readable label shown on the website */
  label: string
  /** Semantic role — lets code import a stable constant rather than a raw string */
  role?: FieldRole
  /** True when this field is displayed as a badge chip (persons only) */
  badge?: boolean
  /**
   * Filter UI type to show in the search filter panel.
   * Omit (undefined) for fields that are display-only.
   */
  filterType?: FilterType
  /**
   * For `date-range` filters: earliest selectable date (ISO string).
   * Drives the `min` attribute on the date input and the timeline chart bounds.
   */
  minDate?: string
  /**
   * For `date-range` filters: latest selectable date (ISO string).
   * Drives the `max` attribute on the date input and the timeline chart bounds.
   */
  maxDate?: string
  /**
   * For `multiselect` filters: the list of available options.
   * Sourced from the distinct values that appear in the database.
   */
  filterOptions?: string[]
  /**
   * URL query-parameter key used to encode this filter.
   * Required when filterType is set.
   */
  paramKey?: string
  /** Show this field as a column in the search results table */
  showInTable: boolean
  /** Show this field on the record detail page */
  showInDetail: boolean
  /** True when the DB column is a text[] array */
  isArray?: boolean
  /** Hide this table column on small screens (< 640px) */
  hideOnMobile?: boolean
  /** Hide this table column on tablet and smaller (< 1024px) */
  hideOnTablet?: boolean
  /**
   * Display format applied when rendering this field's value.
   * 'date' → format as a localised date string.
   */
  format?: 'date'
  /**
   * Maximum characters to show in a table cell before truncating.
   * Defaults to 60 if unset.
   */
  maxTableLength?: number
  /**
   * True when this field is rendered in a dedicated enriched section
   * on the record detail page (e.g. Publication, Author, Summary).
   * Enriched fields are skipped in the generic key-value detail list.
   */
  enriched?: boolean
  /**
   * Include this field in the compact document summary SELECT used when
   * listing a person's mentioned/authored documents on the person detail page.
   */
  showInDocSummary?: boolean
  /**
   * Include this field in the person enrichment SELECT used when fetching
   * person records referenced from documents (authors, mentioned persons).
   * Only meaningful on fields in person-field-config.ts.
   */
  showInEnrichment?: boolean
}

export const FIELDS: FieldConfig[] = [
  // ── Results-table fields (order determines column order) ──────────────────
  {
    key: 'date',
    label: 'Date',
    role: 'primary-date',
    filterType: 'date-range',
    paramKey: 'date',
    minDate: '1785-01-01',
    maxDate: '1848-12-31',
    format: 'date',
    showInTable: true,
    showInDetail: true,
    showInDocSummary: true,
  },
  {
    key: 'short_summary',
    label: 'Summary',
    role: 'doc-summary',
    showInTable: true,
    showInDetail: true,
    enriched: true,
    maxTableLength: 140,
    showInDocSummary: true,
  },
  {
    key: 'provisional_category',
    label: 'Category',
    role: 'doc-category',
    showInDocSummary: true,
    filterType: 'multiselect',
    paramKey: 'category',
    showInTable: true,
    showInDetail: true,
    isArray: true,
    hideOnMobile: true,
  },
  {
    key: 'crossdressing_activities',
    label: 'Cross-Dressing Activities',
    filterType: 'multiselect',
    paramKey: 'activities',
    showInTable: true,
    showInDetail: true,
    isArray: true,
    hideOnTablet: true,
  },
  {
    key: 'locations_mentioned',
    label: 'Locations',
    role: 'location',
    showInTable: true,
    showInDetail: true,
    isArray: true,
    hideOnTablet: true,
  },

  // ── Filter-only fields (not shown in table, but available as filters) ─────
  {
    key: 'topics',
    label: 'Primary Topics',
    filterType: 'multiselect',
    paramKey: 'topics',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'motive',
    label: 'Motive',
    filterType: 'multiselect',
    paramKey: 'motive',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'attire',
    label: 'Attire',
    filterType: 'multiselect',
    paramKey: 'attire',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'item_format',
    label: 'Item Format',
    filterType: 'multiselect',
    paramKey: 'format',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'social_rank',
    label: 'Social Rank',
    filterType: 'multiselect',
    paramKey: 'social_rank',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'crossdressing_occupation',
    label: 'Cross-Dressing Occupation',
    filterType: 'multiselect',
    paramKey: 'occupation',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },

  // ── Detail-only fields (display on record page only) ──────────────────────
  {
    key: 'title',
    label: 'Title',
    role: 'doc-title',
    showInTable: false,
    showInDetail: true,
    enriched: true,
    showInDocSummary: true,
  },
  {
    key: 'name_title',
    label: 'Name / Title',
    role: 'doc-name-title',
    showInTable: false,
    showInDetail: true,
    enriched: true,
    showInDocSummary: true,
  },
  {
    key: 'source',
    label: 'Source',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'container',
    label: 'Publication / Container',
    role: 'container-ref',
    showInTable: false,
    showInDetail: true,
    enriched: true,
  },
  {
    key: 'author_or_creator',
    label: 'Author / Creator',
    role: 'author-ref',
    showInTable: false,
    showInDetail: true,
    isArray: true,
    enriched: true,
  },
  {
    key: 'discovery_of_crossdressing',
    label: 'Discovery of Cross-Dressing',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'gender_manifestation',
    label: 'Gender Manifestation',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'motive_stated_by_main_protagonist',
    label: 'Stated Motive (Protagonist)',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'stated_sex',
    label: 'Stated Sex',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'sex_perceived_by_others',
    label: 'Sex Perceived by Others',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'sex_perceived_by_recorder',
    label: 'Sex Perceived by Recorder',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'sexuality',
    label: 'Sexuality',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'racialization',
    label: 'Racialization',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'age_in_record',
    label: 'Age in Record',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'described_age_in_record',
    label: 'Described Age in Record',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'tone_of_the_report',
    label: 'Tone of Report',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'venue',
    label: 'Venue',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'report_scope',
    label: 'Report Scope',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'report_size',
    label: 'Report Size',
    showInTable: false,
    showInDetail: true,
  },
  {
    key: 'colonial_agency',
    label: 'Colonial Agency',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'keyword',
    label: 'Keywords',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'secondary_protagonists',
    label: 'Secondary Protagonists',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'alternate_name_s_title_s',
    label: 'Alternate Names / Titles',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'related_image',
    label: 'Related Images',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'column_s',
    label: 'Column(s)',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'page_numbers',
    label: 'Page Numbers',
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },

  // ── Citation / source fields (custom rendering in record footer) ──────────
  {
    key: 'cite_as',
    label: 'Cite as',
    role: 'citation',
    showInTable: false,
    showInDetail: false,
  },
  {
    key: 'url',
    label: 'Source URL',
    role: 'source-url',
    showInTable: false,
    showInDetail: false,
  },
]

// De-duplicate by key (crossdressing_occupation appears in both filter and detail sections)
const seen = new Set<string>()
export const UNIQUE_FIELDS = FIELDS.filter((f) => {
  if (seen.has(f.key)) return false
  seen.add(f.key)
  return true
})

/** Fields shown as columns in the search results table, in order */
export const TABLE_FIELDS = UNIQUE_FIELDS.filter((f) => f.showInTable)

/** Fields shown in the record detail page, in order */
export const DETAIL_FIELDS = UNIQUE_FIELDS.filter((f) => f.showInDetail)

/** Fields that have a filter UI, in order */
export const FILTER_FIELDS = FIELDS.filter((f) => f.filterType)

/** Multiselect filter fields only (filterType === 'multiselect'), in sidebar order */
export const MULTISELECT_FILTER_FIELDS = FILTER_FIELDS.filter(
  (f) => f.filterType === 'multiselect',
)

/** Quick lookup: field key → config */
export const FIELD_MAP = Object.fromEntries(UNIQUE_FIELDS.map((f) => [f.key, f]))

/**
 * Set of field keys that are rendered in dedicated enriched sections on the
 * record detail page and therefore skipped in the generic key-value detail list.
 */
export const ENRICHED_KEYS = new Set(UNIQUE_FIELDS.filter((f) => f.enriched).map((f) => f.key))

// ── System column names (internal DB structure, not user-facing fields) ────

/** tsvector column used for full-text search */
export const FTS_COLUMN = 'fts' as const
/** Row-visibility gate; only rows with 'public' are served to the public site */
export const VISIBILITY_COLUMN = 'visibility' as const

// ── Semantic field lookups via role ────────────────────────────────────────
// Downstream code imports these constants instead of raw strings, so renaming
// a column only requires updating `key` in the field entry above.

/** Config entry for the primary date field (drives ORDER BY and date-range filter) */
export const DATE_FILTER_FIELD   = UNIQUE_FIELDS.find((f) => f.role === 'primary-date')!
/** Column key used for document ordering and date-range queries */
export const SORT_DATE_KEY       = DATE_FILTER_FIELD.key
/** Column key for the location-mentions array (used by the map feature) */
export const LOCATION_FIELD_KEY  = UNIQUE_FIELDS.find((f) => f.role === 'location')!.key
/** Column key for the author/creator FK array */
export const AUTHOR_FIELD_KEY    = UNIQUE_FIELDS.find((f) => f.role === 'author-ref')!.key
/** Column key for the container/publication FK */
export const CONTAINER_FIELD_KEY = UNIQUE_FIELDS.find((f) => f.role === 'container-ref')!.key
/** Column key for the cite-as attribution string */
export const CITE_AS_KEY         = UNIQUE_FIELDS.find((f) => f.role === 'citation')!.key
/** Column key for the original source URL */
export const SOURCE_URL_KEY      = UNIQUE_FIELDS.find((f) => f.role === 'source-url')!.key

/** Compact SELECT column list for document summaries (person detail page document lists) */
export const DOC_SUMMARY_COLUMNS = ['id', ...UNIQUE_FIELDS.filter((f) => f.showInDocSummary).map((f) => f.key)].join(', ')

// ── Semantic field lookups for document display ────────────────────────────

/** Column key for the verbatim title (full journal title, fallback display) */
export const DOC_TITLE_KEY      = UNIQUE_FIELDS.find((f) => f.role === 'doc-title')!.key
/** Column key for the preferred display name/title (shown first, may be shorter) */
export const DOC_NAME_TITLE_KEY = UNIQUE_FIELDS.find((f) => f.role === 'doc-name-title')!.key
/** Column key for the document short summary */
export const DOC_SUMMARY_KEY    = UNIQUE_FIELDS.find((f) => f.role === 'doc-summary')!.key
/** Column key for the document category array */
export const DOC_CATEGORY_KEY   = UNIQUE_FIELDS.find((f) => f.role === 'doc-category')!.key
