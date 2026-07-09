export function normalise(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
}

/**
 * Multiselect filter values are stored as plain strings for "include" and
 * `!`-prefixed strings for "exclude" (set by the tri-state checkbox in
 * SearchFilters). Query builders split a field's raw values into the two
 * sets before applying them.
 */
export function splitFilterValues(values: string[]): { include: string[]; exclude: string[] } {
  const include: string[] = []
  const exclude: string[] = []
  for (const v of values) {
    if (v.startsWith('!')) exclude.push(v.slice(1))
    else include.push(v)
  }
  return { include, exclude }
}

/**
 * Builds a PostgREST `.or()` filter string that excludes rows matching any of
 * `values`, while still keeping rows where `column` is null. A plain
 * `.not(column, 'ov'|'in', ...)` would drop null rows too — in Postgres,
 * `NOT (null && x)` and `NOT (null IN (...))` evaluate to null, not true, so
 * rows with no value in the field fail the filter even though they can't
 * possibly contain the excluded value.
 */
export function excludeFilter(column: string, values: string[], mode: 'ov' | 'in'): string {
  const value = mode === 'ov' ? `{${values.join(',')}}` : `(${values.join(',')})`
  return `${column}.is.null,${column}.not.${mode}.${value}`
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr.length === 4 ? `${dateStr}-01-01` : dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '—'
  return String(value) || '—'
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export function extractSearchTerms(q: string): string[] {
  const terms: string[] = []
  const phraseRe = /"([^"]+)"/g
  let m: RegExpExecArray | null
  let remaining = q
  while ((m = phraseRe.exec(q)) !== null) {
    terms.push(m[1])
    remaining = remaining.replace(m[0], ' ')
  }
  for (const word of remaining.split(/\s+/)) {
    if (!word || word.toUpperCase() === 'OR' || word.startsWith('-')) continue
    terms.push(word)
  }
  return terms.filter(Boolean)
}

export function highlightSnippet(text: string, terms: string[], windowSize = 200): string | null {
  if (!text || terms.length === 0) return null
  const escaped = terms.map((t) => {
    const esc = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return (/^\w/.test(t) ? '\\b' : '') + esc + (/\w$/.test(t) ? '\\b' : '')
  })
  const pattern = new RegExp(`(${escaped.join('|')})`, 'gi')
  const first = pattern.exec(text)
  if (!first) return null
  const center = first.index
  const half = Math.floor(windowSize / 2)
  const rawStart = Math.max(0, center - half)
  const rawEnd = Math.min(text.length, rawStart + windowSize)
  const start = Math.max(0, rawEnd - windowSize)
  const end = rawEnd
  let snippet = text.slice(start, end)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  snippet = snippet.replace(new RegExp(`(${escaped.join('|')})`, 'gi'), '<mark>$1</mark>')
  return (start > 0 ? '…' : '') + snippet + (end < text.length ? '…' : '')
}
