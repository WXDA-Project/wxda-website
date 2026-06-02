'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveField, addField, deleteField, type AdminTable } from './actions'

// ── Column definitions ─────────────────────────────────────────────────────

interface ColDef {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean' | 'select'
  options?: string[]
  required?: boolean
  roleWarning?: boolean
  tableVisible?: boolean
  help?: string
}

const BASE_DOC_COLS: ColDef[] = [
  {
    key: 'sort_order', label: 'Sort Order', type: 'number', tableVisible: true,
    help: 'Display order — lower numbers appear first. Affects table columns, detail rows, and filter groups.',
  },
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'Exact column name in the Supabase database. Must match the column name precisely — this is what queries use to SELECT and filter.',
  },
  {
    key: 'label', label: 'Label', type: 'text', required: true, tableVisible: true,
    help: 'The name shown to visitors — used in table headers, filter panel labels, and the detail page field list.',
  },
  {
    key: 'role', label: 'Role', type: 'text', roleWarning: true, tableVisible: true,
    help: 'Semantic tag that tells the code what this field is for (e.g. "primary-date", "author-ref"). Only one field should carry each role. Leave empty for ordinary display fields.',
  },
  {
    key: 'filter_type', label: 'Filter Type', type: 'select', options: ['', 'text', 'date-range', 'multiselect'],
    help: '"text" = free-text search input; "date-range" = from/to date picker; "multiselect" = checkbox list of all distinct values in the database. Leave empty for display-only fields (no filter).',
  },
  {
    key: 'param_key', label: 'Param Key', type: 'text',
    help: 'URL query parameter name for this filter (e.g. "category" produces ?category=value in the address bar). Required whenever Filter Type is set.',
  },
  {
    key: 'show_in_table', label: 'Show in Table', type: 'boolean', tableVisible: true,
    help: 'Show this field as a column in the search results table.',
  },
  {
    key: 'show_in_detail', label: 'Show in Detail', type: 'boolean', tableVisible: true,
    help: 'Show this field in the key–value list on the full record detail page.',
  },
  {
    key: 'is_array', label: 'Is Array', type: 'boolean',
    help: 'The database column stores multiple values (text[]). Required for multiselect filters to work correctly — enables an "overlaps" query instead of an exact match.',
  },
  {
    key: 'hide_on_mobile', label: 'Hide on Mobile', type: 'boolean',
    help: 'Hide this table column on screens narrower than 640 px (phones).',
  },
  {
    key: 'hide_on_tablet', label: 'Hide on Tablet', type: 'boolean',
    help: 'Hide this table column on screens narrower than 1024 px (tablets and small laptops).',
  },
  {
    key: 'format', label: 'Format', type: 'select', options: ['', 'date'],
    help: '"date" renders the value as a human-readable date (e.g. 3 Jun 1820). Leave empty to display the raw text value.',
  },
  {
    key: 'max_table_length', label: 'Max Table Length', type: 'number',
    help: 'Truncate long text in the search results table after this many characters. Leave empty to use the default (60).',
  },
  {
    key: 'enriched', label: 'Enriched', type: 'boolean',
    help: 'This field is displayed in a dedicated section on the record page (e.g. Author, Publication). Turn this on to prevent it from also appearing in the main field list — otherwise it shows twice.',
  },
  {
    key: 'show_in_doc_summary', label: 'Show in Doc Summary', type: 'boolean',
    help: 'Include this field when listing documents on a person\'s profile page. Turn on for fields like title, date, and category.',
  },
]

const PERSON_EXTRA_COLS: ColDef[] = [
  {
    key: 'badge', label: 'Badge', type: 'boolean',
    help: 'Display this field as a highlighted chip in the person profile header. Good for categorical fields like person type or social rank. The first badge field (by sort order) is styled as primary.',
  },
  {
    key: 'show_in_enrichment', label: 'Show in Enrichment', type: 'boolean',
    help: 'Include this field when a person is referenced from a document (e.g. as an author or mentioned person). Required for any field used in the display name or badge chips in non-person contexts.',
  },
]

const CONTAINER_COLS: ColDef[] = [
  {
    key: 'sort_order', label: 'Sort Order', type: 'number', tableVisible: true,
    help: 'Order in which this column appears in the SELECT query sent to the database.',
  },
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'Exact column name in the containers table.',
  },
  {
    key: 'role', label: 'Role', type: 'text', roleWarning: true, tableVisible: true,
    help: 'Available roles: "container-name-title" (primary display name), "container-short-name" (abbreviated name), "container-title" (full title fallback), "container-summary" (description shown on record page), "container-source-url" (link shown on record page).',
  },
]

