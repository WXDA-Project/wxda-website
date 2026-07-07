import {
  documentDisplayTitle,
  personDisplayName,
  containerDisplayName,
} from '../../lib/queries/types'

// ── documentDisplayTitle ───────────────────────────────────────────────────

const DOC_KEYS = { DOC_NAME_TITLE_KEY: 'name_title', DOC_TITLE_KEY: 'title' }

describe('documentDisplayTitle', () => {
  it('returns name_title when present', () => {
    expect(documentDisplayTitle({ name_title: 'Name Title', title: 'Title' }, DOC_KEYS))
      .toBe('Name Title')
  })

  it('returns first element when name_title is an array', () => {
    expect(documentDisplayTitle({ name_title: ['Smith', 'Jones'], title: 'Title' }, DOC_KEYS))
      .toBe('Smith')
  })

  it('skips null array element and falls back to title', () => {
    expect(documentDisplayTitle({ name_title: [null], title: 'Title' }, DOC_KEYS))
      .toBe('Title')
  })

  it('falls back to title when name_title is null', () => {
    expect(documentDisplayTitle({ name_title: null, title: 'Title' }, DOC_KEYS))
      .toBe('Title')
  })

  it('falls back to title when name_title is empty string', () => {
    expect(documentDisplayTitle({ name_title: '', title: 'Title' }, DOC_KEYS))
      .toBe('Title')
  })

  it('returns Record #id when both fields null', () => {
    expect(documentDisplayTitle({ name_title: null, title: null }, DOC_KEYS, 42))
      .toBe('Record #42')
  })

  it('returns Record when both fields null and no id provided', () => {
    expect(documentDisplayTitle({ name_title: null, title: null }, DOC_KEYS))
      .toBe('Record')
  })
})

// ── personDisplayName ──────────────────────────────────────────────────────

const PERSON_KEYS = {
  PERSON_GIVEN_NAME_KEY: 'given_names',
  PERSON_SURNAME_KEY: 'surname',
  PERSON_TITLE_KEY: 'full_name',
}

describe('personDisplayName', () => {
  it('combines given names and surname', () => {
    expect(personDisplayName({ id: 1, given_names: 'Jane', surname: 'Smith' }, PERSON_KEYS))
      .toBe('Jane Smith')
  })

  it('returns given names alone when surname is null', () => {
    expect(personDisplayName({ id: 1, given_names: 'Jane', surname: null }, PERSON_KEYS))
      .toBe('Jane')
  })

  it('returns surname alone when given names is null', () => {
    expect(personDisplayName({ id: 1, given_names: null, surname: 'Smith' }, PERSON_KEYS))
      .toBe('Smith')
  })

  it('uses first element when surname is an array', () => {
    expect(personDisplayName({ id: 1, given_names: 'Jane', surname: ['Smith', 'Jones'] }, PERSON_KEYS))
      .toBe('Jane Smith')
  })

  it('falls back to full_name when both name fields null', () => {
    expect(personDisplayName({ id: 1, given_names: null, surname: null, full_name: 'Full Name' }, PERSON_KEYS))
      .toBe('Full Name')
  })

  it('returns Person #id when all fields null', () => {
    expect(personDisplayName({ id: 42, given_names: null, surname: null, full_name: null }, PERSON_KEYS))
      .toBe('Person #42')
  })
})

// ── containerDisplayName ───────────────────────────────────────────────────

const CONTAINER_KEYS = {
  CONTAINER_NAME_TITLE_KEY: 'name_title',
  CONTAINER_SHORT_NAME_KEY: 'short_name',
  CONTAINER_TITLE_KEY: 'title',
}

describe('containerDisplayName', () => {
  it('returns name_title when present', () => {
    expect(containerDisplayName(
      { id: 1, name_title: 'Full Name', short_name: 'N', title: 'Title' },
      CONTAINER_KEYS,
    )).toBe('Full Name')
  })

  it('falls back to short_name when name_title is null', () => {
    expect(containerDisplayName(
      { id: 1, name_title: null, short_name: 'N', title: 'Title' },
      CONTAINER_KEYS,
    )).toBe('N')
  })

  it('falls back to title when name_title and short_name are null', () => {
    expect(containerDisplayName(
      { id: 1, name_title: null, short_name: null, title: 'Title' },
      CONTAINER_KEYS,
    )).toBe('Title')
  })

  it('returns Publication #id when all fields null', () => {
    expect(containerDisplayName(
      { id: 5, name_title: null, short_name: null, title: null },
      CONTAINER_KEYS,
      5,
    )).toBe('Publication #5')
  })

  it('returns Publication when all fields null and no id provided', () => {
    expect(containerDisplayName(
      { id: 5, name_title: null, short_name: null, title: null },
      CONTAINER_KEYS,
    )).toBe('Publication')
  })
})
