import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import FieldsClient from './FieldsClient'
import type { AdminTable } from './actions'

export const metadata: Metadata = { title: 'Field Config — Admin' }

const TABS: { key: AdminTable; label: string }[] = [
  { key: 'document_field_config',      label: 'Documents' },
  { key: 'person_field_config',        label: 'Persons' },
  { key: 'container_field_config',     label: 'Containers' },
  { key: 'relationship_field_config',  label: 'Relationships' },
]

// ── Outer shell — synchronous, renders immediately ─────────────────────────

export default function AdminFieldsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminFieldsContent searchParams={searchParams} />
    </Suspense>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-6 w-48 bg-border rounded mb-1" />
      <div className="h-4 w-64 bg-border rounded mb-6" />
      <div className="h-10 bg-border rounded mb-6" />
      <div className="flex gap-1 mb-6">
        {TABS.map((t) => (
          <div key={t.key} className="h-9 w-24 bg-border rounded-t" />
        ))}
      </div>
      <div className="h-48 bg-border rounded" />
    </div>
  )
}

// ── Inner async component — all dynamic data fetching happens here ─────────

async function AdminFieldsContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await requireUser()
  const supabase = await createClient()

  const sp = await searchParams
  const tabParam = sp.tab as string | undefined
  const activeTab: AdminTable = TABS.some((t) => t.key === tabParam)
    ? (tabParam as AdminTable)
    : 'document_field_config'

  const orderCol = activeTab === 'relationship_field_config' ? 'id' : 'sort_order'
  const { data, error } = await supabase
    .from(activeTab)
    .select('*')
    .order(orderCol)

  if (error) {
    return (
      <div className="max-w-6xl mx-auto text-sm text-crimson">
        Failed to load config: {error.message}
      </div>
    )
  }

  const rows = (data ?? []) as Record<string, unknown>[]

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold font-serif text-ink">Field Configuration</h1>
          <p className="text-sm text-muted mt-0.5">
            Logged in as <span className="font-semibold">{user.email}</span>
          </p>
        </div>
      </div>

      {/* General help */}
      <details className="mb-6 rounded border border-border bg-paper group">
        <summary className="px-4 py-3 text-sm font-semibold cursor-pointer select-none text-ink list-none flex items-center justify-between">
          <span>ⓘ How this works</span>
          <span className="text-muted text-xs font-normal group-open:hidden">click to expand</span>
        </summary>
        <div className="px-4 pb-4 pt-3 border-t border-border text-sm text-muted space-y-2 leading-relaxed">
          <p>
            This page controls what visitors see on the public site — which columns appear in
            search results, which filters are available, and how fields are displayed on record
            and person detail pages. Each tab corresponds to one database table.
          </p>
          <p>
            <strong className="text-ink">Changes take effect immediately.</strong> Saving a field
            clears the config cache automatically, so every page on the site reflects the new
            settings on the next visit — no redeployment needed.
          </p>
          <p>
            <strong className="text-ink">Key</strong> must exactly match the column name in the
            Supabase database. <strong className="text-ink">Role</strong> is a semantic tag the
            code uses to find specific columns (e.g. the date column, the author column). Roles
            are marked with ⚠ — only change them if you understand what they do, as the search
            and enrichment queries depend on them being assigned correctly.
          </p>
          <p>
            To add a new filter: create a field with a Filter Type, a unique Param Key, and
            (if the column holds multiple values) Is Array turned on. To show a column in search
            results, turn on Show in Table. Help text inside the edit dialog explains each option.
          </p>
        </div>
      </details>

      {/* Tab bar */}
      <nav aria-label="Config tabs" className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab
          return (
            <Link
              key={tab.key}
              href={`/admin/fields?tab=${tab.key}`}
              className={`px-4 py-2 text-sm font-semibold rounded-t transition-colors no-underline ${
                isActive
                  ? 'bg-paper border border-b-paper border-border text-ink -mb-px'
                  : 'text-muted hover:text-ink'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>

      <FieldsClient table={activeTab} rows={rows} />
    </div>
  )
}