const RELATIONSHIP_COLS: ColDef[] = [
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'Exact column name in the relationships table.',
  },
  {
    key: 'role', label: 'Role', type: 'text', roleWarning: true, tableVisible: true,
    help: 'All three roles must be assigned: "relationship-source" (the document ID column), "relationship-target" (the person ID column), "relationship-type" (the label column, e.g. "is Mentioned In"). Queries that link persons to documents depend on these.',
  },
]

function getColDefs(table: AdminTable): ColDef[] {
  if (table === 'document_field_config') return BASE_DOC_COLS
  if (table === 'person_field_config') return [...BASE_DOC_COLS, ...PERSON_EXTRA_COLS]
  if (table === 'container_field_config') return CONTAINER_COLS
  return RELATIONSHIP_COLS
}

const TABLE_DESCRIPTIONS: Record<AdminTable, string> = {
  document_field_config:
    'Controls which columns appear on the Records search and record detail pages. Sort Order determines the order of table columns, filters, and detail rows.',
  person_field_config:
    'Controls which columns appear on the Persons search and person detail pages. Person-specific options include Badge (header chips) and Show in Enrichment (needed for display names and badges when a person is referenced from a document).',
  container_field_config:
    'Defines which columns are fetched from the containers table (publications, journals, series). Containers appear as enriched data on record detail pages — they are not browsed directly by visitors.',
  relationship_field_config:
    'Defines the column names used to query the relationships table, which links persons to documents. All three roles must always be assigned — the code depends on them to join the tables correctly.',
}

function defaultRow(cols: ColDef[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const c of cols) {
    if (c.type === 'boolean') row[c.key] = false
    else if (c.type === 'number') row[c.key] = c.key === 'sort_order' ? 0 : null
    else if (c.type === 'select') row[c.key] = ''
    else row[c.key] = ''
  }
  return row
}

// ── Props ──────────────────────────────────────────────────────────────────

interface FieldsClientProps {
  table: AdminTable
  rows: Record<string, unknown>[]
}

// ── Edit dialog ────────────────────────────────────────────────────────────

