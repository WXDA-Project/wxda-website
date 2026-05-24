'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import type { FieldConfig } from '@/lib/config/document-field-config'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr.length === 4 ? `${dateStr}-01-01` : dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface ActiveFiltersProps {
  multiselectFields: FieldConfig[]
}

export default function ActiveFilters({ multiselectFields }: ActiveFiltersProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  type Pill = { label: string; removeKey: string; removeValue?: string }
  const pills: Pill[] = []

  const q = searchParams.get('q')
  const dateFrom = searchParams.get('date_from')
  const dateTo = searchParams.get('date_to')

  if (q) pills.push({ label: `"${q}"`, removeKey: 'q' })
  if (dateFrom || dateTo) {
    const from = dateFrom ? formatDate(dateFrom) : '…'
    const to = dateTo ? formatDate(dateTo) : '…'
    pills.push({ label: `Date: ${from} – ${to}`, removeKey: 'date' })
  }
  for (const field of multiselectFields) {
    searchParams.getAll(field.paramKey!).forEach((v) =>
      pills.push({ label: `${field.label}: ${v}`, removeKey: field.paramKey!, removeValue: v }),
    )
  }

  if (pills.length === 0) return null

  function removePill(pill: Pill) {
    const next = new URLSearchParams(searchParams.toString())
    next.delete('page')
    if (pill.removeKey === 'date') {
      next.delete('date_from')
      next.delete('date_to')
    } else if (pill.removeValue) {
      const remaining = searchParams.getAll(pill.removeKey).filter((v) => v !== pill.removeValue)
      next.delete(pill.removeKey)
      remaining.forEach((v) => next.append(pill.removeKey, v))
    } else {
      next.delete(pill.removeKey)
    }
    router.push(`/search${next.toString() ? `?${next}` : ''}`)
    // router.refresh() ensures the server component re-fetches even when the
    // router navigates within the same pathname (same-route param change).
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4" aria-label="Active filters">
      <span className="text-xs font-semibold self-center text-muted">Active:</span>
      {pills.map((pill) => (
        <button
          key={`${pill.removeKey}:${pill.removeValue ?? ''}`}
          type="button"
          onClick={() => removePill(pill)}
          className="flex items-center gap-1 text-xs rounded-full px-3 py-1 transition-opacity hover:opacity-75 max-w-[200px] sm:max-w-none bg-tag-bg text-tag-fg cursor-pointer"
          aria-label={`Remove filter: ${pill.label}`}
        >
          <span className="truncate">{pill.label}</span>
          <span aria-hidden="true" className="font-bold text-sm leading-none shrink-0">×</span>
        </button>
      ))}
    </div>
  )
}
