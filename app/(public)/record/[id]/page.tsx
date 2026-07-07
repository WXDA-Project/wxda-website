import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import {
  getDocument,
  getDocumentEnrichment,
  getGeocodedLocations,
  personDisplayName,
  documentDisplayTitle,
  containerDisplayName,
  type PersonSummary,
  type ContainerSummary,
} from '@/lib/queries'
import { getDocumentConfig, getPersonConfig, getContainerConfig } from '@/lib/config/db-config'
import DownloadPdfButton, { type PdfDoc, type PdfSection } from '@/components/DownloadPdfButton'
import CitationBox from '@/components/CitationBox'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const MLA_MONTHS = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.']

function formatDateMLA(dateStr: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return `${d.getUTCDate()} ${MLA_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.length > 0 ? value.join('; ') : null
  const str = String(value).trim()
  return str || null
}

// Some records have the summary text duplicated at the end of the full title.
function stripSummarySuffix(fullTitle: string, summary: string | null | undefined): string {
  if (summary && fullTitle.endsWith(summary)) return fullTitle.slice(0, -summary.length).trimEnd()
  return fullTitle
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-muted">
      {children}
    </h2>
  )
}

function Divider() {
  return <hr className="border-border my-6" />
}

type PersonKeys = { PERSON_SORT_KEY: string; PERSON_NAME_TITLE_KEY: string; PERSON_TITLE_KEY: string }
type ContainerKeys = {
  CONTAINER_NAME_TITLE_KEY: string; CONTAINER_SHORT_NAME_KEY: string; CONTAINER_TITLE_KEY: string
  CONTAINER_SUMMARY_KEY: string; CONTAINER_SOURCE_URL_KEY: string
}

function PersonChip({
  person,
  personTypeKey,
  personKeys,
}: {
  person: PersonSummary
  personTypeKey: string
  personKeys: PersonKeys
}) {
  const name = personDisplayName(person, personKeys)
  const personType = person[personTypeKey] as string[] | null
  return (
    <Link
      href={`/person/${person.id}`}
      className="inline-flex items-center gap-1 text-sm rounded px-2.5 py-1 transition-colors hover:opacity-80 bg-tag-bg text-crimson no-underline font-semibold"
    >
      {name}
      {personType && personType.length > 0 && (
        <span className="text-xs font-normal text-muted">
          ({personType.join(', ')})
        </span>
      )}
    </Link>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [record, { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY }] = await Promise.all([
    getDocument(Number(id)),
    getDocumentConfig(),
  ])
  if (!record) return { title: 'Record Not Found' }
  return {
    title: documentDisplayTitle(record as Record<string, unknown>, { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY }, id),
  }
}

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)

  const [
    record,
    {
      DETAIL_FIELDS,
      AUTHOR_FIELD_KEY, CONTAINER_FIELD_KEY, SOURCE_URL_KEY,
      SORT_DATE_KEY, DOC_TITLE_KEY, DOC_NAME_TITLE_KEY, DOC_SUMMARY_KEY,
      LOCATION_FIELD_KEY,
    },
    {
      PERSON_TYPE_KEY, PERSON_SUMMARY_KEY,
      PERSON_SORT_KEY, PERSON_NAME_TITLE_KEY, PERSON_TITLE_KEY,
    },
    {
      CONTAINER_NAME_TITLE_KEY, CONTAINER_SHORT_NAME_KEY, CONTAINER_TITLE_KEY,
      CONTAINER_SUMMARY_KEY, CONTAINER_SOURCE_URL_KEY,
    },
    geocodedLocations,
    headersList,
  ] = await Promise.all([
    getDocument(numId),
    getDocumentConfig(),
    getPersonConfig(),
    getContainerConfig(),
    getGeocodedLocations(),
    headers(),
  ])

  if (!record) notFound()

  const rec = record as Record<string, string | string[] | null | undefined>

  const enrichment = await getDocumentEnrichment(
    (rec[AUTHOR_FIELD_KEY] as string[] | null) ?? [],
    (rec[CONTAINER_FIELD_KEY] as string | null) ?? null,
    numId,
  )

  const geocodedSet = new Set(geocodedLocations)

  const personKeys: PersonKeys = { PERSON_SORT_KEY, PERSON_NAME_TITLE_KEY, PERSON_TITLE_KEY }
  const containerKeys: ContainerKeys = {
    CONTAINER_NAME_TITLE_KEY, CONTAINER_SHORT_NAME_KEY, CONTAINER_TITLE_KEY,
    CONTAINER_SUMMARY_KEY, CONTAINER_SOURCE_URL_KEY,
  }
  const docKeys = { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY }

  const title = documentDisplayTitle(rec, docKeys, id)
  const fullTitle = rec[DOC_TITLE_KEY]
    ? stripSummarySuffix(rec[DOC_TITLE_KEY] as string, rec[DOC_SUMMARY_KEY] as string | null)
    : null

  // ── MLA citation ────────────────────────────────────────────────────────────
  const baseUrl = `${headersList.get('x-forwarded-proto') ?? 'https'}://${headersList.get('host')}`
  const recordUrl = `${baseUrl}/record/${id}`
  const now = new Date()
  const accessedDate = `${now.getDate()} ${MLA_MONTHS[now.getMonth()]} ${now.getFullYear()}`
  const authorNames = enrichment.authors.map((p) => personDisplayName(p, personKeys))
  const citationPubName = enrichment.container
    ? containerDisplayName(enrichment.container, containerKeys, enrichment.container.id)
    : null
  const citationDateStr = formatDateMLA(rec[SORT_DATE_KEY] as string | null)

  const citationAuthorStr =
    authorNames.length === 1 ? `${authorNames[0]}.` :
    authorNames.length === 2 ? `${authorNames[0]}, and ${authorNames[1]}.` :
    authorNames.length > 2 ? `${authorNames[0]}, et al.` :
    null
  const citationMid: string[] = []
  if (citationPubName) citationMid.push(citationPubName)
  if (citationDateStr) citationMid.push(citationDateStr)
  const titlePunct = /[.?!]$/.test(title) ? `"${title}"` : `"${title}."`
  const citationTextParts: string[] = []
  if (citationAuthorStr) citationTextParts.push(citationAuthorStr)
  citationTextParts.push(titlePunct)
  if (citationMid.length > 0) citationTextParts.push(citationMid.join(', ') + '.')
  citationTextParts.push(`Waterloo Cross-Dressing Archive, ${recordUrl}. Accessed ${accessedDate}.`)
  const citationText = citationTextParts.join(' ')

  const pdfSections: PdfSection[] = []

  if (rec[DOC_SUMMARY_KEY])
    pdfSections.push({ heading: 'Summary', rows: [{ label: '', value: rec[DOC_SUMMARY_KEY] as string }] })

  if (fullTitle && fullTitle !== title)
    pdfSections.push({ heading: 'Full Title', rows: [{ label: '', value: fullTitle }] })

  if (enrichment.container) {
    const c = enrichment.container
    const cName = containerDisplayName(c, containerKeys, c.id)
    const cRows: PdfSection['rows'] = [{ label: 'Title', value: cName }]
    const cShortName = c[CONTAINER_SHORT_NAME_KEY] as string | null
    if (cShortName && cShortName !== cName) cRows.push({ label: 'Short name', value: cShortName })
    if (c[CONTAINER_SUMMARY_KEY]) cRows.push({ label: 'Description', value: c[CONTAINER_SUMMARY_KEY] as string })
    pdfSections.push({ heading: 'Publication', rows: cRows })
  }

  if (enrichment.authors.length > 0)
    pdfSections.push({
      heading: 'Author / Creator',
      rows: [{ label: '', value: enrichment.authors.map((p) => personDisplayName(p, personKeys)).join('; ') }],
    })

  const detailRows = DETAIL_FIELDS
    .flatMap((field) => {
      if (field.format === 'image') {
        const raw = rec[field.key] as string[] | string | null
        const urls = Array.isArray(raw) ? raw : raw ? [raw] : []
        return urls.map((url, i) => ({ label: i === 0 ? field.label : '', value: url, isUrl: true as const }))
      }
      const v = field.format === 'date'
        ? formatDate(record[field.key] as string | null)
        : formatValue(record[field.key])
      return v ? [{ label: field.label, value: v }] : []
    })
  if (detailRows.length > 0) pdfSections.push({ heading: 'Record Details', rows: detailRows })

  if (enrichment.mentionedPersons.length > 0)
    pdfSections.push({
      heading: 'People Mentioned',
      rows: enrichment.mentionedPersons.map(({ person, relationship_type }) => ({
        label: personDisplayName(person, personKeys),
        value: [relationship_type, person[PERSON_SUMMARY_KEY]].filter(Boolean).join(' — '),
      })),
    })

  const citeRows: PdfSection['rows'] = [{ label: 'Cite as', value: citationText }]
  if (rec[SOURCE_URL_KEY]) citeRows.push({ label: 'Source URL', value: rec[SOURCE_URL_KEY] as string, isUrl: true })
  pdfSections.push({ heading: 'Citation', rows: citeRows })

  const pdfDoc: PdfDoc = {
    title: `Record #${id} — ${String(title)}`,
    subtitle: rec[SORT_DATE_KEY] ? formatDate(rec[SORT_DATE_KEY] as string) : '',
    sections: pdfSections,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex gap-2 list-none p-0 m-0 flex-wrap">
            <li><Link href="/" className="no-underline">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/search" className="no-underline">Search Records</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page">Record #{id}</li>
          </ol>
        </nav>
        <DownloadPdfButton pdf={pdfDoc} />
      </div>

      <article
        aria-label={`Record: ${title}`}
        className="p-4 sm:p-8 bg-paper border border-border rounded"
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-5 border-b-2 border-ink pb-4">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted">
            WXDA Record #{id}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold leading-snug font-serif text-ink">
            {title}
          </h1>
          {rec[SORT_DATE_KEY] && (
            <p className="mt-1 text-sm text-muted">
              {formatDate(rec[SORT_DATE_KEY] as string)}
            </p>
          )}
        </header>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {(rec[DOC_SUMMARY_KEY] as string | null) && (
          <>
            <section aria-label="Summary">
              <SectionHeading>Summary</SectionHeading>
              <p className="text-base leading-relaxed text-ink font-serif">
                {rec[DOC_SUMMARY_KEY] as string}
              </p>
            </section>
            <Divider />
          </>
        )}

        {/* ── Full verbatim title ──────────────────────────────────────────── */}
        {fullTitle && fullTitle !== title && (
          <>
            <section aria-label="Full title">
              <SectionHeading>Full Title</SectionHeading>
              <p className="text-sm leading-relaxed italic text-ink">
                {fullTitle}
              </p>
            </section>
            <Divider />
          </>
        )}

        {/* ── Publication (enriched container) ────────────────────────────── */}
        {enrichment.container && (
          <>
            <section aria-label="Publication details">
              <SectionHeading>Publication</SectionHeading>
              <ContainerCard container={enrichment.container} containerKeys={containerKeys} />
            </section>
            <Divider />
          </>
        )}

        {/* ── Author / Creator (enriched persons) ─────────────────────────── */}
        {enrichment.authors.length > 0 && (
          <>
            <section aria-label="Author or creator">
              <SectionHeading>Author / Creator</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {enrichment.authors.map((p) => (
                  <PersonChip key={p.id} person={p} personTypeKey={PERSON_TYPE_KEY} personKeys={personKeys} />
                ))}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── Image fields (one section per field) ────────────────────────── */}
        {DETAIL_FIELDS.filter((f) => f.format === 'image').map((field) => {
          const raw = record[field.key] as string[] | string | null
          const images = Array.isArray(raw) ? raw : raw ? [raw] : []
          if (images.length === 0) return null
          return (
            <div key={field.key}>
              <section aria-label={field.label}>
                <SectionHeading>{field.label}</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((src, i) => (
                    <a
                      key={src}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block no-underline"
                      aria-label={`View ${field.label.toLowerCase()}${images.length > 1 ? ` ${i + 1} of ${images.length}` : ''} (opens in new tab)`}
                    >
                      <div className="relative aspect-[4/3] rounded border border-border overflow-hidden bg-tag-bg">
                        <Image src={src} alt="" fill unoptimized className="object-contain" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
              <Divider />
            </div>
          )
        })}

        {/* ── All other structured fields ──────────────────────────────────── */}
        <section aria-label="Record details">
          <SectionHeading>Full Record</SectionHeading>
          <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3">
            {DETAIL_FIELDS.map((field) => {
              // Skip image fields
              if (field.format === 'image') return null

              if (field.key === LOCATION_FIELD_KEY) {
                const locs = (record[field.key] as string[] | null) ?? []
                if (locs.length === 0) return null
                return (
                  <div key={field.key} className="contents">
                    <dt className="text-sm font-semibold pt-0.5 text-muted">
                      {field.label}
                    </dt>
                    <dd className="text-sm text-ink m-0 space-y-1">
                      {locs.map((loc) => (
                        <div key={loc} className="flex items-center gap-2 flex-wrap">
                          <span>{loc}</span>
                          {geocodedSet.has(loc) && (
                            <Link
                              href={`/map?focus=${encodeURIComponent(loc)}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full no-underline transition-opacity bg-tag-bg text-crimson hover:opacity-75 shrink-0"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              View on map
                            </Link>
                          )}
                        </div>
                      ))}
                    </dd>
                  </div>
                )
              }

              const displayValue =
                field.format === 'date'
                  ? formatDate(record[field.key] as string | null)
                  : formatValue(record[field.key])

              if (!displayValue) return null

              return (
                <div key={field.key} className="contents">
                  <dt className="text-sm font-semibold pt-0.5 text-muted">
                    {field.label}
                  </dt>
                  <dd className="text-sm text-ink m-0">
                    {displayValue}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>

        {/* ── People mentioned in this record ──────────────────────────────── */}
        {enrichment.mentionedPersons.length > 0 && (
          <>
            <Divider />
            <section aria-label="People mentioned">
              <SectionHeading>People Mentioned in This Record</SectionHeading>
              <ul className="space-y-2 list-none p-0 m-0">
                {enrichment.mentionedPersons.map(({ person, relationship_type }, i) => (
                  <li key={`${person.id}-${i}`} className="flex items-start gap-3 flex-wrap">
                    <PersonChip person={person} personTypeKey={PERSON_TYPE_KEY} personKeys={personKeys} />
                    <span className="text-xs self-center text-muted">
                      {relationship_type}
                    </span>
                    {(person[PERSON_SUMMARY_KEY] as string | null) && (
                      <span className="text-xs self-center text-muted">
                        — {person[PERSON_SUMMARY_KEY] as string}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* ── Citation ─────────────────────────────────────────────────────── */}
        <Divider />
        <footer className="text-sm text-muted">
          <p className="font-semibold mb-2">Cite as (MLA 9)</p>
          <CitationBox
            authorNames={authorNames}
            title={title}
            publicationName={citationPubName}
            dateStr={citationDateStr}
            recordUrl={recordUrl}
            accessedDate={accessedDate}
            citationText={citationText}
          />
          {rec[SOURCE_URL_KEY] && (
            <p className="mt-3">
              <span className="font-semibold">Source URL: </span>
              <a
                href={rec[SOURCE_URL_KEY] as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                {rec[SOURCE_URL_KEY] as string}
              </a>
            </p>
          )}
        </footer>
      </article>

      <div className="mt-5">
        <Link href="/search" className="text-sm no-underline">
          ← Back to search results
        </Link>
      </div>
    </div>
  )
}

// ── Container card ─────────────────────────────────────────────────────────

function ContainerCard({
  container,
  containerKeys,
}: {
  container: ContainerSummary
  containerKeys: ContainerKeys
}) {
  const name = containerDisplayName(container, containerKeys, container.id)
  const shortName = container[containerKeys.CONTAINER_SHORT_NAME_KEY] as string | null
  return (
    <div className="text-sm">
      <p className="font-semibold text-ink">
        {name}
        {shortName && shortName !== name && (
          <span className="font-normal ml-2 text-muted">
            ({shortName})
          </span>
        )}
      </p>
      {(container[containerKeys.CONTAINER_SUMMARY_KEY] as string | null) && (
        <p className="mt-1 text-muted">
          {container[containerKeys.CONTAINER_SUMMARY_KEY] as string}
        </p>
      )}

    </div>
  )
}
