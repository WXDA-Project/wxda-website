/**
 * PERSON FIELD CONFIG — single source of truth for person search and display.
 *
 * Mirrors the structure of field-config.ts but for the `persons` table.
 * To add, remove, or change a person filter or display field, edit ONLY this file.
 * No changes are needed in queries.ts, SearchFilters.tsx, or the search page.
 */

import type { FieldConfig } from './field-config'

export const PERSON_FIELDS: FieldConfig[] = [
  // ── Filter + table fields ──────────────────────────────────────────────────
  {
    key: 'person_type',
    label: 'Person Type',
    role: 'person-badge',
    filterType: 'multiselect',
    paramKey: 'person_type',
    filterOptions: ['Author', 'Subject of study', 'Wife'],
    showInTable: true,
    showInDetail: true,
    isArray: true,
    showInEnrichment: true,
  },
  {
    key: 'presumptive_sex',
    label: 'Presumptive Sex',
    role: 'person-badge',
    filterType: 'multiselect',
    paramKey: 'presumptive_sex',
    filterOptions: ['Female', 'Male'],
    showInTable: true,
    showInDetail: true,
    showInEnrichment: true,
  },
  {
    key: 'social_rank',
    label: 'Social Rank',
    role: 'person-badge',
    filterType: 'multiselect',
    paramKey: 'person_rank',
    filterOptions: [
      'Aristocrat',
      'Gentry',
      'Lower class',
      'Middling',
      'Noble',
      'Royal',
      'Social climber',
    ],
    showInTable: true,
    showInDetail: true,
    showInEnrichment: true,
  },
  {
    key: 'short_summary',
    label: 'Summary',
    showInTable: true,
    showInDetail: false, // rendered in the page header, not the detail dl
    maxTableLength: 140,
    showInEnrichment: true,
  },

  // ── Detail-only fields (mirrors PERSON_DISPLAY_FIELDS order) ──────────────
  { key: 'gender',                  label: 'Gender',                    showInTable: false, showInDetail: true },
  { key: 'given_names',             label: 'Given Names',               role: 'person-sort', showInTable: false, showInDetail: true, showInEnrichment: true },
  { key: 'honorific',               label: 'Honorific',                 showInTable: false, showInDetail: true, isArray: true },
  { key: 'name_title',              label: 'Name / Title(s)',           showInTable: false, showInDetail: true, isArray: true, showInEnrichment: true },
  { key: 'title',                   label: 'Title',                     showInTable: false, showInDetail: true, showInEnrichment: true },
  { key: 'alternate_name_s_title_s',label: 'Alternate Names / Titles', showInTable: false, showInDetail: true, isArray: true },
  { key: 'alternative_name',        label: 'Alternative Name',          showInTable: false, showInDetail: true },
  { key: 'crossdressing_name_s',    label: 'Cross-Dressing Name(s)',   showInTable: false, showInDetail: true, isArray: true },
  { key: 'pseudonym',               label: 'Pseudonym(s)',              showInTable: false, showInDetail: true, isArray: true },
  { key: 'notes',                   label: 'Notes',                     showInTable: false, showInDetail: true },
]

/** Fields shown as columns in the person search results table (after the Name column) */
export const PERSON_TABLE_FIELDS = PERSON_FIELDS.filter((f) => f.showInTable)

/** Fields shown in the person detail dl, in order */
export const PERSON_DETAIL_FIELDS = PERSON_FIELDS.filter((f) => f.showInDetail)

/** Person filter fields with a UI (all multiselect for persons) */
export const PERSON_FILTER_FIELDS = PERSON_FIELDS.filter((f) => f.filterType)

/** Multiselect-only person filter fields */
export const PERSON_MULTISELECT_FILTER_FIELDS = PERSON_FILTER_FIELDS.filter(
  (f) => f.filterType === 'multiselect',
)

// ── Semantic constants (derived via role / flags) ──────────────────────────

/** Column key used to ORDER BY person search results */
export const PERSON_SORT_KEY = PERSON_FIELDS.find((f) => f.role === 'person-sort')!.key

/** Fields shown as badge chips on the person detail page (in render order) */
export const PERSON_BADGE_FIELDS = PERSON_FIELDS.filter((f) => f.role === 'person-badge')

/** Column keys shown as badge chips on the person detail page */
export const PERSON_BADGE_KEYS = PERSON_BADGE_FIELDS.map((f) => f.key)

/**
 * SELECT column list for person enrichment queries (authors, mentioned persons).
 * Add `showInEnrichment: true` to a field above to include it automatically.
 */
export const PERSON_ENRICHMENT_COLUMNS = ['id', ...PERSON_FIELDS.filter((f) => f.showInEnrichment).map((f) => f.key)].join(', ')
