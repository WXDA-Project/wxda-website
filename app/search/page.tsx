import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  searchDocuments,
  searchDocumentDates,
  getArchiveDates,
  getDocumentFilterOptions,
  searchPersons,
  getPersonFilterOptions,
  personDisplayName,
  PAGE_SIZE,
  type PersonRow,
  type PersonSummary,
} from '@/lib/queries'
import { TABLE_FIELDS, MULTISELECT_FILTER_FIELDS, FILTER_FIELDS } from '@/lib/field-config'
import {
  PERSON_TABLE_FIELDS,
  PERSON_FILTER_FIELDS,
  PERSON_MULTISELECT_FILTER_FIELDS,
} from '@/lib/person-field-config'
import SearchFilters from '@/components/SearchFilters'
import Pagination from '@/components/Pagination'
import TabNav from '@/components/TabNav'
import ActiveFilters from '@/components/ActiveFilters'
import TimelineChart from '@/components/TimelineChart'

export const metadata: Metadata = { title: 'Search the Archive' }

// ── Helpers ────────────────────────────────────────────────────────────────

function normalise(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr.length === 4 ? `${dateStr}-01-01` : dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—'
  return String(value) || '—'
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

// ── Record results table ───────────────────────────────────────────────────

function RecordResultsTable({ records }: { records: Record<string, unknown>[] }) {
  if (records.length === 0) {
    return (
      <p className="text-sm py-8 text-center text-muted">
        No records match your search. Try broadening your filters.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border-t-2 border-ink">
        <thead>
          <tr className="border-b border-border">
            {TABLE_FIELDS.map((f) => {
              const hideCls = f.hideOnTablet ? ' hidden lg:table-cell' : f.hideOnMobile ? ' hidden sm:table-cell' : ''
              return (
                <th
                  key={f.key}
                  scope="col"
                  className={`text-left py-2 px-3 text-xs font-semibold tracking-wide uppercase text-muted whitespace-nowrap${hideCls}`}
                >
                  {f.label}
                </th>
              )
            })}
            {/* width:1% + whitespace-nowrap = size to minimum content, never squeezed */}
            <th scope="col" className="py-2 px-3 w-[1%] whitespace-nowrap">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id as number} className="border-b border-border hover:bg-white transition-colors">
              {TABLE_FIELDS.map((f) => {
                const raw = record[f.key]
                let display: string
                if (f.format === 'date') {
                  display = formatDate(raw as string | null)
                } else {
                  display = formatValue(raw)
                  display = truncate(display, f.maxTableLength ?? 60)
                }
                const hideCls = f.hideOnTablet ? ' hidden lg:table-cell' : f.hideOnMobile ? ' hidden sm:table-cell' : ''
                return (
                  <td
                    key={f.key}
                    className={`py-3 px-3 align-top text-ink${hideCls}${f.format === 'date' ? ' whitespace-nowrap' : ''}`}
                  >
                    {display}
                  </td>
                )
              })}
              <td className="py-3 px-3 align-top w-[1%] whitespace-nowrap">
                <Link href={`/record/${record.id}`} className="text-xs font-semibold underline text-crimson">
                  View<span className="sr-only"> record for {String(record.title ?? `#${record.id}`)}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Person results table ───────────────────────────────────────────────────

function PersonResultsTable({ records }: { records: PersonRow[] }) {
  if (records.length === 0) {
    return (
      <p className="text-sm py-8 text-center text-muted">
        No persons match your search. Try broadening your filters.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse border-t-2 border-ink">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="text-left py-2 px-3 text-xs font-semibold tracking-wide uppercase text-muted whitespace-nowrap">
              Name
            </th>
            {PERSON_TABLE_FIELDS.map((f) => (
              <th
                key={f.key}
                scope="col"
                className="text-left py-2 px-3 text-xs font-semibold tracking-wide uppercase hidden sm:table-cell text-muted whitespace-nowrap"
              >
                {f.label}
              </th>
            ))}
            <th scope="col" className="py-2 px-3 w-[1%] whitespace-nowrap">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((person) => {
            const name = personDisplayName(person as unknown as PersonSummary)
            return (
              <tr key={person.id} className="border-b border-border hover:bg-white transition-colors">
                <td className="py-3 px-3 align-top">
                  <Link href={`/person/${person.id}`} className="text-sm font-semibold hover:underline text-crimson no-underline">
                    {name}
                  </Link>
                </td>
                {PERSON_TABLE_FIELDS.map((f) => {
                  const raw = person[f.key as keyof PersonRow]
                  const display = truncate(formatValue(raw), f.maxTableLength ?? 60)
                  return (
                    <td key={f.key} className="py-3 px-3 align-top hidden sm:table-cell text-ink">
                      {display}
                    </td>
                  )
                })}
                <td className="py-3 px-3 align-top w-[1%] whitespace-nowrap">
                  <Link href={`/person/${person.id}`} className="text-xs font-semibold underline text-crimson">
                    View<span className="sr-only"> person: {name}</span>
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const tab: 'records' | 'persons' = sp.tab === 'persons' ? 'persons' : 'records'
  const q = (sp.q as string | undefined) ?? undefined
  const page = parseInt((sp.page as string | undefined) ?? '1', 10)

  // Tab switching links: preserve the current keyword query but drop all filters
  const tabBase = new URLSearchParams()
  if (q) tabBase.set('q', q)
  const recordsTabHref = `/search${tabBase.size ? `?${tabBase}` : ''}`
  const personsTabHref = `/search?tab=persons${q ? `&q=${encodeURIComponent(q)}` : ''}`

  // ── Records search ────────────────────────────────────────────────────────
  if (tab === 'records') {
    const date_from = (sp.date_from as string | undefined) ?? undefined
    const date_to = (sp.date_to as string | undefined) ?? undefined
    const filters: Record<string, string[]> = {}
    for (const field of MULTISELECT_FILTER_FIELDS) {
      const vals = normalise(sp[field.paramKey!])
      if (vals.length > 0) filters[field.paramKey!] = vals
    }

    const [result, archiveDates, filteredDates, filterOptions] = await Promise.all([
      searchDocuments({ q, date_from, date_to, filters, page }),
      getArchiveDates(),
      searchDocumentDates({ q, date_from, date_to, filters }),
      getDocumentFilterOptions(),
    ])
    const firstResult = (page - 1) * PAGE_SIZE + 1
    const lastResult = Math.min(page * PAGE_SIZE, result.total)

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 font-serif text-ink">
          Search the Archive
        </h1>
        <TabNav activeTab="records" recordsHref={recordsTabHref} personsHref={personsTabHref} />

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <div className="w-full lg:w-64 shrink-0">
            <Suspense>
              <SearchFilters filterFields={FILTER_FIELDS} filterOptions={filterOptions} />
            </Suspense>
          </div>
          <div className="flex-1 min-w-0">
            <ActiveFilters multiselectFields={MULTISELECT_FILTER_FIELDS} />
            <p className="text-sm mb-3 text-muted">
              {result.total === 0 ? 'No records match your search.' : (
                <>Showing <strong className="text-ink">{firstResult}–{lastResult}</strong> of <strong className="text-ink">{result.total.toLocaleString()}</strong> record{result.total !== 1 ? 's' : ''}</>
              )}
            </p>
            <TimelineChart archiveDates={archiveDates} filteredDates={filteredDates} />
            <RecordResultsTable records={result.records} />
            <Suspense>
              <Pagination currentPage={result.page} totalPages={result.totalPages} />
            </Suspense>
          </div>
        </div>
      </div>
    )
  }

  // ── Persons search ────────────────────────────────────────────────────────
  const filters: Record<string, string[]> = {}
  for (const field of PERSON_MULTISELECT_FILTER_FIELDS) {
    const vals = normalise(sp[field.paramKey!])
    if (vals.length > 0) filters[field.paramKey!] = vals
  }

  const [result, filterOptions] = await Promise.all([
    searchPersons({ q, filters, page }),
    getPersonFilterOptions(),
  ])
  const firstResult = (page - 1) * PAGE_SIZE + 1
  const lastResult = Math.min(page * PAGE_SIZE, result.total)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 font-serif text-ink">
        Search the Archive
      </h1>
      <TabNav activeTab="persons" recordsHref={recordsTabHref} personsHref={personsTabHref} />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div className="w-full lg:w-64 shrink-0">
          <Suspense>
            <SearchFilters filterFields={PERSON_FILTER_FIELDS} tab="persons" filterOptions={filterOptions} />
          </Suspense>
        </div>
        <div className="flex-1 min-w-0">
          <ActiveFilters multiselectFields={PERSON_MULTISELECT_FILTER_FIELDS} />
          <p className="text-sm mb-3 text-muted">
            {result.total === 0 ? 'No persons match your search.' : (
              <>Showing <strong className="text-ink">{firstResult}–{lastResult}</strong> of <strong className="text-ink">{result.total.toLocaleString()}</strong> person{result.total !== 1 ? 's' : ''}</>
            )}
          </p>
          <PersonResultsTable records={result.records} />
          <Suspense>
            <Pagination currentPage={result.page} totalPages={result.totalPages} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
