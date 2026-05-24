# document-field-config.ts

Single source of truth for every field that appears in the WXDA document search, results table, and record detail page. Editing this file is the **only** change needed to add, remove, rename, or reconfigure a document field — nothing else in the codebase needs to change.

---

## How it works

`FIELDS` is an array of `FieldConfig` objects. Everything the UI and query layer needs is derived from that array at module load time: which columns to SELECT, which filters to render, which fields to show in the table or detail page, what the date-range bounds are, and so on.

Downstream code imports the pre-derived constants (e.g. `TABLE_FIELDS`, `SORT_DATE_KEY`) rather than the raw array, so there are no hardcoded column names anywhere outside `lib/config/`.

---

## The `FieldConfig` interface

| Property | Type | Required | Description |
|---|---|---|---|
| `key` | `string` | yes | Column name in the Supabase table. The only value that must match the database. |
| `label` | `string` | yes | Human-readable label shown in filter panels, table headers, and detail pages. |
| `role` | `FieldRole` | no | Semantic tag used to derive stable constants (see [Roles](#fieldrole-values) below). |
| `badge` | `boolean` | no | (Persons only) Render this field as a badge chip in the person page header. |
| `filterType` | `'text' \| 'date-range' \| 'multiselect'` | no | Filter UI to render. Omit for display-only fields. |
| `minDate` | `string` | no | Earliest date for a `date-range` filter (ISO, e.g. `'1785-01-01'`). Also drives the timeline chart lower bound. |
| `maxDate` | `string` | no | Latest date for a `date-range` filter. Also drives the timeline chart upper bound. |
| `paramKey` | `string` | no | URL query-parameter key for this filter. Required when `filterType` is set. |
| `showInTable` | `boolean` | yes | Include this field as a column in the search results table. |
| `showInDetail` | `boolean` | yes | Include this field in the record detail key-value list. |
| `isArray` | `boolean` | no | True when the database column is a `text[]` array. Affects how multiselect filters are applied (`overlaps` vs `in`) and how values are rendered. |
| `hideOnMobile` | `boolean` | no | Hide this table column on screens narrower than 640 px. |
| `hideOnTablet` | `boolean` | no | Hide this table column on screens narrower than 1024 px. |
| `format` | `'date'` | no | Render the value as a localised date string instead of plain text. |
| `maxTableLength` | `number` | no | Truncate table cell text to this many characters (default 60). |
| `enriched` | `boolean` | no | This field is rendered in a dedicated section on the record detail page (e.g. Publication, Author). Enriched fields are skipped in the generic key-value list to avoid duplication. |
| `showInDocSummary` | `boolean` | no | Include this column in the compact SELECT used when listing a person's associated documents on the person detail page. |
| `showInEnrichment` | `boolean` | no | (Persons only) Include this field in the person enrichment SELECT. See `person-field-config.md`. |

---

## `FieldRole` values

Roles let code import a stable named constant instead of a raw column string. If you rename a column, you only change `key` here — every consumer automatically gets the new name.

### Document roles

| Role | What it marks | Derived constant |
|---|---|---|
| `'primary-date'` | Main date column — ORDER BY and date-range filtering | `SORT_DATE_KEY`, `DATE_FILTER_FIELD` |
| `'location'` | Array of location mentions — used by the map feature | `LOCATION_FIELD_KEY` |
| `'author-ref'` | FK array of author person IDs | `AUTHOR_FIELD_KEY` |
| `'container-ref'` | FK ID of the containing publication | `CONTAINER_FIELD_KEY` |
| `'citation'` | Cite-as attribution string — rendered in the record footer | `CITE_AS_KEY` |
| `'source-url'` | Original source URL — rendered in the record footer | `SOURCE_URL_KEY` |
| `'doc-title'` | Verbatim full title column | `DOC_TITLE_KEY` |
| `'doc-name-title'` | Preferred display name/title (shown before `title`) | `DOC_NAME_TITLE_KEY` |
| `'doc-summary'` | Short editorial summary | `DOC_SUMMARY_KEY` |
| `'doc-category'` | Category array | `DOC_CATEGORY_KEY` |

### Person roles (declared here, used in `person-field-config.ts`)

| Role | What it marks | Derived constant |
|---|---|---|
| `'person-sort'` | Default ORDER BY column for person search | `PERSON_SORT_KEY` |
| `'person-type'` | Person type column — used in badge chips | `PERSON_TYPE_KEY` |
| `'person-name-title'` | Name/title component used in display name composition | `PERSON_NAME_TITLE_KEY` |
| `'person-title'` | Canonical full name — display name fallback | `PERSON_TITLE_KEY` |
| `'person-summary'` | Person short summary | `PERSON_SUMMARY_KEY` |

Only one field should carry each role. The derived constants use `Array.find()` and will throw at startup (`!` assertion) if the role is missing.

---

## Derived exports

These are computed once from `FIELDS` and re-exported for use across the codebase.

| Export | Type | Used by | Description |
|---|---|---|---|
| `UNIQUE_FIELDS` | `FieldConfig[]` | `queries/documents.ts` | De-duplicated field list (a field declared in both a filter section and a detail section only appears once). |
| `TABLE_FIELDS` | `FieldConfig[]` | `app/search/page.tsx` | Fields with `showInTable: true`, in declaration order → table columns. |
| `DETAIL_FIELDS` | `FieldConfig[]` | `app/record/[id]/page.tsx` | Fields with `showInDetail: true`, in declaration order → detail key-value list. |
| `FILTER_FIELDS` | `FieldConfig[]` | `SearchFilters.tsx` | Fields with a `filterType` set → all filter controls. |
| `MULTISELECT_FILTER_FIELDS` | `FieldConfig[]` | `queries/documents.ts`, `app/search/page.tsx` | Subset of `FILTER_FIELDS` with `filterType === 'multiselect'` → checkbox filters. |
| `FIELD_MAP` | `Record<string, FieldConfig>` | — | Key → config lookup for direct field access by column name. |
| `ENRICHED_KEYS` | `Set<string>` | `app/record/[id]/page.tsx` | Keys of fields with `enriched: true` → skipped in the generic detail list. |
| `DOC_SUMMARY_COLUMNS` | `string` | `queries/persons.ts` | Comma-separated SELECT string of `id` + all `showInDocSummary: true` fields. Used when fetching a person's associated documents. |
| `DATE_FILTER_FIELD` | `FieldConfig` | `SearchFilters.tsx`, `TimelineChart.tsx` | Full config entry for the `'primary-date'` role field. |
| `SORT_DATE_KEY` | `string` | `queries/documents.ts` | Column key for ORDER BY and date-range queries. |
| `LOCATION_FIELD_KEY` | `string` | `queries/map.ts` | Column key for the location array (map feature). |
| `AUTHOR_FIELD_KEY` | `string` | `queries/documents.ts`, `app/record/[id]/page.tsx` | Column key for the author FK array. |
| `CONTAINER_FIELD_KEY` | `string` | `queries/documents.ts`, `app/record/[id]/page.tsx` | Column key for the container FK. |
| `CITE_AS_KEY` | `string` | `app/record/[id]/page.tsx` | Column key for the cite-as string. |
| `SOURCE_URL_KEY` | `string` | `app/record/[id]/page.tsx` | Column key for the source URL. |
| `DOC_TITLE_KEY` | `string` | `queries/map.ts`, `queries/types.ts`, `app/record/[id]/page.tsx` | Column key for the verbatim title. |
| `DOC_NAME_TITLE_KEY` | `string` | `queries/map.ts`, `queries/types.ts` | Column key for the preferred display name/title. |
| `DOC_SUMMARY_KEY` | `string` | `app/record/[id]/page.tsx`, `app/person/[id]/page.tsx` | Column key for the document short summary. |
| `DOC_CATEGORY_KEY` | `string` | `app/person/[id]/page.tsx` | Column key for the category array. |
| `FTS_COLUMN` | `'fts'` | `queries/documents.ts`, `queries/persons.ts` | Name of the tsvector full-text search column. |
| `VISIBILITY_COLUMN` | `'visibility'` | `queries/` (all files) | Row-visibility gate column. Queries always add `.eq(VISIBILITY_COLUMN, 'public')`. |

---

## Common tasks

### Add a new multiselect filter

Add an entry to `FIELDS` with `filterType: 'multiselect'`, a unique `paramKey`, and `isArray: true` if the column is a text array:

```ts
{
  key: 'my_new_column',
  label: 'My New Filter',
  filterType: 'multiselect',
  paramKey: 'my_filter',
  showInTable: false,
  showInDetail: true,
  isArray: true,
},
```

That's it. The filter appears automatically in the sidebar, the URL parameter is handled, the query applies `overlaps()` (array) or `in()` (scalar), and distinct options are fetched from the database at runtime. No changes needed in `queries/`, `SearchFilters.tsx`, or the search page.

### Add a display-only field (no filter)

Add an entry with `filterType` omitted and `showInDetail: true`:

```ts
{
  key: 'new_column',
  label: 'New Column',
  showInTable: false,
  showInDetail: true,
},
```

The field appears in the record detail key-value list automatically.

### Show a field in the search results table

Set `showInTable: true`. For wide values, also set `hideOnMobile` or `hideOnTablet`. Use `maxTableLength` to cap cell width:

```ts
{
  key: 'short_summary',
  label: 'Summary',
  showInTable: true,
  showInDetail: true,
  maxTableLength: 140,
  hideOnMobile: true,
},
```

### Rename a database column

Change `key` in the relevant entry. Everything else — queries, filters, display — updates automatically because all consumers import the derived constants, not raw strings.

### Change the date-range bounds

Update `minDate` and `maxDate` on the `'primary-date'` role field. Both the filter inputs and the timeline chart derive their bounds from these values.

### Mark a field as enriched

Fields rendered in dedicated sections on the record detail page (Summary, Publication, Author) should be marked `enriched: true` so they are skipped in the generic key-value list:

```ts
{
  key: 'author_or_creator',
  label: 'Author / Creator',
  role: 'author-ref',
  enriched: true,
  showInTable: false,
  showInDetail: true,
  isArray: true,
},
```

### Include a field in the person-detail document list

Set `showInDocSummary: true` on any field that should appear when listing documents on a person's page. This adds the column to `DOC_SUMMARY_COLUMNS`, which is used in `getPersonDocuments()`.

### Assign a semantic role

If a new field needs to be referenced by a stable constant elsewhere in the code, add a role to `FieldRole` and export a constant at the bottom of the file:

```ts
// In FieldRole:
| 'my-role'

// In FIELDS:
{ key: 'my_special_col', role: 'my-role', ... }

// At the bottom of document-field-config.ts:
export const MY_SPECIAL_KEY = UNIQUE_FIELDS.find((f) => f.role === 'my-role')!.key
```

---

## Field ordering

Fields are rendered in the order they appear in `FIELDS`. Table columns, detail rows, and filter groups all follow declaration order. Move entries up or down in the array to reorder them.

---

## System columns (`FTS_COLUMN`, `VISIBILITY_COLUMN`)

These are not user-facing fields and are not in `FIELDS`. They represent internal database structure:

- `FTS_COLUMN` (`'fts'`) — the generated tsvector column used by `.textSearch()`.
- `VISIBILITY_COLUMN` (`'visibility'`) — the publication gate; queries always add `.eq(VISIBILITY_COLUMN, 'public')`.

They are defined here rather than inline in `queries/` so that renaming them is still a single-file change.
