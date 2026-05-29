import {
  normalise,
  formatDate,
  formatValue,
  truncate,
  extractSearchTerms,
  highlightSnippet,
} from '../../lib/search-utils'

// ── normalise ──────────────────────────────────────────────────────────────

describe('normalise', () => {
  it('returns empty array for undefined', () => {
    expect(normalise(undefined)).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(normalise('')).toEqual([])
  })

  it('wraps a single string in an array', () => {
    expect(normalise('foo')).toEqual(['foo'])
  })

  it('returns an array as-is', () => {
    expect(normalise(['foo', 'bar'])).toEqual(['foo', 'bar'])
  })
})

// ── formatDate ─────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('returns em-dash for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('expands a 4-digit year to 1 Jan of that year', () => {
    expect(formatDate('1985')).toBe('1 Jan 1985')
  })

  it('formats a full ISO date string', () => {
    expect(formatDate('1985-06-15')).toBe('15 Jun 1985')
  })

  it('returns the original string for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

// ── formatValue ────────────────────────────────────────────────────────────

describe('formatValue', () => {
  it('returns em-dash for null', () => {
    expect(formatValue(null)).toBe('—')
  })

  it('returns em-dash for undefined', () => {
    expect(formatValue(undefined)).toBe('—')
  })

  it('returns em-dash for an empty array', () => {
    expect(formatValue([])).toBe('—')
  })

  it('joins a non-empty array with comma-space', () => {
    expect(formatValue(['a', 'b', 'c'])).toBe('a, b, c')
  })

  it('converts a number to string', () => {
    expect(formatValue(42)).toBe('42')
  })

  it('returns the string as-is', () => {
    expect(formatValue('hello')).toBe('hello')
  })

  it('returns em-dash for empty string', () => {
    expect(formatValue('')).toBe('—')
  })
})

// ── truncate ───────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('leaves a string shorter than max unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('leaves a string exactly at max unchanged', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })

  it('truncates a string longer than max and appends ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })
})

// ── extractSearchTerms ─────────────────────────────────────────────────────

describe('extractSearchTerms', () => {
  it('returns empty array for empty string', () => {
    expect(extractSearchTerms('')).toEqual([])
  })

  it('returns empty array for whitespace-only string', () => {
    expect(extractSearchTerms('   ')).toEqual([])
  })

  it('extracts a single word', () => {
    expect(extractSearchTerms('hello')).toEqual(['hello'])
  })

  it('extracts multiple words', () => {
    expect(extractSearchTerms('hello world')).toEqual(['hello', 'world'])
  })

  it('extracts a quoted phrase as a single term', () => {
    expect(extractSearchTerms('"cross dressing"')).toEqual(['cross dressing'])
  })

  it('extracts mix of quoted and unquoted terms', () => {
    expect(extractSearchTerms('"cross dressing" history')).toEqual(['cross dressing', 'history'])
  })

  it('strips OR operator (uppercase)', () => {
    expect(extractSearchTerms('cats OR dogs')).toEqual(['cats', 'dogs'])
  })

  it('strips OR operator (lowercase)', () => {
    expect(extractSearchTerms('cats or dogs')).toEqual(['cats', 'dogs'])
  })

  it('strips negated words starting with -', () => {
    expect(extractSearchTerms('history -modern')).toEqual(['history'])
  })
})

// ── highlightSnippet ───────────────────────────────────────────────────────

describe('highlightSnippet', () => {
  it('returns null for empty text', () => {
    expect(highlightSnippet('', ['term'])).toBeNull()
  })

  it('returns null for empty terms array', () => {
    expect(highlightSnippet('some text', [])).toBeNull()
  })

  it('returns null when no term matches', () => {
    expect(highlightSnippet('hello world', ['xyz'])).toBeNull()
  })

  it('wraps a matching term in <mark> tags', () => {
    const result = highlightSnippet('hello world', ['world'])
    expect(result).toBe('hello <mark>world</mark>')
  })

  it('matching is case-insensitive', () => {
    const result = highlightSnippet('Hello World', ['hello'])
    expect(result).toBe('<mark>Hello</mark> World')
  })

  it('matches multiple terms', () => {
    const result = highlightSnippet('cats and dogs', ['cats', 'dogs'])
    expect(result).toBe('<mark>cats</mark> and <mark>dogs</mark>')
  })

  it('escapes & in the source text before wrapping', () => {
    const result = highlightSnippet('bread & butter', ['butter'])
    expect(result).toBe('bread &amp; <mark>butter</mark>')
  })

  it('escapes < in the source text (XSS: tags cannot leak through)', () => {
    const result = highlightSnippet('<script>alert(1)</script> hello', ['hello'])
    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })

  it('escapes > in the source text', () => {
    const result = highlightSnippet('a > b and term', ['term'])
    expect(result).toContain('&gt;')
    expect(result).not.toContain('a > b')
  })

  it('escapes a term that contains regex special characters', () => {
    const result = highlightSnippet('price (special)', ['(special)'])
    expect(result).toBe('price <mark>(special)</mark>')
  })

  it('adds leading ellipsis when snippet starts mid-text', () => {
    const text = 'a'.repeat(200) + ' target'
    const result = highlightSnippet(text, ['target'], 50)
    expect(result).toMatch(/^…/)
  })

  it('adds trailing ellipsis when snippet ends before text end', () => {
    const text = 'target ' + 'a'.repeat(200)
    const result = highlightSnippet(text, ['target'], 50)
    expect(result).toMatch(/…$/)
  })

  it('no leading ellipsis when match is near the start', () => {
    const result = highlightSnippet('target is here', ['target'])
    expect(result).not.toMatch(/^…/)
  })

  it('no trailing ellipsis when match is near the end', () => {
    const result = highlightSnippet('the target', ['target'])
    expect(result).not.toMatch(/…$/)
  })

  it('respects a custom windowSize', () => {
    const text = 'word '.repeat(100)
    const result = highlightSnippet(text, ['word'], 20)
    // Snippet body (excluding leading/trailing ellipses and the mark tags) should be ≤ 20 chars
    const stripped = result!.replace(/^…/, '').replace(/…$/, '').replace(/<\/?mark>/g, '')
    expect(stripped.length).toBeLessThanOrEqual(20)
  })
})
