# person-field-config.ts

Single source of truth for every field that appears in the WXDA person search, results table, and person detail page.

See [`document-field-config.md`](./document-field-config.md) for the full `FieldConfig` interface reference and the general pattern — this document covers only what is specific to persons.

---

## How it works

`PERSON_FIELDS` is an array of `FieldConfig` objects (the same interface used by `document-field-config.ts`). Derived exports are computed from it at module load time. The search page, filter sidebar, results table, and person detail page all consume those exports — editing this array is the only change needed.

Filter options (the checkbox values in the sidebar) are **not** hardcoded here. They are fetched at runtime from the database via `getPersonFilterOptions()` in `lib/queries/filters.ts`, cached for one hour, and passed as a prop to `SearchFilters`.

---

## Derived exports

| Export | Type | Used by | Description |
|---|---|---|---|
| `PERSON_TABLE_FIELDS` | `FieldConfig[]` | `app/search/page.tsx` | Fields with `showInTable: true` → columns in the person search results table (the Name column is always prepended separately). |
| `PERSON_DETAIL_FIELDS` | `FieldConfig[]` | `app/person/[id]/page.tsx` | Fields with `showInDetail: true`, in declaration order → detail key-value list. |
| `PERSON_FILTER_FIELDS` | `FieldConfig[]` | `SearchFilters.tsx`, `app/search/page.tsx` | Fields with a `filterType` set → all person filter controls. |
| `PERSON_MULTISELECT_FILTER_FIELDS` | `FieldConfig[]` | `queries/persons.ts`, `app/search/page.tsx` | Subset of `PERSON_FILTER_FIELDS` with `filterType === 'multiselect'`. |
| `PERSON_SORT_KEY` | `string` | `queries/persons.ts` | Column key for ORDER BY in person search. Derived from the field with `role: 'person-sort'`. |
| `PERSON_NAME_TITLE_KEY` | `string` | `queries/types.ts` | Column key for the name/title array used in display name composition. Derived from `role: 'person-name-title'`. |
| `PERSON_TITLE_KEY` | `string` | `queries/types.ts` | Column key for the canonical full name fallback. Derived from `role: 'person-title'`. |
| `PERSON_TYPE_KEY` | `string` | `app/record/[id]/page.tsx` | Column key for person type — used in badge chips on the record detail page. Derived from `role: 'person-type'`. |
| `PERSON_SUMMARY_KEY` | `string` | `app/record/[id]/page.tsx`, `app/person/[id]/page.tsx` | Column key for the person short summary. Derived from `role: 'person-summary'`. |
| `PERSON_BADGE_FIELDS` | `FieldConfig[]` | `app/person/[id]/page.tsx` | Fields with `badge: true`, in declaration order → badge chips in the person page header. The first badge field is styled as primary (bold, coloured); subsequent ones are muted. |
| `PERSON_BADGE_KEYS` | `string[]` | — | Column keys of `PERSON_BADGE_FIELDS`. Convenience alias when only the key is needed. |
| `PERSON_ENRICHMENT_COLUMNS` | `string` | `queries/documents.ts`, `queries/persons.ts` | Comma-separated SELECT string of `id` + all `showInEnrichment: true` fields. Used when fetching person records referenced from documents (authors, mentioned persons). |

---

## Person-specific flags

### `role: 'person-sort'`

Marks the field used to ORDER BY person search results. Exactly one field should carry this role.

### `badge: true`

Fields with `badge: true` are rendered as badge chips in the person page header, in declaration order. The first badge field gets a bold coloured style; all others get a muted style. Use this for categorical fields like person type, sex, and social rank.

### `role: 'person-type'`

The person type field specifically — also used in `PersonChip` on the record detail page when displaying mentioned persons.

### `role: 'person-name-title'` / `role: 'person-title'` / `role: 'person-summary'`

These roles mark the fields consumed by `personDisplayName()` and `PERSON_SUMMARY_KEY` in `lib/queries/types.ts`. Exactly one field should carry each role.

### `showInEnrichment: true`

Includes the field in `PERSON_ENRICHMENT_COLUMNS` — the SELECT used when looking up persons referenced from documents (e.g. authors on the record detail page, mentioned persons). Add this to any field needed for rendering a person's display name or badge chips in non-person contexts.

---

## Common tasks

### Add a new person filter

Add an entry with `filterType: 'multiselect'` and a unique `paramKey`. Set `isArray: true` if the column is a text array:

```ts
{
  key: 'occupation',
  label: 'Occupation',
  filterType: 'multiselect',
  paramKey: 'occupation',
  showInTable: false,
  showInDetail: true,
  isArray: true,
},
```

The filter appears in the persons tab sidebar automatically. Distinct option values are fetched from the database — no list to maintain.

### Add a new person detail field

Add an entry with `showInDetail: true` and `filterType` omitted:

```ts
{
  key: 'birth_year',
  label: 'Birth Year',
  showInTable: false,
  showInDetail: true,
},
```

### Show a field as a badge chip

Set `badge: true`. Badge fields appear in the header on the person detail page and in the PDF subtitle. Declaration order determines chip order; the first badge field in the array is the primary (bold, coloured):

```ts
{
  key: 'marital_status',
  label: 'Marital Status',
  badge: true,
  showInTable: true,
  showInDetail: true,
  showInEnrichment: true,
},
```

### Change the sort column

Move `role: 'person-sort'` from the current field to the desired one. Only one field should carry this role at a time.

### Include a field when persons are referenced from documents

Set `showInEnrichment: true`. This adds the column to `PERSON_ENRICHMENT_COLUMNS`, which is used in `getDocumentEnrichment()` and `getPersonDocuments()`. Add this to any field needed for rendering a person's display name or badge chips in non-person contexts:

```ts
{
  key: 'given_names',
  label: 'Given Names',
  role: 'person-sort',
  showInEnrichment: true,
  showInTable: false,
  showInDetail: true,
},
```

### Rename a database column

Change `key` in the relevant entry. All queries and display code automatically pick up the new name through the derived constants.

---

## Display name construction

`personDisplayName()` in `lib/queries/types.ts` builds the best available name from a `PersonSummary` object using fields identified by their roles (in priority order):

1. `given_names` (`role: 'person-sort'`) + first value of `name_title` (`role: 'person-name-title'`)
2. `given_names` alone
3. `name_title` alone
4. `title` (`role: 'person-title'`)
5. `Person #<id>`

All fields used here carry `showInEnrichment: true` so they are always included in enrichment SELECTs. If you add a new role for display name construction, update `personDisplayName()` accordingly.

---

## Relationship to `document-field-config.ts`

`person-field-config.ts` imports the `FieldConfig` type from `document-field-config.ts` but otherwise has no runtime dependency on it. The two files are independent: the documents config drives the Records tab; the persons config drives the Persons tab. System column constants (`FTS_COLUMN`, `VISIBILITY_COLUMN`) are defined in `document-field-config.ts` and imported by the query files — person queries reuse them since both tables use the same visibility pattern.
