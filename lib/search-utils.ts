export function normalise(v: string | string[] | undefined): string[] {
  if (!v) return []
  return Array.isArray(v) ? v : [v]
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
