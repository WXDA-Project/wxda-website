'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { FieldConfig } from '@/lib/config/db-config'
import SearchHelpTooltip from './SearchHelpTooltip'

// ── Types ──────────────────────────────────────────────────────────────────

interface FilterDraft {
  q: string
  date_from: string
  date_to: string
  /** paramKey → selected values for every multiselect filter in the current tab */
  multiselects: Record<string, string[]>
  /** paramKey → value for every text filter in the current tab */
  textFilters: Record<string, string>
}

// ── Pure helpers (no component state) ─────────────────────────────────────

function draftFromParams(sp: URLSearchParams, multiselectParamKeys: string[], textFilterFields: FieldConfig[]): FilterDraft {
  const multiselects: Record<string, string[]> = {}
  for (const paramKey of multiselectParamKeys) {
    multiselects[paramKey] = sp.getAll(paramKey)
  }
  const textFilters: Record<string, string> = {}
  for (const field of textFilterFields) {
    textFilters[field.paramKey!] = sp.get(field.paramKey!) ?? ''
  }
  return {
    q: sp.get('q') ?? '',
    date_from: sp.get('date_from') ?? '',
    date_to: sp.get('date_to') ?? '',
    multiselects,
    textFilters,
  }
}

function countActive(d: FilterDraft): number {
  return (
    (d.q ? 1 : 0) +
    (d.date_from || d.date_to ? 1 : 0) +
    Object.values(d.multiselects).reduce((sum, arr) => sum + arr.length, 0) +
    Object.values(d.textFilters).filter(Boolean).length
  )
}

function buildURL(draft: FilterDraft, basePath: string, tab?: string): string {
  const p = new URLSearchParams()
  if (tab) p.set('tab', tab)
  if (draft.q) p.set('q', draft.q)
  if (draft.date_from) p.set('date_from', draft.date_from)
  if (draft.date_to) p.set('date_to', draft.date_to)
  for (const [key, values] of Object.entries(draft.multiselects)) {
    values.forEach((v) => p.append(key, v))
  }
  for (const [key, value] of Object.entries(draft.textFilters)) {
    if (value) p.set(key, value)
  }
  return `${basePath}${p.toString() ? `?${p}` : ''}`
}

// ── Multiselect group ──────────────────────────────────────────────────────

