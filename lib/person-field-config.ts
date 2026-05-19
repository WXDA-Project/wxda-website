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
    filterType: 'multiselect',
    paramKey: 'person_type',
    filterOptions: ['Author', 'Subject of study', 'Wife'],
    showInTable: true,
    showInDetail: true,
    isArray: true,
  },
  {
    key: 'presumptive_sex',
    label: 'Presumptive Sex',
    filterType: 'multiselect',
    paramKey: 'presumptive_sex',
    filterOptions: ['Female', 'Male'],
    showInTable: true,
    showInDetail: true,
  },
  {
    key: 'social_rank',
    label: 'Social Rank',
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
  },
  {
    key: 'short_summary',
    label: 'Summary',
    showInTable: true,
    showInDetail: false, // rendered in the page header, not the detail dl
    maxTableLength: 140,
  },

  // ── Detail-only fields (mirrors PERSON_DISPLAY_FIELDS order) ──────────────
  { key: 'gender',                  label: 'Gender',                    showInTable: false, showInDetail: true },
  { key: 'given_names',             label: 'Given Names',               showInTable: false, showInDetail: true },
  { key: 'honorific',               label: 'Honorific',                 showInTable: false, showInDetail: true, isArray: true },
  { key: 'name_title',              label: 'Name / Title(s)',           showInTable: false, showInDetail: true, isArray: true },
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
