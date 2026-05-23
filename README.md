# WXDA Website

A digital archive and research tool for historical records related to women's cross-dressing in eighteenth and nineteenth-century Britain. The site provides full-text search, faceted filtering, an interactive map, and structured person profiles drawn from a curated Supabase database.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS v4 with a custom design token layer |
| Map | Leaflet + leaflet.markercluster + leaflet.heat |
| Hosting | Vercel (recommended) |

## Getting Started

### Environment variables

Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Both values are found in the Supabase dashboard under **Project Settings → API**.

### Development

```bash
npm install
npm run dev        # starts at http://localhost:3000
```

### Production build

```bash
npm run build
npm start
```

## Project Structure

```
wxda-website/
├── app/
│   ├── globals.css            # Tailwind config + design tokens (@theme inline)
│   ├── layout.tsx             # Root layout (fonts, skip-nav, nav, footer)
│   ├── page.tsx               # Homepage (hero, search bar, stats)
│   ├── search/
│   │   └── page.tsx           # Search results (records + persons tabs)
│   ├── record/[id]/
│   │   └── page.tsx           # Single record detail page
│   ├── person/[id]/
│   │   └── page.tsx           # Single person profile page
│   └── map/
│       └── page.tsx           # Interactive map page
├── components/
│   ├── HomeSearchBar.tsx      # Keyword search bar on the homepage
│   ├── SearchFilters.tsx      # Faceted filter sidebar (records + persons)
│   ├── ActiveFilters.tsx      # Active filter pill strip
│   ├── Pagination.tsx         # Page navigation
│   ├── TabNav.tsx             # Records / Persons tab switcher
│   ├── TimelineChart.tsx      # SVG timeline chart on search results
│   └── DocumentMap.tsx        # Leaflet map with clustering + heatmap
├── lib/
│   ├── supabase.ts            # Supabase browser client singleton
│   ├── queries.ts             # All database queries and cached helpers
│   ├── field-config.ts        # Document field definitions (single source of truth)
│   ├── field-config.md        # Reference guide for field-config.ts
│   ├── person-field-config.ts # Person field definitions
│   └── person-field-config.md # Reference guide for person-field-config.ts
└── public/                    # Static assets
```

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server | Homepage with search bar and archive stats |
| `/search` | Server | Full-text + faceted search across records and persons |
| `/record/[id]` | Server | Detailed view of a single archive document |
| `/person/[id]` | Server | Profile page for a named historical person |
| `/map` | Server (shell) | Interactive Leaflet map (client component inside) |

All routes are server components by default. Client components (`'use client'`) are used only where browser APIs or interactivity is required: the search bar, filters, pagination, map, and timeline chart.

## Database

The database lives in Supabase (PostgreSQL). All tables enforce **Row Level Security (RLS)**. The application connects using the public **anon key**; no service role key is used in the client code.

### Entity–Relationship Overview

```
documents ──────────────────────────────────────────────────────────┐
   │  id (integer, PK)                                              │
   │  author_or_creator → soft FK → persons.id[]                   │
   │  container         → soft FK → containers.id                  │
   └──────────────────────────────────────────────────────────────►─┘

persons ─────────────────────────────────────────────────────────────┐
   │  id (integer, PK)                                              │
   └──────────────────────────────────────────────────────────────►─┘

relationships
   │  source_record_pointer → soft FK → persons.id or documents.id
   │  target_record_pointer → soft FK → persons.id or documents.id
   └─ links entities to the documents/persons they relate to

containers
   │  id (integer, PK)
   └─ publications / series that group documents

geocode_cache
   └─ latitude/longitude for location strings extracted from documents
```

> **Soft foreign keys**: All cross-table references are stored as `text` or `integer[]` columns with no PostgreSQL `FOREIGN KEY` constraint. The application resolves them in code using `Number()` or array lookups.

---

### Table: `documents`

