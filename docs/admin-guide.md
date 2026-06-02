# Admin Guide

## Overview

The admin panel lives at `/admin`. It lets you control which database columns are fetched, displayed, and filtered across the entire public site — without code changes or redeployment. Changes propagate within seconds.

---

## Logging In

Navigate to `/admin/login`. Enter your email and password. On success you are redirected to `/admin/fields`.

> **Local dev credentials** (seed data only — never use in production):  
> Email: `admin@test.local` / Password: `TestPassword123!`

To sign out, use the **Sign Out** button in the admin header.

---

## The Fields Page

`/admin/fields` is the only configuration surface. It has four tabs, one for each entity type. Each tab shows a table of **field config rows** — each row defines one database column and how the site should handle it.

| Tab | Config Table | What it controls |
|---|---|---|
| Documents | `document_field_config` | Columns shown in record search results and detail pages |
| Persons | `person_field_config` | Columns shown in person search, profiles, and enrichment panels |
| Containers | `container_field_config` | Columns fetched from publications, journals, and series |
| Relationships | `relationship_field_config` | Column names used to join persons to documents |

---

## Reading the Table

Each tab's table shows a subset of the available fields. The visible columns are:

| Column | Meaning |
|---|---|
| **Sort Order** | Display order (lower = first) |
| **Key** | The exact database column name |
| **Label** | User-facing heading shown on the public site |
| **Role** | Semantic tag the code depends on (see [Roles](#roles)) |
| **Show in Table** | Whether this column appears in search result rows |
| **Show in Detail** | Whether this column appears on the record detail page |

---

## Adding a Field

1. Click **Add Field** (top-right of any tab).
2. Fill in the form (see [Field Reference](#field-reference) below).
3. Click **Save**. The new row appears immediately and the public site cache is cleared.

## Editing a Field

1. Click **Edit** on any row.
2. Modify values in the dialog.
3. Click **Save**.

## Deleting a Field

1. Click **Delete** on any row.
2. Confirm the prompt.

> **Warning:** Deleting a field that has a required Role will break the public site queries that depend on that role. See [Roles](#roles).

---

## Field Reference

Fields vary by tab. Common fields appear in every tab; tab-specific fields are called out below.

### Common Fields (Documents and Persons)

| Field | Type | Description |
|---|---|---|
| `sort_order` | number | Controls column order. Lower values appear first. |
| `key` | text | The database column name. Must match exactly. |
| `label` | text | Heading shown to site visitors. |
| `role` | text | Semantic identifier the code uses to locate this column. See [Roles](#roles). |
| `filter_type` | select | How this field is exposed as a search filter: `text`, `date-range`, `multiselect`, or `none`. |
| `param_key` | text | URL query parameter name used when this field is a filter. |
| `show_in_table` | boolean | Include column in search result rows. |
| `show_in_detail` | boolean | Include field on the record detail page. |
| `is_array` | boolean | Set if the database value is an array (multi-value column). |
| `hide_on_mobile` | boolean | Suppress column on narrow screens. |
| `hide_on_tablet` | boolean | Suppress column on medium screens. |
| `format` | select | `date` (formatted display) or raw text. |
| `max_table_length` | number | Truncate value in table cells to this many characters. |
| `enriched` | boolean | Display in a dedicated enrichment section rather than the main column list. |
| `show_in_doc_summary` | boolean | Include on the person profile when summarising their documents. |

### Person-Only Fields

| Field | Description |
|---|---|
| `badge` | Display value as a chip in the person page header. |
| `show_in_enrichment` | Include when this person is referenced from a document detail page. |

### Container Fields

| Field | Description |
|---|---|
| `sort_order` | Column order. |
| `key` | Database column name. |
| `role` | One of the required container roles (see below). |

### Relationship Fields

| Field | Description |
|---|---|
| `key` | Database column name. |
| `role` | One of the three required relationship roles (see below). |

---

## Roles

Roles are string tags that let the application code find specific columns by function rather than by name. This means you can rename a database column and update the `key`, and the code keeps working as long as the role is still assigned.

**Role fields are marked with a ⚠ warning icon in the edit dialog** because removing or reassigning a required role will break the queries that depend on it.

### Required Document Roles

| Role | Purpose |
|---|---|
| `primary-date` | Date column used for filtering and sorting |
| `location` | Geographic field |
| `author-ref` | Column holding the linked Person ID |
| `container-ref` | Column holding the linked Container ID |
| `citation` | Display name for citations |
| `source-url` | External link |
| `doc-title` | Short display title |
| `doc-name-title` | Full display title |
| `doc-summary` | Full description/abstract |
| `doc-category` | Category classification |

### Required Person Roles

| Role | Purpose |
|---|---|
| `person-sort` | Column used to sort persons |
| `person-name-title` | Display name |
| `person-title` | Title/honorific field |
| `person-type` | Type or classification |
| `person-summary` | Bio or description |

### Required Container Roles

| Role | Purpose |
|---|---|
| `container-name-title` | Primary name |
| `container-short-name` | Abbreviated name |
| `container-title` | Full title fallback |
| `container-summary` | Description |
| `container-source-url` | External link |

### Required Relationship Roles

| Role | Purpose |
|---|---|
| `relationship-source` | Column holding the Document ID |
| `relationship-target` | Column holding the Person ID |
| `relationship-type` | Column holding the relationship label |

Each required role must be assigned to exactly one field. Duplicate or missing required roles will cause runtime errors on the public site.

---

## How Changes Propagate

When you save or delete a field, the server:

1. Writes the change to Supabase.
2. Calls `updateTag('field-config')` to invalidate the Next.js cache.
3. Calls `revalidatePath('/', 'layout')` to revalidate the full layout tree.

The public site reflects the new configuration within a few seconds. No deployment is required.

---

## Access Control

All four config tables have:

- **Public read** — the public site fetches field config without authentication.
- **Authenticated write** — any signed-in user can add, edit, or delete rows.

There is no role-based access granularity beyond "authenticated vs. anonymous". Anyone with valid credentials has full write access.
