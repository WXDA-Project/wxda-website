# container-field-config.ts

Single source of truth for the columns fetched from the `containers` table. The containers table holds publications, journals, and series that documents belong to.

---

## How it works

`CONTAINER_FIELDS` is a small internal array of `{ key, role? }` objects. It drives two things:

1. **`CONTAINER_SELECT_COLUMNS`** — the comma-separated SELECT string used in `getDocumentEnrichment()` to fetch container rows from Supabase.
2. **Semantic key constants** — stable named constants (e.g. `CONTAINER_NAME_TITLE_KEY`) used wherever container data is rendered, so renaming a column only requires changing `key` here.

---

## Roles and derived constants

| Role | Column (current) | Constant | Used by |
|---|---|---|---|
| `'container-name-title'` | `name_title` | `CONTAINER_NAME_TITLE_KEY` | `containerDisplayName()`, `ContainerCard`, PDF |
| `'container-short-name'` | `short_name` | `CONTAINER_SHORT_NAME_KEY` | `ContainerCard`, PDF |
| `'container-title'` | `title` | `CONTAINER_TITLE_KEY` | `containerDisplayName()` (fallback) |
| `'container-summary'` | `short_summary` | `CONTAINER_SUMMARY_KEY` | `ContainerCard`, PDF |
| `'container-source-url'` | `cite_as` | `CONTAINER_SOURCE_URL_KEY` | `ContainerCard` link, PDF |
| *(no role)* | `url` | — | Selected but not directly rendered |

`CONTAINER_SELECT_COLUMNS` is computed as `id` + all field keys joined with `, `.

---

## Display name priority

`containerDisplayName()` in `lib/queries/types.ts` resolves the best display name in this order:

1. `name_title` (`'container-name-title'`)
2. `short_name` (`'container-short-name'`)
3. `title` (`'container-title'`)
4. `Publication #<id>` (fallback)

---

## Common tasks

### Rename a containers column

Change `key` in the relevant entry. `CONTAINER_SELECT_COLUMNS` and all constants update automatically. No changes needed in `queries/documents.ts` or the record detail page.

### Add a new containers column to the SELECT

Add an entry to `CONTAINER_FIELDS` (with or without a role). It will be included in `CONTAINER_SELECT_COLUMNS` and available via the `ContainerSummary` interface (`{ id: number; [key: string]: unknown }`).

### Display a new containers field on the record page

1. Add the field to `CONTAINER_FIELDS` with a role.
2. Export a constant: `export const CONTAINER_MY_KEY = CONTAINER_FIELDS.find((f) => f.role === 'my-role')!.key`
3. Import and use the constant in `ContainerCard` or the PDF section of `app/record/[id]/page.tsx`.
