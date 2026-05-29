import { requireField } from '../../lib/config/db-config'

describe('requireField', () => {
  const fields = [
    { role: 'primary-date', key: 'date' },
    { role: 'doc-title', key: 'title' },
    { role: null, key: 'other' },
  ]

  it('returns the matching field when the role exists', () => {
    expect(requireField(fields, 'primary-date', 'test_table')).toEqual({ role: 'primary-date', key: 'date' })
  })

  it('returns any field shape — callers can access .key', () => {
    expect(requireField(fields, 'doc-title', 'test_table').key).toBe('title')
  })

  it('throws when the role is not found', () => {
    expect(() => requireField(fields, 'missing-role', 'test_table')).toThrow(
      'Missing required field config: role "missing-role" not found in test_table',
    )
  })

  it('throws when the fields array is empty', () => {
    expect(() => requireField([], 'any-role', 'test_table')).toThrow(
      'Missing required field config: role "any-role" not found in test_table',
    )
  })

  it('does not match a field whose role is null', () => {
    expect(() => requireField(fields, 'null', 'test_table')).toThrow()
  })

  it('includes both the role and table name in the error message', () => {
    expect(() => requireField(fields, 'bad-role', 'document_field_config')).toThrow(
      /bad-role.*document_field_config/,
    )
  })
})
