# Admin Guide

## Overview

The admin panel lives at `/admin`. It lets you control which database columns are fetched, displayed, and filtered across the entire public site — without code changes or redeployment. Changes propagate within seconds.

---

## Logging In

Navigate to `/admin/login`. Enter your email and password. On success you are redirected to `/admin/fields`.

> **Local dev credentials** (seed data only — never use in production):
> Email: `admin@test.local` / Password: `TestPassword123!`

To sign out, use the **Sign Out** button in the admin header.

Admin users are created manually in the Supabase dashboard under **Authentication → Users**. There is no self-registration.

---

## The Fields Page

`/admin/fields` is the only configuration surface. It has four tabs, one for each entity type. Each tab shows a table of **field config rows** — each row defines one database column and how the site should handle it.

| Tab | Config table | What it controls |
|---|---|---|
| Documents | `document_field_config` | Columns shown in record search results and record detail pages |
| Persons | `person_field_config` | Columns shown in person search results and person profile pages |
| Containers | `container_field_config` | Columns fetched from publications, journals, and series |
| Relationships | `relationship_field_config` | Column names used to join persons to documents |

---

## Reading the Table

Each tab's table shows a condensed view of the most important settings. Click **Edit** on any row to see and change all settings for that field.

| Column | Meaning |
|---|---|
| **Sort Order** | Display order — lower numbers appear first |
| **Key** | The exact database column name |
| **Label** | The name shown to site visitors |
| **Role** | The semantic tag the code depends on (see [Roles](#roles)) |
| **Show in Table** | Whether this field appears as a column in search results |
| **Show in Detail** | Whether this field appears on the detail page |

---

## Adding, Editing, and Deleting Fields

**To add a field:** click **+ Add Field** at the bottom of any tab, fill in the form, and click **Save**. The new row appears immediately and the public site cache is cleared.

**To edit a field:** click **Edit** on any row, make changes in the dialog, and click **Save**.

**To delete a field:** click **Delete** on any row and confirm the prompt.

> **Warning:** Deleting a field that has a Role assigned will break the public site queries that depend on that role. See [Roles](#roles).

---

## Field Reference

### Document Fields

| Field | Type | Description |
|---|---|---|
| `sort_order` | number | Controls display order across the site. Lower values appear first in table columns, the Full Record field list, and filter groups. |
| `key` | text | The exact column name as it appears in Supabase. Must match precisely — used directly in SELECT queries and filters. |
| `label` | text | The name shown to visitors. Appears in search table headers, filter labels, and the Full Record field list. |
| `role` | select | Tells the code how to use this field. See [Roles](#roles). Leave blank for display-only fields. |
| `filter_type` | select | The type of filter control in the search sidebar: `text` (substring search input for this specific column — not compatible with array columns), `date-range` (from/to date pickers), `multiselect` (checkbox list of every distinct value in the database), or blank for no filter. |
| `param_key` | text | The URL parameter name for this filter (e.g. `category` → `?category=value`). Required when Filter Type is set. |
| `show_in_table` | boolean | Show this field as a column in the search results table. |
| `show_in_detail` | boolean | Show this field in the Full Record key–value list on record detail pages. |
| `is_array` | boolean | Turn on if the column stores multiple values (`text[]`). Required for multiselect filters to work correctly. Array columns cannot use the `text` filter type — use `multiselect` instead. |
| `hide_on_mobile` | boolean | Hide this column on screens narrower than 640 px. |
| `hide_on_tablet` | boolean | Hide this column on screens narrower than 1024 px. |
| `format` | select | `date` converts a stored date string to a readable format like "3 Jun 1820". Leave blank to show the value as-is. |
| `max_table_length` | number | Maximum characters to show in the search table before truncating. Defaults to 60 if blank. |
| `show_in_doc_summary` | boolean | Include this field when documents are listed on a person's profile page. Turn on for fields like title, date, and category. |

### Person Fields

| Field | Type | Description |
|---|---|---|
| `sort_order` | number | Controls display order across the site. Lower values appear first in table columns, the person detail field list, and filter groups. |
| `key` | text | The exact column name as it appears in Supabase. Must match precisely — used directly in SELECT queries and filters. |
| `label` | text | The name shown to visitors. Appears in search table headers, filter labels, and the field list on person detail pages. |
| `role` | select | Tells the code how to use this field. See [Roles](#roles). Leave blank for display-only fields. |
| `filter_type` | select | The type of filter control in the search sidebar: `text` (substring search input for this specific column — not compatible with array columns), `date-range` (from/to date pickers), `multiselect` (checkbox list of every distinct value in the database), or blank for no filter. |
| `param_key` | text | The URL parameter name for this filter (e.g. `type` → `?type=value`). Required when Filter Type is set. |
| `show_in_table` | boolean | Show this field as a column in the persons search results table. |
| `show_in_detail` | boolean | Show this field in the key–value list on person detail pages. |
| `is_array` | boolean | Turn on if the column stores multiple values (`text[]`). Required for multiselect filters to work correctly. Array columns cannot use the `text` filter type — use `multiselect` instead. |
| `hide_on_mobile` | boolean | Hide this column on screens narrower than 640 px. |
| `hide_on_tablet` | boolean | Hide this column on screens narrower than 1024 px. |
| `format` | select | `date` converts a stored date string to a readable format like "3 Jun 1820". Leave blank to show the value as-is. |
| `max_table_length` | number | Maximum characters to show in the search table before truncating. Defaults to 60 if blank. |
| `badge` | boolean | Show this field as a highlighted chip in the person profile header. Best for short categorical values like type or rank. The first badge field by sort order gets the primary (accent) style; others get a secondary style. |
| `show_in_enrichment` | boolean | Include this field when fetching a person who appears on a record page (as an author or mentioned person). Turn on for any field that should appear in the person chip or card on record pages — typically name, type, and summary. |

### Container Fields

Containers are publications, journals, or series. They appear in a dedicated Publication section on record pages and have no standalone browse page.

| Field | Description |
|---|---|
| `sort_order` | Controls the order columns are fetched in the SELECT query. |
| `key` | The exact column name in the containers table. |
| `role` | Tells the code how to display this column in the Publication section. All five roles are required. See [Roles](#roles). |

### Relationship Fields

The relationships table links persons to documents. There are only three columns to configure — one per role.

| Field | Description |
|---|---|
| `key` | The exact column name in the relationships table. |
| `role` | Tells the code which column is which. All three roles are required. See [Roles](#roles). |

---

## Roles

A role is a string tag that lets the code find a specific column by its function rather than its name. This means you can rename a database column and update the `key` — the code keeps working as long as the role is still assigned.

**Role fields are marked with a ⚠ icon** in the edit dialog because removing or reassigning a required role will break the queries that depend on it.

Roles are selected from a dropdown. All roles in the dropdown are required and must each be assigned to exactly one field. Duplicate or missing roles will cause runtime errors on the public site.

### Document Roles

| Role | What the code uses it for |
|---|---|
| `primary-date` | Sorting records and driving the date range filter |
| `location` | Rendering map links next to location values on record pages |
| `author-ref` | Fetching and displaying the Author section on record pages |
| `container-ref` | Fetching and displaying the Publication section on record pages |
| `citation` | The "Cite as" text shown in the citation block |
| `source-url` | The external source link in the citation block |
| `doc-title` | The full formal title, shown when it differs from the display name |
| `doc-name-title` | The primary display name used as the page heading |
| `doc-summary` | A description or abstract shown near the top of record pages |
| `doc-category` | The category badge shown on record pages |

### Person Roles

| Role | What the code uses it for |
|---|---|
| `person-sort` | Sorting persons in search results |
| `person-name-title` | The primary display name used as the page heading and in search results |
| `person-title` | The full formal title, shown when it differs from the display name |
| `person-type` | Drives the primary badge chip in the person profile header |
| `person-summary` | A short description shown in the person header and in mentions on record pages |

### Container Roles

| Role | What the code uses it for |
|---|---|
| `container-name-title` | Primary display name used throughout the site |
| `container-short-name` | Abbreviated name shown alongside the full title |
| `container-title` | Full formal title — used as a fallback if the display name is not set |
| `container-summary` | Description shown in the Publication section on record pages |
| `container-source-url` | External link shown in the Publication section on record pages |

### Relationship Roles

| Role | What the code uses it for |
|---|---|
| `relationship-source` | The column storing the document ID (the "from" side of the link) |
| `relationship-target` | The column storing the person ID (the "to" side of the link) |
| `relationship-type` | The label describing the relationship (e.g. "is Mentioned In") |

---

## How Changes Propagate

When you save or delete a field, the server:

1. Writes the change to Supabase.
2. Calls `updateTag('field-config')` to invalidate the Next.js config cache.
3. Calls `revalidatePath('/', 'layout')` to revalidate the full layout tree.

The public site reflects the new configuration within a few seconds. No deployment is required.

---

## Access Control

All four config tables have public read access (the public site fetches field config without authentication) and authenticated write access (any signed-in user can add, edit, or delete rows). There is no role-based granularity beyond authenticated vs. anonymous — anyone with valid credentials has full write access.
