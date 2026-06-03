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
    help: 'Controls display order across the site — lower numbers appear first. Affects the order of table columns, the Full Record field list, and filter groups in the search sidebar.',
  },
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'The exact column name as it appears in Supabase. Must match precisely — this value is used directly in SELECT queries and filters.',
  },
  {
    key: 'label', label: 'Label', type: 'text', required: true, tableVisible: true,
    help: 'The name shown to visitors. Appears in search table headers, filter labels, and the Full Record field list on record pages.',
  },
  {
    key: 'role', label: 'Role', type: 'select', roleWarning: true, tableVisible: true,
    options: ['', 'primary-date', 'location', 'author-ref', 'container-ref', 'citation', 'source-url', 'doc-title', 'doc-name-title', 'doc-summary', 'doc-category'],
    help: 'Tells the code how to use this field. All roles in the list are required and must each be assigned to exactly one field — the site will break if any role is missing or duplicated. Leave blank for display-only fields.',
  },
  {
    key: 'filter_type', label: 'Filter Type', type: 'select', options: ['', 'text', 'date-range', 'multiselect'],
    help: 'The type of filter control shown in the search sidebar. "text" = a text input that searches this specific column using a substring match (only works on non-array columns); "date-range" = from/to date pickers; "multiselect" = checkbox list of every distinct value in the database. Leave blank for fields with no filter.',
  },
  {
    key: 'param_key', label: 'Param Key', type: 'text',
    help: 'The URL parameter name for this filter. For example, "category" produces ?category=value in the address bar. Required whenever Filter Type is set.',
  },
  {
    key: 'show_in_table', label: 'Show in Table', type: 'boolean', tableVisible: true,
    help: 'Show this field as a column in the search results table.',
  },
  {
    key: 'show_in_detail', label: 'Show in Detail', type: 'boolean', tableVisible: true,
    help: 'Show this field in the Full Record key–value list on record detail pages.',
  },
  {
    key: 'is_array', label: 'Is Array', type: 'boolean',
    help: 'Turn on if this column stores multiple values (text[] in PostgreSQL). Required for multiselect filters — uses an overlaps query instead of an exact match.',
  },
  {
    key: 'hide_on_mobile', label: 'Hide on Mobile', type: 'boolean',
    help: 'Hide this column from the search table on screens narrower than 640 px (phones).',
  },
  {
    key: 'hide_on_tablet', label: 'Hide on Tablet', type: 'boolean',
    help: 'Hide this column from the search table on screens narrower than 1024 px (tablets and small laptops).',
  },
  {
    key: 'format', label: 'Format', type: 'select', options: ['', 'date'],
    help: 'How to display the raw value. "date" converts a stored date string to a readable format like "3 Jun 1820". Leave blank to show the value as-is.',
  },
  {
    key: 'max_table_length', label: 'Max Table Length', type: 'number',
    help: 'Maximum characters to show in the search table before truncating with an ellipsis. Defaults to 60 if left blank.',
  },
]

