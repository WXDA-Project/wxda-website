'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FILTER_FIELDS, DATE_FILTER_FIELD, type FieldConfig } from '@/lib/field-config'

// ── Types ──────────────────────────────────────────────────────────────────

interface FilterDraft {
  q: string
  date_from: string
  date_to: string
  /** paramKey → selected values for every multiselect filter in the current tab */
  multiselects: Record<string, string[]>
}

// ── Pure helpers (no component state) ─────────────────────────────────────

function draftFromParams(sp: URLSearchParams, multiselectFields: FieldConfig[]): FilterDraft {
  const multiselects: Record<string, string[]> = {}
  for (const field of multiselectFields) {
    multiselects[field.paramKey!] = sp.getAll(field.paramKey!)
  }
  return {
    q: sp.get('q') ?? '',
    date_from: sp.get('date_from') ?? '',
    date_to: sp.get('date_to') ?? '',
    multiselects,
  }
}

function countActive(d: FilterDraft): number {
  return (
    (d.q ? 1 : 0) +
    (d.date_from || d.date_to ? 1 : 0) +
    Object.values(d.multiselects).reduce((sum, arr) => sum + arr.length, 0)
  )
}

function buildURL(draft: FilterDraft, tab?: string): string {
  const p = new URLSearchParams()
  if (tab) p.set('tab', tab)
  if (draft.q) p.set('q', draft.q)
  if (draft.date_from) p.set('date_from', draft.date_from)
  if (draft.date_to) p.set('date_to', draft.date_to)
  for (const [key, values] of Object.entries(draft.multiselects)) {
    values.forEach((v) => p.append(key, v))
  }
  return `/search${p.toString() ? `?${p}` : ''}`
}

// ── Multiselect group ──────────────────────────────────────────────────────

