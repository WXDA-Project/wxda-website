# WXDA Website

[![CI](https://github.com/AndyX07/wxda-website/actions/workflows/ci.yml/badge.svg)](https://github.com/AndyX07/wxda-website/actions/workflows/ci.yml)

A digital archive and research tool for historical records related to women's cross-dressing in eighteenth and nineteenth-century Britain. The site provides full-text search, faceted filtering, an interactive map, and structured person profiles drawn from a curated Supabase database.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Styling | Tailwind CSS v4 with a custom design token layer |
| Map | Leaflet + leaflet.markercluster + leaflet.heat |
| Auth | `@supabase/ssr` (browser + server clients, session refresh via `proxy.ts`) |
| Hosting | Vercel (recommended) |

## Getting Started

### Environment variables

Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```

- **`NEXT_PUBLIC_SUPABASE_URL`**: your project URL — found in **Project Settings → General**. Format: `https://<project-id>.supabase.co`
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**: found in **Project Settings → API Keys**. Use the publishable key (format `sb_publishable_...`), not the legacy JWT anon key.

Both the server data client (`lib/supabase.ts`) and the auth clients (`lib/supabase/client.ts`, `lib/supabase/server.ts`) read from the same `NEXT_PUBLIC_` vars. `NEXT_PUBLIC_` variables are available server-side too, so no duplicate pair is needed.

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

## Testing

### Unit tests (Jest)

Tests pure utility functions with no database or browser required.

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

Unit tests live in `tests/unit/`. Currently covers all branches of the display helper functions in `lib/queries/types.ts` (`documentDisplayTitle`, `personDisplayName`, `containerDisplayName`).

### E2E tests (Playwright)

Tests the full application in a real browser. Playwright starts the dev server automatically if one isn't already running.

```bash
npm run test:e2e         # headless
npm run test:e2e:ui      # Playwright UI mode (interactive, recommended for debugging)
```

E2E tests live in `tests/e2e/`:

| File | What it tests |
|---|---|
| `public.spec.ts` | Home page, search (URL params, clear), map, record detail, persons search and detail, 404 |
| `admin.spec.ts` | Auth redirect, login form, invalid credentials, tab switching, edit dialog |
| `config-propagation.spec.ts` | Full round-trip: admin field change → cache invalidation → public page reflects change |

#### Config propagation tests

The propagation tests mutate live data and revert it. **Run these against a local Supabase instance, not production.** They use the test admin user seeded by `supabase/seed.sql` (`admin@test.local` / `TestPassword123!`):

```bash
npm run test:e2e -- tests/e2e/config-propagation.spec.ts
```

The suite runs in serial mode (each test reverts its own changes before the next starts) and covers all four config tables:

| Test | Tab | Property | Public UI target |
|---|---|---|---|
| 1 | Documents | `label` | Search column header |
| 2 | Documents | `show_in_table` | Search column visibility |
| 3 | Documents | `filter_type` | Filter sidebar multiselect group |
| 4 | Persons | `label` | Persons search column header |
| 5 | Persons | `show_in_table` | Persons search column visibility |
| 6 | Persons | `filter_type` | Persons filter sidebar multiselect group |
| 7 | Containers | `sort_order` | Cache invalidation (page still renders) |
| 8 | Relationships | add + delete row | Admin table round-trip |

### Local Supabase (Docker)

To test against an isolated local database instead of production:

1. Make sure Docker is running
2. Start the local Supabase stack:
   ```bash
   npx supabase start
   ```
3. Note the `API URL` and `publishable key` printed in the output
4. Swap the values in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key from supabase start>
   ```
5. Run tests as normal — they now hit the local DB
6. Stop the stack when done: `npx supabase stop`

The local stack applies all migrations in `supabase/migrations/` automatically on start. Production data does not carry over.

### Continuous Integration

The `.github/workflows/ci.yml` workflow runs on every push to `master` and on all pull requests. It has four jobs:

| Job | Runs on | What it runs |
|---|---|---|
| `unit` | push + PR | `npm test` |
| `lint` | push + PR | `npm run lint` |
| `typecheck` | push + PR | `npx tsc --noEmit` |
| `e2e` | PR only | `npm run test:e2e` |

`unit`, `lint`, and `typecheck` run in parallel on every event. `e2e` is restricted to pull requests — the Docker setup required for a local Supabase stack is too heavy to run on every push to master.

The e2e job starts the full local Supabase stack with `supabase start`, which applies migrations and seeds the test admin user from `supabase/seed.sql`. Playwright then starts the Next.js dev server automatically via its `webServer` config. No secrets or committed env files are required — the workflow extracts the Supabase credentials from `supabase status` after startup and fails loudly if the key cannot be found.

The Playwright HTML report is uploaded as a workflow artifact on failure, so broken tests can be inspected without re-running locally.

## Project Structure

```
wxda-website/
├── proxy.ts                    # Session refresh proxy (replaces middleware.ts in Next.js 16)
├── next.config.ts              # Next.js config (cacheComponents: true enables 'use cache')
├── app/
│   ├── globals.css             # Tailwind config + design tokens (@theme inline)
│   ├── layout.tsx              # Root layout (fonts, HTML shell only)
│   ├── (public)/               # Route group — public site (has header/footer layout)
│   │   ├── layout.tsx          # Public nav header + footer
│   │   ├── page.tsx            # Homepage (hero, search bar)
│   │   ├── search/
│   │   │   └── page.tsx        # Full-text + faceted search (records + persons tabs)
│   │   ├── record/[id]/
│   │   │   └── page.tsx        # Single record detail page
│   │   ├── person/[id]/
│   │   │   └── page.tsx        # Single person profile page
│   │   ├── map/
│   │   │   └── page.tsx        # Interactive map page
│   │   ├── about/
│   │   │   ├── page.tsx        # About the project (mission, acknowledgements, coverage)
│   │   │   └── overview/
│   │   │       └── page.tsx    # Project overview, aims, and methodology
│   │   └── advisory-board/
│   │       └── page.tsx        # Scholarly advisory board profiles
│   ├── admin/                  # Admin area (separate minimal layout, no public nav)
│   │   ├── layout.tsx          # Admin header (WXDA Admin label + sign out)
│   │   ├── login/
│   │   │   ├── page.tsx        # Email/password login form
│   │   │   └── actions.ts      # signIn server action
│   │   └── fields/
│   │       ├── page.tsx        # Field config editor (4-tab CRUD table)
│   │       ├── actions.ts      # saveField, addField, deleteField server actions
│   │       └── FieldsClient.tsx # Client component — edit dialog + table
│   └── auth/
│       └── signout/
│           └── route.ts        # POST → signs out + redirects to /admin/login
├── components/
│   ├── NavMenu.tsx              # Responsive nav — desktop dropdown + mobile drawer
│   ├── HomeSearchBar.tsx        # Keyword search bar on the homepage
│   ├── SearchFilters.tsx        # Faceted filter sidebar (records + persons)
│   ├── ActiveFilters.tsx        # Active filter pill strip
│   ├── Pagination.tsx           # Page navigation
│   ├── TabNav.tsx               # Records / Persons tab switcher
│   ├── TimelineChart.tsx        # SVG timeline chart on search results
│   ├── DocumentMap.tsx          # Leaflet map with clustering + heatmap
│   └── DownloadPdfButton.tsx    # Client-side PDF export for record detail pages
├── lib/
│   ├── supabase.ts              # Server-only public data client (anon key, no auth)
│   ├── supabase/
│   │   ├── client.ts           # Browser auth client (createBrowserClient)
│   │   ├── server.ts           # Server auth client (createServerClient + cookies)
│   │   └── proxy.ts            # updateSession() — refreshes auth token in proxy.ts
│   ├── config/
│   │   └── db-config.ts        # Runtime config layer — 4 cached async getters
│   └── queries/                # All database queries, split by domain
│       ├── index.ts            # Re-exports everything — import from '@/lib/queries'
│       ├── types.ts            # Shared row interfaces and display helpers
│       ├── documents.ts        # Document search, fetch, enrichment, timeline
│       ├── persons.ts          # Person search, fetch, person-document links
│       ├── map.ts              # Map pin query
│       └── filters.ts          # Cached filter option generation
├── tests/
│   ├── unit/
│   │   └── display-helpers.test.ts  # Jest unit tests for display helper functions
│   └── e2e/
│       ├── public.spec.ts           # Playwright: home, search, map, 404
│       ├── admin.spec.ts            # Playwright: auth guard, login, field editor UI
│       └── config-propagation.spec.ts # Playwright: admin change → public page reflects it
├── jest.config.ts              # Jest config (Next.js SWC transform, node environment)
├── playwright.config.ts        # Playwright config (baseURL, webServer auto-start)
└── public/                     # Static assets
```

## Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server | Homepage with search bar |
| `/search` | Server | Full-text + faceted search across records and persons |
| `/record/[id]` | Server | Detailed view of a single archive document |
| `/person/[id]` | Server | Profile page for a named historical person |
| `/map` | Server (shell) | Interactive Leaflet map (client component inside) |
| `/about` | Server | About the project — mission, acknowledgements, coverage |
| `/about/overview` | Server | Detailed project overview, aims, and methodology |
| `/advisory-board` | Server | Profiles of the scholarly advisory board |
| `/admin/login` | Client | Email/password login for admin access |
| `/admin/fields` | Server | Field configuration editor (requires auth) |
| `/api/auth/signout` | Route Handler | POST → sign out + redirect to login |

All public routes are server components by default. Client components (`'use client'`) are used only where browser APIs or interactivity is required: the search bar, filters, pagination, map, timeline chart, and admin edit dialog.

## Database

The database lives in Supabase (PostgreSQL). All tables enforce **Row Level Security (RLS)**. The public-facing application connects using the anon key; no service role key is used in the client code.

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

document_field_config    ┐
person_field_config      │ Field config — 4 tables managed by the admin UI.
container_field_config   │ Read at runtime by lib/config/db-config.ts.
relationship_field_config┘
```

> **Soft foreign keys**: All cross-table references are stored as `text` or `integer[]` columns with no PostgreSQL `FOREIGN KEY` constraint. The application resolves them in code.

---

### Table: `documents`

The core archive table. Each row is one historical record (pamphlet, newspaper article, court transcript, etc.).

See `document_field_config` in the admin UI for the full column list and roles. Key columns:

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | `public` or `viewable` — controls RLS access |
| `fts` | `tsvector` | Full-text search vector (generated) |

**RLS policy**: `visibility = 'public'` — only public rows are readable by the anon key.

---

### Table: `persons`

Named historical individuals referenced across the archive.

See `person_field_config` in the admin UI for the full column list and roles. Key columns:

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `visibility` | `text` | `public` or `viewable` — controls RLS access |
| `fts` | `tsvector` | Full-text search vector (generated) |

**RLS policy**: `visibility IN ('public', 'viewable')` — both values are readable by the anon key.

---

### Table: `relationships`

A junction table linking persons to documents.

See `relationship_field_config` in the admin UI for column names. Key columns:

| Column | Type | Description |
|---|---|---|
| `id` | `integer` | Primary key |
| `relationship_type` | `text` | Nature of the link (e.g. `'is Mentioned In'`) |
| `source_record_pointer` | `text` | ID of the source entity |
| `target_record_pointer` | `text` | ID of the target entity |

**RLS policy**: `visibility IN ('public', 'viewable')`.

---

### Table: `containers`

Publications, series, or collections that group documents.

See `container_field_config` in the admin UI for column names.

**RLS policy**: `true` (all rows readable by the anon key).

---

### Table: `geocode_cache`

Resolved latitude/longitude for location strings found in documents.

| Column | Type | Description |
|---|---|---|
| `location` | `text` | Primary key — location string as it appears in documents |
| `lat` | `double precision` | Latitude |
| `lng` | `double precision` | Longitude |

**RLS policy**: `true`. Used exclusively by `getMapPins()` in `lib/queries/map.ts`.

---

### Typical Data Fetching Flows

**Search page (records tab)** — `lib/queries/documents.ts`, `lib/queries/filters.ts`
1. `searchDocuments()` — full-text + filter query on `documents`. Returns paginated rows.
2. `searchDocumentDates()` — same query but `SELECT date` only, for the timeline chart.
3. `getArchiveDates()` — all dates from `documents` (unfiltered), for the chart background.
4. `getDocumentFilterOptions()` — cached (1 h) distinct values for every multiselect filter field.

**Record detail page** — `lib/queries/documents.ts`
1. `getDocument(id)` — fetches a single document row by ID.
2. `getDocumentEnrichment(id)` — parallel queries for: the parent container, mentioned persons (via `relationships`), and author persons.

**Person detail page** — `lib/queries/persons.ts`
1. `getPerson(id)` — fetches a single person row by ID.
2. `getPersonDocuments(id)` — fetches all documents linked to this person via `author_or_creator` or `relationships`.

**Map page** — `lib/queries/map.ts`
1. `getMapPins()` — joins `documents.locations_mentioned` against `geocode_cache` to produce `{ location, lat, lng, documents[] }` pins.

---

## Configuration System

All field configuration (column names, labels, filter types, display flags, roles) is stored in four Supabase tables — one per entity:

| Table | Entity | Admin tab |
|---|---|---|
| `document_field_config` | `documents` | Documents |
| `person_field_config` | `persons` | Persons |
| `container_field_config` | `containers` | Containers |
| `relationship_field_config` | `relationships` | Relationships |

**To change any field** — log in at `/admin/login` and edit through the admin UI. No code changes or redeployment needed. See [docs/admin-guide.md](docs/admin-guide.md) for a full reference.

### Runtime config layer — `lib/config/db-config.ts`

Four async functions read from the four tables and expose typed constants:

```ts
const { TABLE_FIELDS, SORT_DATE_KEY, FILTER_FIELDS, ... } = await getDocumentConfig()
const { PERSON_TABLE_FIELDS, PERSON_SORT_KEY, ... }        = await getPersonConfig()
const { CONTAINER_SELECT_COLUMNS, CONTAINER_NAME_TITLE_KEY, ... } = await getContainerConfig()
const { RELATIONSHIP_SOURCE_KEY, RELATIONSHIP_TARGET_KEY, ... }   = await getRelationshipConfig()
```

All four functions use `'use cache'` with `cacheLife('max')` (30-day revalidation) and `cacheTag('field-config')`. When an admin saves any change, `updateTag('field-config')` immediately expires all four caches.

`FTS_COLUMN = 'fts'` and `VISIBILITY_COLUMN = 'visibility'` are TypeScript constants — not stored in the database, since they are internal implementation details that should never change.

### Admin access

Admin users are created manually in the Supabase dashboard (Authentication → Users). There is no self-registration.

- **Login**: `/admin/login`
- **Field editor**: `/admin/fields`
- **Sign out**: button in the admin header

Admin routes check `supabase.auth.getUser()` server-side and redirect to `/admin/login` if no authenticated user is found.

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

## Caching

With `cacheComponents: true` in `next.config.ts`, data fetching is **dynamic by default** — pages are not prerendered unless they explicitly use `'use cache'`. The two intentionally cached functions are:

| Function | Cache life | Tag | Invalidated by |
|---|---|---|---|
| `getDocumentConfig()` / `getPersonConfig()` / `getContainerConfig()` / `getRelationshipConfig()` | `max` (30d revalidate) | `field-config` | `updateTag('field-config')` on admin save |
| `getDocumentFilterOptions()` / `getPersonFilterOptions()` | `hours` (1h revalidate) | — | Time-based only |

All other data fetching (search queries, record/person lookups, map pins) is fully dynamic — fetched fresh on every request.

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

To restyle the site, update the token values in `app/globals.css` — no component changes needed.

---

## Key Dependencies

| Package | Purpose |
|---|---|
| `next` | Framework (App Router, server components, `'use cache'`) |
| `@supabase/supabase-js` | Data client (server-only, anon key) |
| `@supabase/ssr` | Auth client (browser + server, session management) |
| `leaflet` | Interactive map |
| `leaflet.markercluster` | Marker clustering for the map |
| `leaflet.heat` | Heatmap layer for the map |
| `tailwindcss` | Utility-first CSS framework |