const PERSON_COLS: ColDef[] = [
  {
    key: 'sort_order', label: 'Sort Order', type: 'number', tableVisible: true,
    help: 'Controls display order across the site — lower numbers appear first. Affects the order of table columns, the person detail field list, and filter groups in the search sidebar.',
  },
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'The exact column name as it appears in Supabase. Must match precisely — this value is used directly in SELECT queries and filters.',
  },
  {
    key: 'label', label: 'Label', type: 'text', required: true, tableVisible: true,
    help: 'The name shown to visitors. Appears in search table headers, filter labels, and the field list on person detail pages.',
  },
  {
    key: 'role', label: 'Role', type: 'select', roleWarning: true, tableVisible: true,
    options: ['', 'person-sort', 'person-name-title', 'person-title', 'person-type', 'person-summary'],
    help: 'Tells the code how to use this field. All roles in the list are required and must each be assigned to exactly one field — the site will break if any role is missing or duplicated. Leave blank for display-only fields.',
  },
  {
    key: 'filter_type', label: 'Filter Type', type: 'select', options: ['', 'text', 'date-range', 'multiselect'],
    help: 'The type of filter control shown in the search sidebar. "text" = a text input that searches this specific column using a substring match (only works on non-array columns); "date-range" = from/to date pickers; "multiselect" = checkbox list of every distinct value in the database. Leave blank for fields with no filter.',
  },
  {
    key: 'param_key', label: 'Param Key', type: 'text',
    help: 'The URL parameter name for this filter. For example, "type" produces ?type=value in the address bar. Required whenever Filter Type is set.',
  },
  {
    key: 'show_in_table', label: 'Show in Table', type: 'boolean', tableVisible: true,
    help: 'Show this field as a column in the persons search results table.',
  },
  {
    key: 'show_in_detail', label: 'Show in Detail', type: 'boolean', tableVisible: true,
    help: 'Show this field in the key–value list on person detail pages.',
  },
  {
    key: 'is_array', label: 'Is Array', type: 'boolean',
    help: 'Turn on if this column stores multiple values (text[] in PostgreSQL). Required for multiselect filters — uses an overlaps query instead of an exact match.',
  },
  {
    key: 'hide_on_mobile', label: 'Hide on Mobile', type: 'boolean',
    help: 'Hide this column from the search table on screens narrower than 640 px (phones).',
  },
  {
    key: 'hide_on_tablet', label: 'Hide on Tablet', type: 'boolean',
    help: 'Hide this column from the search table on screens narrower than 1024 px (tablets and small laptops).',
  },
  {
    key: 'format', label: 'Format', type: 'select', options: ['', 'date'],
    help: 'How to display the raw value. "date" converts a stored date string to a readable format like "3 Jun 1820". Leave blank to show the value as-is.',
  },
  {
    key: 'max_table_length', label: 'Max Table Length', type: 'number',
    help: 'Maximum characters to show in the search table before truncating with an ellipsis. Defaults to 60 if left blank.',
  },
  {
    key: 'badge', label: 'Badge', type: 'boolean',
    help: 'Show this field as a highlighted chip in the person profile header. Best for short categorical values like type or rank. The first badge field by sort order gets the primary (accent colour) style; others get a secondary style.',
  },
]

const CONTAINER_COLS: ColDef[] = [
  {
    key: 'sort_order', label: 'Sort Order', type: 'number', tableVisible: true,
    help: 'Controls the order columns are fetched in the SELECT query.',
  },
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'The exact column name as it appears in the containers table in Supabase.',
  },
  {
    key: 'role', label: 'Role', type: 'select', roleWarning: true, tableVisible: true,
    options: ['', 'container-name-title', 'container-short-name', 'container-title', 'container-summary', 'container-source-url'],
    help: 'Tells the code how to display this column in the Publication section on record pages. All roles in the list are required and must each be assigned to exactly one field.',
  },
]

const RELATIONSHIP_COLS: ColDef[] = [
  {
    key: 'key', label: 'Key', type: 'text', required: true, tableVisible: true,
    help: 'The exact column name as it appears in the relationships table in Supabase.',
  },
  {
    key: 'role', label: 'Role', type: 'select', roleWarning: true, tableVisible: true,
    options: ['', 'relationship-source', 'relationship-target', 'relationship-type'],
    help: 'Tells the code which column is which in the relationships table. All three roles are required — the site cannot link persons to documents without them. "relationship-source" = document ID column; "relationship-target" = person ID column; "relationship-type" = the label describing the relationship (e.g. "is Mentioned In").',
  },
]

function getColDefs(table: AdminTable): ColDef[] {
  if (table === 'document_field_config') return BASE_DOC_COLS
  if (table === 'person_field_config') return PERSON_COLS
  if (table === 'container_field_config') return CONTAINER_COLS
  return RELATIONSHIP_COLS
}

const TABLE_DESCRIPTIONS: Record<AdminTable, string> = {
  document_field_config:
    'Controls which fields appear on the Records search page and individual record pages. Sort Order sets the display order of table columns, filters, and the Full Record field list.',
  person_field_config:
    'Controls which fields appear on the Persons search page and individual person pages. Badge fields appear as chips in the person profile header. Show in Enrichment controls which fields are available when a person appears on a record page (as an author or mentioned person).',
  container_field_config:
    'Controls which columns are fetched from the containers table (publications, journals, series). Containers are shown in a dedicated Publication section on record pages — they have no standalone browse page.',
  relationship_field_config:
    'Maps the column names in the relationships table, which links persons to documents. All three role assignments are required — the code uses them to join the tables at query time.',
}

function defaultRow(cols: ColDef[]): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  for (const c of cols) {
    if (c.type === 'boolean') row[c.key] = false
    else if (c.type === 'number') row[c.key] = c.key === 'sort_order' ? 0 : null
    else if (c.type === 'select') row[c.key] = null
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
