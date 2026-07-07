export const PAGE_SIZE = 20

// ── Row types ──────────────────────────────────────────────────────────────

export interface DocumentRow   { id: number; [key: string]: unknown }
export interface PersonRow     { id: number; [key: string]: unknown }
export interface PersonSummary { id: number; [key: string]: unknown }
export interface ContainerSummary { id: number; [key: string]: unknown }

// ── Display helpers ────────────────────────────────────────────────────────
// Each function accepts a keys object so callers can pass the awaited config
// directly without these functions needing async DB access themselves.

export function containerDisplayName(
  c: ContainerSummary,
  keys: { CONTAINER_NAME_TITLE_KEY: string; CONTAINER_SHORT_NAME_KEY: string; CONTAINER_TITLE_KEY: string },
  id?: number | string,
): string {
  return (
    (c[keys.CONTAINER_NAME_TITLE_KEY] as string | null) ??
    (c[keys.CONTAINER_SHORT_NAME_KEY] as string | null) ??
    (c[keys.CONTAINER_TITLE_KEY] as string | null) ??
    (id != null ? `Publication #${id}` : 'Publication')
  )
}

export function documentDisplayTitle(
  doc: Record<string, unknown>,
  keys: { DOC_NAME_TITLE_KEY: string; DOC_TITLE_KEY: string },
  id?: number | string,
): string {
  const nameTitleRaw = doc[keys.DOC_NAME_TITLE_KEY]
  const nameTitle = Array.isArray(nameTitleRaw)
    ? (nameTitleRaw as string[])[0] ?? null
    : (nameTitleRaw as string | null)
  const title = doc[keys.DOC_TITLE_KEY] as string | null
  return nameTitle || title || (id != null ? `Record #${id}` : 'Record')
}

export function personDisplayName(
  p: PersonSummary,
  keys: { PERSON_GIVEN_NAME_KEY: string; PERSON_SURNAME_KEY: string; PERSON_TITLE_KEY: string },
): string {
  const givenNames = p[keys.PERSON_GIVEN_NAME_KEY] as string | null
  const surnameRaw = p[keys.PERSON_SURNAME_KEY]
  const surname = Array.isArray(surnameRaw)
    ? (surnameRaw as string[])[0]
    : (surnameRaw as string | null)
  if (givenNames && surname) return `${givenNames} ${surname}`
  if (givenNames) return givenNames
  if (surname) return surname
  return (p[keys.PERSON_TITLE_KEY] as string | null) ?? `Person #${p.id}`
}
