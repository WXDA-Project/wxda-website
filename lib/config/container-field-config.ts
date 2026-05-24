/**
 * CONTAINER FIELD CONFIG — single source of truth for the containers table.
 *
 * The containers table holds publications/journals that documents belong to.
 * To rename a column, change `key` here — all selects and accesses update automatically.
 */

type ContainerFieldRole =
  | 'container-name-title'  // preferred display name (shown first)
  | 'container-short-name'  // abbreviated/short name
  | 'container-title'       // full verbatim title
  | 'container-summary'     // short description
  | 'container-source-url'  // link to source database

interface ContainerField {
  key: string
  role?: ContainerFieldRole
}

const CONTAINER_FIELDS: ContainerField[] = [
  { key: 'name_title',    role: 'container-name-title' },
  { key: 'short_name',    role: 'container-short-name' },
  { key: 'title',         role: 'container-title' },
  { key: 'short_summary', role: 'container-summary' },
  { key: 'cite_as',       role: 'container-source-url' },
  { key: 'url' },
]

/** SELECT column list for container queries */
export const CONTAINER_SELECT_COLUMNS = ['id', ...CONTAINER_FIELDS.map((f) => f.key)].join(', ')

export const CONTAINER_NAME_TITLE_KEY = CONTAINER_FIELDS.find((f) => f.role === 'container-name-title')!.key
export const CONTAINER_SHORT_NAME_KEY = CONTAINER_FIELDS.find((f) => f.role === 'container-short-name')!.key
export const CONTAINER_TITLE_KEY      = CONTAINER_FIELDS.find((f) => f.role === 'container-title')!.key
export const CONTAINER_SUMMARY_KEY    = CONTAINER_FIELDS.find((f) => f.role === 'container-summary')!.key
export const CONTAINER_SOURCE_URL_KEY = CONTAINER_FIELDS.find((f) => f.role === 'container-source-url')!.key
