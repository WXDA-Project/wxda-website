import { DOC_TITLE_KEY, DOC_NAME_TITLE_KEY } from '../config/document-field-config'
import { PERSON_SORT_KEY, PERSON_NAME_TITLE_KEY, PERSON_TITLE_KEY } from '../config/person-field-config'
import {
  CONTAINER_NAME_TITLE_KEY,
  CONTAINER_SHORT_NAME_KEY,
  CONTAINER_TITLE_KEY,
} from '../config/container-field-config'

export const PAGE_SIZE = 20

// ── Row types ──────────────────────────────────────────────────────────────

export interface DocumentRow   { id: number; [key: string]: unknown }
export interface PersonRow     { id: number; [key: string]: unknown }
export interface PersonSummary { id: number; [key: string]: unknown }
export interface ContainerSummary { id: number; [key: string]: unknown }

// ── Display helpers ────────────────────────────────────────────────────────

export function containerDisplayName(c: ContainerSummary, id?: number | string): string {
  return (
    (c[CONTAINER_NAME_TITLE_KEY] as string | null) ??
    (c[CONTAINER_SHORT_NAME_KEY] as string | null) ??
    (c[CONTAINER_TITLE_KEY] as string | null) ??
    (id != null ? `Publication #${id}` : 'Publication')
  )
}

export function documentDisplayTitle(doc: Record<string, unknown>, id?: number | string): string {
  const nameTitleRaw = doc[DOC_NAME_TITLE_KEY]
  const nameTitle = Array.isArray(nameTitleRaw)
    ? (nameTitleRaw as string[])[0] ?? null
    : (nameTitleRaw as string | null)
  const title = doc[DOC_TITLE_KEY] as string | null
  return nameTitle || title || (id != null ? `Record #${id}` : 'Record')
}

export function personDisplayName(p: PersonSummary): string {
  const givenNames = p[PERSON_SORT_KEY] as string | null
  const nameTitleRaw = p[PERSON_NAME_TITLE_KEY]
  const surname = Array.isArray(nameTitleRaw)
    ? (nameTitleRaw as string[])[0]
    : (nameTitleRaw as string | null)
  if (givenNames && surname) return `${givenNames} ${surname}`
  if (givenNames) return givenNames
  if (surname) return surname
  return (p[PERSON_TITLE_KEY] as string | null) ?? `Person #${p.id}`
}