function EditDialog({
  dialogRef,
  editing,
  cols,
  onClose,
  onSave,
  isPending,
  serverError,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>
  editing: { row: Record<string, unknown>; isNew: boolean } | null
  cols: ColDef[]
  onClose: () => void
  onSave: (data: Record<string, unknown>) => void
  isPending: boolean
  serverError: string | null
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({})

  // Open the dialog when this component mounts (key-based remount ensures fresh draft per row)
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [dialogRef])

  if (!editing) return null

  function getVal(key: string): unknown {
    return key in draft ? draft[key] : editing!.row[key]
  }

  function set(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const merged: Record<string, unknown> = { ...editing!.row, ...draft }
    // Strip id for new rows
    if (editing!.isNew) {
      const rest = { ...merged }
      delete rest.id
      onSave(rest)
    } else {
      onSave(merged)
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl rounded border border-border bg-paper p-0 shadow-lg backdrop:bg-overlay"
      onClose={onClose}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-bold font-serif text-ink">
            {editing.isNew ? 'Add Field' : `Edit: ${String(editing.row.key ?? '')}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xl leading-none text-muted bg-transparent border-0 cursor-pointer hover:text-ink"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[70vh]">
          {serverError && (
            <p className="mb-4 text-sm text-crimson bg-crimson/10 border border-crimson/30 rounded px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {cols.map((col) => {
              const val = getVal(col.key)
              const inputId = `field-${col.key}`

              const labelEl = (
                <label
                  htmlFor={inputId}
                  className={`text-sm font-semibold text-ink ${col.type === 'boolean' ? 'cursor-pointer' : 'block mb-1'}`}
                >
                  {col.label}
                  {col.required && <span className="text-crimson ml-0.5">*</span>}
                  {col.roleWarning && (
                    <span
                      title="Roles affect query behaviour. Only change if you know what you're doing."
                      className="ml-1.5 text-xs text-amber-600 cursor-help"
                      aria-label="Warning: role affects query behaviour"
                    >
                      ⚠
                    </span>
                  )}
                </label>
              )

              if (col.type === 'boolean') {
                return (
                  <div key={col.key}>
                    <div className="flex items-center gap-2">
                      <input
                        id={inputId}
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => set(col.key, e.target.checked)}
                        className="accent-crimson w-4 h-4 cursor-pointer shrink-0"
                      />
                      {labelEl}
                    </div>
                    {col.help && (
                      <p className="mt-1 text-xs text-muted leading-snug pl-6">{col.help}</p>
                    )}
                  </div>
                )
              }

              return (
                <div key={col.key}>
                  {labelEl}
                  {col.type === 'select' ? (
                    <select
                      id={inputId}
                      value={String(val ?? '')}
                      onChange={(e) => set(col.key, e.target.value || null)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-border bg-paper text-ink"
                    >
                      {col.options!.map((o) => (
                        <option key={o} value={o}>{o || '(none)'}</option>
                      ))}
                    </select>
                  ) : col.type === 'number' ? (
                    <input
                      id={inputId}
                      type="number"
                      value={val == null ? '' : String(val)}
                      onChange={(e) => set(col.key, e.target.value === '' ? null : Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm rounded border border-border bg-paper text-ink"
                    />
                  ) : (
                    <input
                      id={inputId}
                      type="text"
                      required={col.required}
                      value={String(val ?? '')}
                      onChange={(e) => set(col.key, e.target.value || null)}
                      className="w-full px-2 py-1.5 text-sm rounded border border-border bg-paper text-ink"
                    />
                  )}
                  {col.help && (
                    <p className="mt-1 text-xs text-muted leading-snug">{col.help}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded border border-border bg-paper text-ink cursor-pointer hover:bg-tag-bg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold rounded bg-crimson text-on-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </dialog>
  )
}

// ── Main client component ──────────────────────────────────────────────────

export default function FieldsClient({ table, rows }: FieldsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<{ row: Record<string, unknown>; isNew: boolean } | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const cols = getColDefs(table)
  const tableCols = cols.filter((c) => c.tableVisible)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  function openEdit(row: Record<string, unknown>) {
    setServerError(null)
    setEditing({ row, isNew: false })
  }

  function openAdd() {
    setServerError(null)
    setEditing({ row: defaultRow(cols), isNew: true })
  }

  function closeDialog() {
    dialogRef.current?.close()
    setEditing(null)
    setServerError(null)
  }

  function handleSave(data: Record<string, unknown>) {
    startTransition(async () => {
      const result = editing!.isNew
        ? await addField(table, data)
        : await saveField(table, editing!.row.id as number, data)

      if (result.error) {
        setServerError(result.error)
      } else {
        closeDialog()
        showToast('Saved successfully')
        router.refresh()
      }
    })
  }

  function handleDelete(row: Record<string, unknown>) {
    const roleWarning = row.role
      ? ` This field has role "${row.role}" which affects query behaviour.`
      : ''
    if (!confirm(`Delete field "${row.key}"?${roleWarning}\n\nThis cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteField(table, row.id as number)
      if (result.error) {
        alert(`Delete failed: ${result.error}`)
      } else {
        showToast('Field deleted')
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 z-50 px-4 py-2 text-sm font-semibold rounded shadow-lg bg-ink text-paper"
        >
          {toast}
        </div>
      )}

      {/* Tab description */}
      <p className="mb-4 text-sm text-muted">{TABLE_DESCRIPTIONS[table]}</p>

      {/* Fields table */}
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-ink">
              {tableCols.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide text-muted whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              <th scope="col" className="py-2 px-3 w-[1%] whitespace-nowrap">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={tableCols.length + 1} className="py-8 text-center text-sm text-muted">
                  No fields configured yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.id as number} className="border-b border-border hover:bg-parchment transition-colors">
                {tableCols.map((c) => {
                  const val = row[c.key]
                  let display: string
                  if (c.type === 'boolean') display = val ? '✓' : '—'
                  else display = val == null || val === '' ? '—' : String(val)
                  return (
                    <td
                      key={c.key}
                      className={`py-2.5 px-3 align-top text-ink whitespace-nowrap ${c.roleWarning && val ? 'font-mono text-xs' : ''}`}
                    >
                      {c.type === 'boolean' ? (
                        <span className={val ? 'text-crimson font-semibold' : 'text-muted'}>{display}</span>
                      ) : (
                        display
                      )}
                    </td>
                  )
                })}
                <td className="py-2.5 px-3 align-top whitespace-nowrap">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-xs font-semibold underline text-crimson bg-transparent border-0 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      disabled={isPending}
                      className="text-xs font-semibold underline text-muted bg-transparent border-0 cursor-pointer hover:text-crimson disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add field */}
      <div className="mt-4">
        <button
          type="button"
          onClick={openAdd}
          className="px-4 py-2 text-sm font-semibold rounded border border-border bg-paper text-ink cursor-pointer hover:bg-tag-bg transition-colors"
        >
          + Add Field
        </button>
      </div>

      {/* Edit / Add dialog — keyed per row so state resets between opens */}
      <EditDialog
        key={editing ? (editing.isNew ? 'new' : String(editing.row.id)) : 'closed'}
        dialogRef={dialogRef}
        editing={editing}
        cols={cols}
        onClose={closeDialog}
        onSave={handleSave}
        isPending={isPending}
        serverError={serverError}
      />
    </>
  )
}