The core archive table. Each row is one historical record (pamphlet, newspaper article, court transcript, etc.).

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | `public` or `viewable` — controls RLS access |
| `title` | `text` | Full title of the document |
| `title_raw` | `text` | Unprocessed/original title string |
| `date` | `date` | PostgreSQL date (YYYY-MM-DD) |
| `author_or_creator` | `text[]` | Person IDs (as text strings) who authored the document |
| `container` | `text` | ID of the parent container (publication/series) |
| `provisional_category` | `text[]` | Top-level thematic categories |
| `crossdressing_activities` | `text[]` | Specific activities described |
| `topics` | `text[]` | Thematic topics covered |
| `motive` | `text[]` | Attributed motives for cross-dressing |
| `attire` | `text[]` | Types of dress described |
| `item_format` | `text[]` | Format(s) of the original item (e.g. pamphlet, newspaper) |
| `social_rank` | `text[]` | Social rank of subjects |
| `crossdressing_occupation` | `text[]` | Occupations associated with cross-dressing |
| `locations_mentioned` | `text[]` | Place names mentioned in the document |
| `short_summary` | `text` | Editorial summary |
| `cite_as` | `text` | Preferred citation string |
| `url` | `text` | URL to the source or digitised copy |
| `source` | `text` | Bibliographic source reference |
| `name_title` | `text` | Name/title of the primary subject |
| `age_in_record` | `text` | Age of subject as recorded |
| `alternate_name_s_title_s` | `text[]` | Alternative names or titles |
| `colonial_agency` | `text[]` | Colonial agency tags |
| `column_s` | `text[]` | Newspaper column references |
| `container_form` | `text` | Physical form of the container |
| `described_age_in_record` | `text[]` | Described ages in the record |
| `discovery_of_crossdressing` | `text[]` | How/when cross-dressing was discovered |
| `gender_manifestation` | `text[]` | Gender expression described |
| `keyword` | `text[]` | Additional keywords |
| `motive_stated_by_main_protagonist` | `text` | Motive as stated by the protagonist |
| `page_numbers` | `text[]` | Page references |
| `racialization` | `text` | Racialisation as recorded in the source |
| `related_image` | `text[]` | References to related images |
| `report_scope` | `text` | Scope of the report |
| `report_size` | `text` | Size/length of the report |
| `secondary_protagonists` | `text[]` | Other named individuals |
| `sex_perceived_by_others` | `text[]` | Sex as perceived by others in the record |
| `sex_perceived_by_recorder` | `text[]` | Sex as perceived by the recorder |
| `sexuality` | `text[]` | Sexuality references |
| `stated_sex` | `text` | Sex as explicitly stated |
| `tone_of_the_report` | `text[]` | Editorial tone of the source |
| `venue` | `text[]` | Venues mentioned |
| `added` | `timestamptz` | Record creation timestamp |
| `modified` | `timestamptz` | Record last-modified timestamp |
| `fts` | `tsvector` | Full-text search vector (generated) |

**RLS policy**: `visibility = 'public'` — only public rows are readable by the anon key.

---

### Table: `persons`

Named historical individuals referenced across the archive.

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | `public` or `viewable` — controls RLS access |
| `title` | `text` | Display name (typically the canonical full name) |
| `title_raw` | `text` | Unprocessed name string |
| `given_names` | `text` | Given/forename(s) |
| `alternative_name` | `text` | Single alternative name |
| `alternate_name_s_title_s` | `text[]` | Additional alternative names or titles |
| `crossdressing_name_s` | `text[]` | Name(s) used while cross-dressing |
| `pseudonym` | `text[]` | Pseudonym(s) |
| `honorific` | `text[]` | Honorifics (e.g. Mr, Mrs, Dr) |
| `name_title` | `text[]` | Name-related titles |
| `person_type` | `text[]` | Categories (e.g. cross-dresser, author, soldier) |
| `gender` | `text` | Gender as recorded |
| `presumptive_sex` | `text` | Presumptive sex assigned in sources |
| `social_rank` | `text` | Social rank |
| `short_summary` | `text` | Editorial summary |
| `notes` | `text` | Editorial notes |
| `primary_preferred_image` | `text` | URL or reference to a preferred image |
| `cite_as` | `text` | Preferred citation string |
| `url` | `text` | URL to an external source |
| `added` | `timestamptz` | Record creation timestamp |
| `modified` | `timestamptz` | Record last-modified timestamp |
| `fts` | `tsvector` | Full-text search vector (generated) |

**RLS policy**: `visibility = ANY (ARRAY['public', 'viewable'])` — both values are readable by the anon key.

**Display name logic**: `personDisplayName()` in `lib/queries.ts` combines `title`, `given_names`, and `alternative_name` — prioritising the most informative combination.

---

### Table: `relationships`

A junction table linking persons to documents, capturing the nature of the relationship.

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | `public` or `viewable` — controls RLS access |
| `relationship_type` | `text` | Nature of the link (see below) |
| `source_record_pointer` | `text` | ID of the source entity (person or document) |
| `target_record_pointer` | `text` | ID of the target entity (person or document) |
| `title` | `text` | Relationship label |
| `title_raw` | `text` | Unprocessed label |
| `cite_as` | `text` | Preferred citation string |
| `url` | `text` | URL to an external source |
| `added` | `timestamptz` | Record creation timestamp |
| `modified` | `timestamptz` | Record last-modified timestamp |
| `fts` | `tsvector` | Full-text search vector (generated) |

**Known relationship types** (as found in data):
- `is Mentioned In` — person is named or described in the document
- `Mentions` — inverse of the above (document-centric direction)
- `IsMarriedTo` — marriage relationship between two persons
- `isWifeOf` — spousal relationship

**RLS policy**: `visibility = ANY (ARRAY['public', 'viewable'])` — both values are readable by the anon key.

---

### Table: `containers`

