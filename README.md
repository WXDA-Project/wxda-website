# WXDA Website

[![CI](https://github.com/AndyX07/wxda-website/actions/workflows/ci.yml/badge.svg)](https://github.com/AndyX07/wxda-website/actions/workflows/ci.yml)

A digital archive and research tool for historical records related to women's cross-dressing. The site provides full-text search, faceted filtering, an interactive map, and a blog.

## Tech Stack

Next.js 16 (App Router) · Supabase · Tailwind CSS v4 · Leaflet · Vercel

## Prerequisites

- **Node.js 20.9+** and npm
- **Docker** — only required for running E2E tests against a local Supabase instance

## Getting Started

### Environment variables

Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_<your-key>
```

- **`NEXT_PUBLIC_SUPABASE_URL`**: your project URL — found in **Project Settings → General**. Format: `https://<project-id>.supabase.co`
- **`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`**: found in **Project Settings → API Keys**. Use the publishable key (format `sb_publishable_...`), not the legacy JWT anon key.

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

Unit tests live in `tests/unit/`. Covers display helper functions in `lib/queries/types.ts` and search utilities in `lib/search-utils.ts`.

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
│   │   │   ├── history/
│   │   │   │   └── page.tsx    # Project history, aims, and methodology
│   │   │   └── news/
│   │   │       └── page.tsx    # Full news timeline
│   │   ├── advisory-board/
│   │   │   └── page.tsx        # Scholarly advisory board profiles (bios rendered as Markdown)
│   │   └── blog/
│   │       ├── page.tsx        # Blog post list
│   │       └── [slug]/
│   │           └── page.tsx    # Individual blog post (ReactMarkdown + rehype-raw)
│   ├── admin/                  # Admin area (separate minimal layout, no public nav)
│   │   ├── layout.tsx          # Admin header (nav links + sign out)
│   │   ├── login/
│   │   │   ├── page.tsx        # Email/password login form
│   │   │   └── actions.ts      # signIn server action
│   │   ├── fields/
│   │   │   ├── page.tsx        # Field config editor (4-tab CRUD table)
│   │   │   ├── actions.ts      # saveField, addField, deleteField server actions
│   │   │   └── FieldsClient.tsx # Client component — edit dialog + table
│   │   ├── blog/
│   │   │   ├── page.tsx        # Blog post list with edit/delete actions
│   │   │   ├── actions.ts      # savePost, deletePost server actions (cache invalidation + storage cleanup)
│   │   │   ├── BlogPostActions.tsx # Client component — delete confirmation
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New post page
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx    # Edit existing post page
│   │   ├── news/
│   │   │   ├── page.tsx        # News item list with edit/delete actions
│   │   │   ├── actions.ts      # saveNewsItem, deleteNewsItem server actions
│   │   │   ├── NewsForm.tsx    # Shared form (date + text) for new/edit
│   │   │   ├── NewsItemActions.tsx # Client component — delete confirmation
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New news item page
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx    # Edit existing news item page
│   │   ├── advisory-board/
│   │   │   ├── page.tsx        # Advisor list with edit/delete actions
│   │   │   ├── actions.ts      # saveAdvisor, deleteAdvisor server actions
│   │   │   ├── AdvisorForm.tsx # Form (name, url, sort order + MDXEditor bio) for new/edit
│   │   │   ├── AdvisorActions.tsx # Client component — delete confirmation
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # New advisor page
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx    # Edit existing advisor page
│   │   └── pages/
│   │       ├── page.tsx        # List of editable page-content blocks
│   │       ├── actions.ts      # savePageContent server action
│   │       ├── PageContentEditor.tsx # MDXEditor wrapper for a single content block
│   │       └── [id]/edit/
│   │           └── page.tsx    # Edit a page-content block
│   └── api/
│       ├── auth/signout/
│       │   └── route.ts        # POST → signs out + redirects to /admin/login
│       └── random-record/
│           └── route.ts        # GET → returns a random public document ID
├── components/
│   ├── NavMenu.tsx              # Responsive nav — desktop dropdown + mobile drawer
│   ├── HomeSearchBar.tsx        # Keyword search bar on the homepage
│   ├── SearchFilters.tsx        # Faceted filter sidebar (records + persons)
│   ├── ActiveFilters.tsx        # Active filter pill strip
│   ├── Pagination.tsx           # Page navigation
│   ├── TabNav.tsx               # Records / Persons tab switcher
│   ├── TimelineChart.tsx        # SVG timeline chart on search results
│   ├── DocumentMap.tsx          # Leaflet map with clustering + heatmap
│   ├── DownloadPdfButton.tsx    # Client-side PDF export for record detail pages
│   ├── BlogEditor.tsx           # Blog post editor (form fields + MDXEditor, preview modal)
│   └── MDXEditorClient.tsx      # Client-only MDXEditor wrapper with Supabase image upload
├── lib/
│   ├── supabase.ts              # Server-only public data client (anon key, no auth)
│   ├── auth.ts                  # Server auth helpers (requireUser)
│   ├── search-utils.ts          # Shared search/filter utilities
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
│       ├── filters.ts          # Cached filter option generation
│       ├── blog.ts             # Blog post queries (getBlogPosts, getBlogPost)
│       ├── news.ts             # News item queries (getNewsItems)
│       ├── advisoryBoard.ts    # Advisory board queries (getAdvisors)
│       └── pageContent.ts      # Editable page prose queries (getPageContent, getPageContentMap)
├── tests/
│   ├── unit/
│   │   ├── display-helpers.test.ts  # Jest unit tests for display helper functions
│   │   └── search-utils.test.ts     # Jest unit tests for search utilities
│   └── e2e/
│       ├── public.spec.ts           # Playwright: home, search, map, 404
│       ├── admin.spec.ts            # Playwright: auth guard, login, field editor UI
│       └── config-propagation.spec.ts # Playwright: admin change → public page reflects it
├── jest.config.ts              # Jest config (Next.js SWC transform, node environment)
├── playwright.config.ts        # Playwright config (baseURL, webServer auto-start)
└── public/                     # Static assets
```

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/auth/signout` | POST | Sign out + redirect to `/admin/login` |
| `/api/random-record` | GET | Returns a random public document ID |

## Database

The database lives in Supabase (PostgreSQL). All tables enforce **Row Level Security (RLS)**.

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

blog_posts
   └─ id, slug, title, summary, cover_image_url, content (markdown), published_at, updated_at

news_items
   └─ id, item_date, text — feeds the home page sidebar and /about/news

advisory_board
   └─ id, name, url, bio (markdown), sort_order — feeds /advisory-board

page_content
   └─ id, key, label, content (markdown), updated_at — editable titles, the
      shared eyebrow line, full-page prose (About/History), and the footer
      (see Content Management below)

document_field_config    ┐
person_field_config      │ Field config — 4 tables managed by the admin UI.
container_field_config   │ Read at runtime by lib/config/db-config.ts.
relationship_field_config┘
```

> **Soft foreign keys**: All cross-table references are stored as `text` or `integer[]` columns with no PostgreSQL `FOREIGN KEY` constraint. The application resolves them in code.

## Configuration System

All field configuration (column names, labels, filter types, display flags, roles) is stored in four Supabase tables — one per entity:

| Table | Entity | Admin tab |
|---|---|---|
| `document_field_config` | `documents` | Documents |
| `person_field_config` | `persons` | Persons |
| `container_field_config` | `containers` | Containers |
| `relationship_field_config` | `relationships` | Relationships |

**To change any field** — log in at `/admin/login` and edit through the admin UI. No code changes or redeployment needed. See [docs/admin-guide.md](docs/admin-guide.md) for a full reference.

## Content Management

Most user-facing text is editable by non-technical users through the admin UI, without touching code:

| Admin route | Edits | Public pages affected |
|---|---|---|
| `/admin/blog` | Blog posts (title, summary, cover image, Markdown body) | `/blog`, `/blog/[slug]` |
| `/admin/news` | News items (date + text) | `/`, `/about/news` |
| `/admin/advisory-board` | Advisory board members (name, profile URL, Markdown bio, sort order) | `/advisory-board` |
| `/admin/pages` | Page H1 titles, the shared eyebrow line above them, full-page prose for About/History (Markdown, headings included), and the footer | Every public page |