function MultiselectGroup({
  label,
  paramKey,
  options,
  optionLabels,
  selected,
  counts,
  onChange,
}: {
  label: string
  paramKey: string
  options: string[]
  /** Display label for each option value, when it differs from the value itself (e.g. a container id vs. its name). */
  optionLabels?: Record<string, string>
  selected: string[]
  counts?: Record<string, number>
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

  // When counts are available, hide options with zero count unless already selected
  const visibleOptions = counts
    ? options.filter((opt) => (counts[opt] ?? 0) > 0 || selected.includes(opt))
    : options

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
              className="text-xs font-bold rounded-full px-1.5 py-0.5 leading-none bg-crimson text-on-accent"
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
          {visibleOptions.map((opt) => {
            const checked = selected.includes(opt)
            const count = counts?.[opt] ?? 0
            const cbId = `cb-${paramKey}-${opt.replace(/[\s/()]+/g, '-')}`
            return (
              <li key={opt}>
                <label
                  htmlFor={cbId}
                  className={`flex items-center gap-2 text-sm cursor-pointer px-1 py-1 rounded transition-colors text-ink ${
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
                  <span className="flex-1 min-w-0">{optionLabels?.[opt] ?? opt}</span>
                  {counts && (
                    <span className="text-xs text-muted tabular-nums shrink-0">
                      {count.toLocaleString()}
                    </span>
                  )}
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
  minDate,
  maxDate,
  onChange,
}: {
  dateFrom: string
  dateTo: string
  minDate?: string
  maxDate?: string
  onChange: (from: string, to: string) => void
}) {
  const MIN = minDate
  const MAX = maxDate

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

interface ContainerFilterProps {
  label: string
  paramKey: string
  options: { id: string; label: string }[]
  counts?: Record<string, number>
}

interface SearchFiltersProps {
  filterFields: FieldConfig[]
  dateFilterField?: FieldConfig
  dateBounds?: { min: string; max: string }
  tab?: string
  basePath?: string
  filterOptions: Record<string, string[]>
  filterCounts?: Record<string, Record<string, number>>
  showKeywordSearch?: boolean
  containerFilter?: ContainerFilterProps
}

export default function SearchFilters({
  filterFields,
  dateFilterField,
  dateBounds,
  tab,
  basePath = '/search',
  filterOptions,
  filterCounts,
  showKeywordSearch = true,
  containerFilter,
}: SearchFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Derive sub-lists once (stable within a given tab render)
  const hasDateRange = filterFields.some((f) => f.filterType === 'date-range')
  const multiselectFields = filterFields.filter((f) => f.filterType === 'multiselect')
  const textFilterFields = filterFields.filter((f) => f.filterType === 'text')
  const multiselectParamKeys = [
    ...multiselectFields.map((f) => f.paramKey!),
    ...(containerFilter ? [containerFilter.paramKey] : []),
  ]

  const spStr = searchParams.toString()
  const [prevSpStr, setPrevSpStr] = useState(spStr)
  const [draft, setDraft] = useState<FilterDraft>(() =>
    draftFromParams(searchParams, multiselectParamKeys, textFilterFields),
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  // Re-sync draft when URL changes externally (pill X clicks, clear all, tab switches)
  if (prevSpStr !== spStr) {
    setPrevSpStr(spStr)
    setDraft(draftFromParams(searchParams, multiselectParamKeys, textFilterFields))
  }

  const urlDraft = draftFromParams(searchParams, multiselectParamKeys, textFilterFields)
  const activeCount = countActive(urlDraft)
  const draftCount = countActive(draft)
  const isDirty = buildURL(draft, basePath, tab) !== buildURL(urlDraft, basePath, tab)

  function handleMultiselect(key: string, values: string[]) {
    setDraft((d) => ({ ...d, multiselects: { ...d.multiselects, [key]: values } }))
  }

  function apply() {
    router.push(buildURL(draft, basePath, tab))
    setMobileOpen(false)
  }

  function clearAll() {
    const emptyMultiselects: Record<string, string[]> = {}
    for (const paramKey of multiselectParamKeys) emptyMultiselects[paramKey] = []
    const emptyTextFilters: Record<string, string> = {}
    for (const field of textFilterFields) emptyTextFilters[field.paramKey!] = ''
    setDraft({ q: '', date_from: '', date_to: '', multiselects: emptyMultiselects, textFilters: emptyTextFilters })
    router.push(`${basePath}${tab ? `?tab=${tab}` : ''}`)
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

      <div className={`px-4 space-y-0 ${showKeywordSearch ? 'py-3' : 'pb-3'}`}>
        {/* Keyword search */}
        {showKeywordSearch && (
          <div className="border-b border-border pb-3">
            <label
              htmlFor="sidebar-q"
              className="flex items-center gap-1.5 text-sm font-semibold mb-1.5 text-ink"
            >
              Keyword Search <SearchHelpTooltip />
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
          </div>
        )}

        {/* Date range — only shown when the field config includes a date-range filter */}
        {hasDateRange && dateFilterField && (
          <div className="pt-0">
            <DateRangeGroup
              dateFrom={draft.date_from}
              dateTo={draft.date_to}
              minDate={dateBounds?.min}
              maxDate={dateBounds?.max}
              onChange={(from, to) => setDraft((d) => ({ ...d, date_from: from, date_to: to }))}
            />
          </div>
        )}

        {/* Per-field text filters — ilike search on a specific column */}
        {textFilterFields.map((field) => (
          <div key={field.key} className="border-b border-border pb-3">
            <label
              htmlFor={`tf-${field.paramKey}`}
              className="block py-2.5 text-sm font-semibold text-ink"
            >
              {field.label}
            </label>
            <input
              id={`tf-${field.paramKey}`}
              type="search"
              value={draft.textFilters[field.paramKey!] ?? ''}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  textFilters: { ...d.textFilters, [field.paramKey!]: e.target.value },
                }))
              }
              onKeyDown={(e) => { if (e.key === 'Enter') apply() }}
              placeholder={`Filter by ${field.label.toLowerCase()}…`}
              className="w-full px-3 py-2 text-sm rounded border border-border bg-paper text-ink"
            />
          </div>
        ))}

        {/* Multiselect groups — driven entirely by the passed filterFields */}
        {multiselectFields.map((field) => (
          <MultiselectGroup
            key={field.key}
            label={field.label}
            paramKey={field.paramKey!}
            options={filterOptions[field.paramKey!] ?? []}
            selected={draft.multiselects[field.paramKey!] ?? []}
            counts={filterCounts?.[field.paramKey!]}
            onChange={handleMultiselect}
          />
        ))}

        {/* Container filter — options are container ids, labelled with the container's display name */}
        {containerFilter && (
          <MultiselectGroup
            label={containerFilter.label}
            paramKey={containerFilter.paramKey}
            options={containerFilter.options.map((o) => o.id)}
            optionLabels={Object.fromEntries(containerFilter.options.map((o) => [o.id, o.label]))}
            selected={draft.multiselects[containerFilter.paramKey] ?? []}
            counts={containerFilter.counts}
            onChange={handleMultiselect}
          />
        )}
      </div>

      {/* Apply footer */}
      <div className="px-4 py-3 flex gap-2 border-t border-border">
        <button
          type="button"
          onClick={apply}
          disabled={!isDirty && draftCount === 0}
          className={`flex-1 py-2 text-sm font-semibold rounded text-on-accent transition-opacity bg-crimson disabled:opacity-50 ${
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
              ? 'border-crimson bg-crimson text-on-accent'
              : 'border-border bg-paper text-ink'
          }`}
        >
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="text-xs font-bold rounded-full px-1.5 py-0.5 leading-none bg-on-accent-faint">
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
            className="absolute inset-0 bg-overlay"
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
