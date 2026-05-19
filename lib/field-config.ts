/**
 * FIELD CONFIG — single source of truth for the WXDA website.
 *
 * Every field that appears on the search page or record detail page is
 * declared here. To add, remove, or rename a field — including making it
 * filterable — edit ONLY this file. The search filters, results table,
 * detail page, and query builder all derive from it automatically.
 */

export type FilterType = 'text' | 'date-range' | 'multiselect'

export interface FieldConfig {
  /** Column name in the `documents` Supabase table */
  key: string
  /** Human-readable label shown on the website */
  label: string
  /**
   * Filter UI type to show in the search filter panel.
   * Omit (undefined) for fields that are display-only.
   */
  filterType?: FilterType
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
}

export const FIELDS: FieldConfig[] = [
  // ── Results-table fields (order determines column order) ──────────────────
  {
    key: 'date',
    label: 'Date',
    filterType: 'date-range',
    paramKey: 'date',
    format: 'date',
    showInTable: true,
    showInDetail: true,
  },
  {
    key: 'short_summary',
    label: 'Summary',
    showInTable: true,
    showInDetail: true,
    enriched: true,
    maxTableLength: 140,
  },
  {
    key: 'provisional_category',
    label: 'Category',
    filterType: 'multiselect',
    paramKey: 'category',
    filterOptions: [
      'Breeches Actor',
      'Counterfeit Bridegroom',
      'Criminal',
      'Female Husband',
      'Male Wife/Mistress',
      'Political Agent',
      'Practical Joker',
      'Woman Warrior',
      'Woman Worker',
    ],
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
    filterOptions: [
      'Amusement',
      'Begging',
      'Crime',
      'Female emancipation',
      'Gender transition',
      'Jest',
      'Marriage',
      'Military service',
      'Politics',
      'Romance',
      'Sexual relations',
      'Work',
    ],
    showInTable: true,
    showInDetail: true,
    isArray: true,
    hideOnTablet: true,
  },
  {
    key: 'locations_mentioned',
    label: 'Locations',
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
    filterOptions: [
      'Amazon/Amazonian',
      'Ballad pattern',
      'Compared to a cross-dresser',
      'Confidence trick',
      'Criminalized cross-dressing',
      'Dressed as a man',
      'Dressed as a woman',
      'Entry to proscribed space',
      'Escape in disguise',
      'Female husband',
      'Fictional',
      'Industrious',
      'Insult target',
      'Legal proscription',
      'Masquerade',
      'Occupational purpose',
      'Perfect woman/perfect man',
      'Practical joke',
      'Pregnancy',
      'Protest in disguise',
      'Pursues husband/lover',
      'Religious proscription',
      'Seeks marriage',
      'Stratagem',
      'Theatre',
      'Unmentionable (sodomy/buggery)',
      'Woman-hating',
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'motive',
    label: 'Motive',
    filterType: 'multiselect',
    paramKey: 'motive',
    filterOptions: [
      'Crime',
      'Curiosity',
      'Escape',
      'Jest',
      'Justice',
      'Livelihood',
      'Marriage',
      'Masquerade',
      'Necessity',
      'Patriotism',
      'Politics',
      'Recreation',
      'Revenge',
      'Romance',
      'Safety',
      'Sexual relations',
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'attire',
    label: 'Attire',
    filterType: 'multiselect',
    paramKey: 'attire',
    filterOptions: [
      'Breeches part',
      'Drummer clothes',
      'Female garb',
      'Gender neutral garb',
      'Male garb',
      'Masquerade garb',
      'Petticoats',
      'Sailor clothes',
      'Soldier clothes',
      'Theatrical',
      "Wife's clothes",
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'item_format',
    label: 'Item Format',
    filterType: 'multiselect',
    paramKey: 'format',
    filterOptions: [
      'Anecdote',
      'Crime Report',
      'Editorial',
      'Extraordinary event',
      'History',
      'Inquest report',
      'Jest',
      'Letter',
      'Letter to the editor',
      'Medical Case',
      'Memoir',
      'News report',
      'Poem',
      'Political news',
      'Story',
      'Theatre review',
      'Trial report',
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'social_rank',
    label: 'Social Rank',
    filterType: 'multiselect',
    paramKey: 'social_rank',
    filterOptions: [
      'Aristocrat',
      'Gentry',
      'Lower class',
      'Middling',
      'Noble',
      'Royal',
      'Social climber',
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'crossdressing_occupation',
    label: 'Cross-Dressing Occupation',
    filterType: 'multiselect',
    paramKey: 'occupation',
    filterOptions: [
      'Actor',
      'Army',
      'Beggar',
      'Husbandry',
      'Labourer',
      'Military',
      'Navy',
      'Paver',
      'Seaman',
      'Servant',
      'Sex worker',
      'Shepherd',
      'Teacher',
      'Thief',
    ],
    showInTable: false,
    showInDetail: true,
    isArray: true,
  },

  // ── Detail-only fields (display on record page only) ──────────────────────
  {
    key: 'title',
    label: 'Title',
    showInTable: false,
    showInDetail: true,
    enriched: true,
  },
  {
    key: 'name_title',
    label: 'Name / Title',
    showInTable: false,
    showInDetail: true,
    enriched: true,
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
    showInTable: false,
    showInDetail: true,
    enriched: true,
  },
  {
    key: 'author_or_creator',
    label: 'Author / Creator',
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
]

// De-duplicate by key (crossdressing_occupation appears in both filter and detail sections)
const seen = new Set<string>()
const UNIQUE_FIELDS = FIELDS.filter((f) => {
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