function MultiselectGroup({
  label,
  paramKey,
  options,
  selected,
  onChange,
}: {
  label: string
  paramKey: string
  options: string[]
  selected: string[]
  onChange: (key: string, values: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const hasSelection = selected.length > 0
  const groupId = `fg-${paramKey}`

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((v) => v !== opt)
      : [...selected, opt]
    onChange(paramKey, next)
  }

  return (
    <div className="border-b border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={groupId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2.5 text-sm font-semibold text-left text-ink bg-transparent border-0 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {label}
          {hasSelection && (
            <span
              className="text-xs font-bold rounded-full px-1.5 py-0.5 leading-none bg-crimson text-white"
              aria-label={`${selected.length} selected`}
            >
              {selected.length}
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-xs ml-2 shrink-0 text-muted">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <ul id={groupId} className="pb-2 space-y-0.5" role="group" aria-label={label}>
          {options.map((opt) => {
            const checked = selected.includes(opt)
            const cbId = `cb-${paramKey}-${opt.replace(/[\s/()]+/g, '-')}`
            return (
              <li key={opt}>
                <label
                  htmlFor={cbId}
                  className={`flex items-start gap-2 text-sm cursor-pointer px-1 py-1 rounded transition-colors text-ink ${
                    checked ? 'bg-tag-bg' : 'bg-transparent'
                  }`}
                >
                  <input
                    id={cbId}
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(opt)}
                    className="mt-0.5 shrink-0 accent-crimson"
                  />
                  <span>{opt}</span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── Date range group ───────────────────────────────────────────────────────

function DateRangeGroup({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: string
  dateTo: string
  onChange: (from: string, to: string) => void
}) {
  const MIN = DATE_FILTER_FIELD.minDate!
  const MAX = DATE_FILTER_FIELD.maxDate!

  return (
    <div className="border-b border-border pb-3">
      <p className="py-2.5 text-sm font-semibold text-ink">
        Date Range
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="date-from" className="block text-xs mb-1 text-muted">
            From
          </label>
          <input
            id="date-from"
            type="date"
            min={MIN}
            max={MAX}
            value={dateFrom}
            onChange={(e) => onChange(e.target.value, dateTo)}
            className="w-full px-2 py-1.5 text-sm rounded border border-border bg-paper text-ink scheme-light"
          />
        </div>
        <div>
          <label htmlFor="date-to" className="block text-xs mb-1 text-muted">
            To
          </label>
          <input
            id="date-to"
            type="date"
            min={MIN}
            max={MAX}
            value={dateTo}
            onChange={(e) => onChange(dateFrom, e.target.value)}
            className="w-full px-2 py-1.5 text-sm rounded border border-border bg-paper text-ink scheme-light"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => onChange('', '')}
            className="text-xs underline text-muted bg-transparent border-0 cursor-pointer p-0"
          >
            Clear dates
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface SearchFiltersProps {
  /**
   * All filterable fields for the current search tab (date-range + multiselect).
   * Defaults to the document FILTER_FIELDS when not provided.
   * Pass PERSON_FILTER_FIELDS for the persons tab.
   */
  filterFields?: FieldConfig[]
  /**
   * URL tab parameter to preserve when building filter URLs.
   * Omit for the records tab (default). Pass 'persons' for the persons tab.
   */
  tab?: string
}

export default function SearchFilters({
  filterFields = FILTER_FIELDS,
  tab,
}: SearchFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Derive sub-lists once (stable within a given tab render)
  const hasDateRange = filterFields.some((f) => f.filterType === 'date-range')
  const multiselectFields = filterFields.filter((f) => f.filterType === 'multiselect')

  const [draft, setDraft] = useState<FilterDraft>(() =>
    draftFromParams(searchParams, multiselectFields),
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  // Re-sync draft when URL changes externally (pill X clicks, clear all, tab switches)
  const spStr = searchParams.toString()
  useEffect(() => {
    setDraft(draftFromParams(searchParams, multiselectFields))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spStr])

  const urlDraft = draftFromParams(searchParams, multiselectFields)
  const activeCount = countActive(urlDraft)
  const draftCount = countActive(draft)
  const isDirty = buildURL(draft, tab) !== buildURL(urlDraft, tab)

  function handleMultiselect(key: string, values: string[]) {
    setDraft((d) => ({ ...d, multiselects: { ...d.multiselects, [key]: values } }))
  }

  function apply() {
    router.push(buildURL(draft, tab))
    setMobileOpen(false)
  }

  function clearAll() {
    const emptyMultiselects: Record<string, string[]> = {}
    for (const field of multiselectFields) {
      emptyMultiselects[field.paramKey!] = []
    }
    setDraft({ q: '', date_from: '', date_to: '', multiselects: emptyMultiselects })
    router.push(`/search${tab ? `?tab=${tab}` : ''}`)
    setMobileOpen(false)
  }

  const panel = (
    <aside aria-label="Search filters" className="bg-paper border border-border rounded">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-base font-bold text-ink font-serif">
          Filters
        </h2>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs underline text-crimson bg-transparent border-0 cursor-pointer"
            >
              Clear all
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close filter panel"
            className="lg:hidden text-lg leading-none text-muted bg-transparent border-0 cursor-pointer"
          >
            ×
          </button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-0">
        {/* Keyword search */}
        <div className="border-b border-border pb-3">
          <label
            htmlFor="sidebar-q"
            className="block text-sm font-semibold mb-1.5 text-ink"
          >
            Keyword Search
          </label>
          <input
            id="sidebar-q"
            type="search"
            value={draft.q}
            onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') apply() }}
            placeholder="Search all fields…"
            className="w-full px-3 py-2 text-sm rounded border border-border bg-paper text-ink"
          />
          <p className="mt-1.5 text-xs text-muted">
            Use <code className="font-mono">&quot;phrases&quot;</code>,{' '}
            <code className="font-mono">OR</code>,{' '}
            <code className="font-mono">-exclusions</code>
          </p>
        </div>

        {/* Date range — only shown when the field config includes a date-range filter */}
        {hasDateRange && (
          <div className="pt-0">
            <DateRangeGroup
              dateFrom={draft.date_from}
              dateTo={draft.date_to}
              onChange={(from, to) => setDraft((d) => ({ ...d, date_from: from, date_to: to }))}
            />
          </div>
        )}

        {/* Multiselect groups — driven entirely by the passed filterFields */}
        {multiselectFields.map((field) => (
          <MultiselectGroup
            key={field.key}
            label={field.label}
            paramKey={field.paramKey!}
            options={field.filterOptions!}
            selected={draft.multiselects[field.paramKey!] ?? []}
            onChange={handleMultiselect}
          />
        ))}
      </div>

      {/* Apply footer */}
      <div className="px-4 py-3 flex gap-2 border-t border-border">
        <button
          type="button"
          onClick={apply}
          disabled={!isDirty && draftCount === 0}
          className={`flex-1 py-2 text-sm font-semibold rounded text-white transition-opacity bg-crimson disabled:opacity-50 ${
            isDirty || draftCount > 0 ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
        >
          Apply Filters{draftCount > 0 ? ` (${draftCount})` : ''}
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-filter-panel"
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded border w-full justify-center cursor-pointer ${
            activeCount > 0
              ? 'border-crimson bg-crimson text-white'
              : 'border-border bg-paper text-ink'
          }`}
        >
          <span>⚙ Filters</span>
          {activeCount > 0 && (
            <span className="text-xs font-bold rounded-full px-1.5 py-0.5 leading-none bg-white/30">
              {activeCount} active
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Filter panel"
          id="mobile-filter-panel"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 w-80 max-w-full ml-auto h-full overflow-y-auto bg-parchment">
            {panel}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{panel}</div>
    </>
  )
}