Publications, series, or collections that group documents.

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | Visibility value (RLS uses `true` — all rows readable) |
| `title` | `text` | Full title of the publication or series |
| `title_raw` | `text` | Unprocessed title string |
| `short_name` | `text` | Abbreviated name |
| `name_title` | `text` | Name/title variant |
| `short_summary` | `text` | Editorial summary or notes |
| `cite_as` | `text` | Preferred citation string |
| `url` | `text` | URL to the publication or series |
| `added` | `timestamptz` | Record creation timestamp |
| `modified` | `timestamptz` | Record last-modified timestamp |
| `fts` | `tsvector` | Full-text search vector (generated) |

**RLS policy**: `true` (unrestricted — all rows readable by the anon key).

Referenced by `documents.container`. Resolved in `getDocumentEnrichment()` in `lib/queries.ts`.

---

### Table: `geocode_cache`

Stores resolved latitude/longitude coordinates for location strings found in documents.

| Column | Type | Description |
|---|---|---|
| `location` | `text` | Primary key — the location string as it appears in `documents.locations_mentioned` |
| `lat` | `double precision` | Latitude |
| `lng` | `double precision` | Longitude |
| `geocoded_at` | `timestamptz` | When this entry was geocoded (defaults to `now()`) |

**RLS policy**: `true` (unrestricted — all rows readable by the anon key).

Used exclusively by `getMapPins()` in `lib/queries.ts`, which joins distinct location strings from documents against this table to build the map data.

---

### Typical Data Fetching Flows

**Search page (records tab)**
1. `searchDocuments()` — full-text + filter query on `documents` with `fts @@ ...`, `date` range, and multiselect `overlaps`/`in` filters. Returns paginated rows.
2. `searchDocumentDates()` — same query but `SELECT date` only, used to populate the timeline chart.
3. `getArchiveDates()` — all dates from `documents` (unfiltered), for the chart background.
4. `getDocumentFilterOptions()` — cached (1 h) distinct values for every multiselect filter field, fetched from `documents`.

**Record detail page**
1. `getDocument(id)` — fetches a single document row by ID.
2. `getDocumentEnrichment(id)` — parallel queries for: the parent container, mentioned persons (via `relationships`), and any persons whose `author_or_creator` array contains this document's ID.

**Person detail page**
1. `getPerson(id)` — fetches a single person row by ID.
2. `getPersonDocuments(id)` — fetches all documents linked to this person via `author_or_creator` or `relationships`.

**Map page**
1. `getMapPins()` — cached (1 h). Joins `documents.locations_mentioned` against `geocode_cache` to produce `{ location, lat, lng, documents[] }` pins.

---

## Configuration System

The codebase uses a **field config** pattern as a single source of truth for all column definitions. Adding, removing, or renaming a database column only requires changing one config file.

- **`lib/field-config.ts`** — document fields. See [`lib/field-config.md`](lib/field-config.md) for the full reference.
- **`lib/person-field-config.ts`** — person fields. See [`lib/person-field-config.md`](lib/person-field-config.md) for the full reference.

The config drives: search result table columns, filter sidebar groups, active filter pills, record detail display, query SELECT clauses, and filter option generation.

---

## Visibility System

The `visibility` column appears on all tables. Policies differ by table:

| Table | Anon RLS policy |
|---|---|
| `documents` | `visibility = 'public'` only |
| `persons` | `visibility IN ('public', 'viewable')` |
| `relationships` | `visibility IN ('public', 'viewable')` |
| `containers` | `true` (all rows) |
| `geocode_cache` | `true` (all rows) |

The application never uses the Supabase service role key. All queries run under the anon key and respect RLS automatically.

---

## Design Tokens

All colours, spacing, and typographic decisions are expressed as CSS custom properties in `app/globals.css` under a `@theme inline` block. Tailwind utilities and inline styles in SVG/Leaflet HTML both reference the same tokens via `var(--color-*)`.

Key tokens:

| Token | Usage |
|---|---|
| `--color-crimson` | Primary accent (buttons, links, active states) |
| `--color-crimson-hover` | Hover state for crimson elements |
| `--color-ink` | Primary text |
| `--color-muted` | Secondary/subdued text |
| `--color-paper` | Page background |
| `--color-parchment` | Slightly warm background for sidebars |
| `--color-border` | Dividers and input borders |
| `--color-tag-bg` / `--color-tag-fg` | Filter tag chips |
| `--color-on-accent` | Text/icons on crimson backgrounds |
| `--color-overlay` | Modal/drawer backdrop |

To restyle the site, update the token values in `app/globals.css` — no component changes are needed.

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework (App Router, server components, caching) |
| `@supabase/supabase-js` | Database client |
| `leaflet` | Interactive map |
| `leaflet.markercluster` | Marker clustering for the map |
| `leaflet.heat` | Heatmap layer for the map |
| `tailwindcss` | Utility-first CSS framework |
