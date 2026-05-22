import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getDocument,
  getDocumentEnrichment,
  personDisplayName,
  type PersonSummary,
  type ContainerSummary,
} from '@/lib/queries'
import {
  DETAIL_FIELDS,
  ENRICHED_KEYS,
  AUTHOR_FIELD_KEY,
  CONTAINER_FIELD_KEY,
  CITE_AS_KEY,
  SOURCE_URL_KEY,
  SORT_DATE_KEY,
} from '@/lib/field-config'
import DownloadPdfButton, { type PdfDoc, type PdfSection } from '@/components/DownloadPdfButton'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatValue(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.length > 0 ? value.join('; ') : null
  const str = String(value).trim()
  return str || null
}

// ── Shared sub-components ──────────────────────────────────────────────────

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

function PersonChip({ person }: { person: PersonSummary }) {
  const name = personDisplayName(person)
  return (
    <Link
      href={`/person/${person.id}`}
      className="inline-flex items-center gap-1 text-sm rounded px-2.5 py-1 transition-colors hover:opacity-80 bg-tag-bg text-crimson no-underline font-semibold"
    >
      {name}
      {person.person_type && person.person_type.length > 0 && (
        <span className="text-xs font-normal text-muted">
          ({person.person_type.join(', ')})
        </span>
      )}
    </Link>
  )
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const record = await getDocument(Number(id))
  if (!record) return { title: 'Record Not Found' }
  return {
    title: (record.name_title as string) || (record.title as string) || `Record #${id}`,
  }
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)

  const record = await getDocument(numId)
  if (!record) notFound()

  const rec = record as Record<string, string | string[] | null | undefined>

  // Fetch enrichment (authors → persons, container → containers, relationships → persons)
  const enrichment = await getDocumentEnrichment(
    (rec[AUTHOR_FIELD_KEY] as string[] | null) ?? [],
    (rec[CONTAINER_FIELD_KEY] as string | null) ?? null,
    numId,
  )

  const title = rec.name_title || rec.title || `Record #${id}`

  // ── Build PDF document ────────────────────────────────────────────────────
  const pdfSections: PdfSection[] = []

  if (rec.short_summary)
    pdfSections.push({ heading: 'Summary', rows: [{ label: '', value: rec.short_summary as string }] })

  if (rec.title && rec.title !== title)
    pdfSections.push({ heading: 'Full Title', rows: [{ label: '', value: rec.title as string }] })

  if (enrichment.container) {
    const c = enrichment.container
    const cName = String(c.name_title ?? c.short_name ?? c.title ?? `Publication #${c.id}`)
    const cRows: PdfSection['rows'] = [{ label: 'Title', value: cName }]
    if (c.short_name && c.short_name !== cName) cRows.push({ label: 'Short name', value: c.short_name })
    if (c.short_summary) cRows.push({ label: 'Description', value: c.short_summary })
    if (c.cite_as) cRows.push({ label: 'Source URL', value: c.cite_as })
    pdfSections.push({ heading: 'Publication', rows: cRows })
  }

  if (enrichment.authors.length > 0)
    pdfSections.push({
      heading: 'Author / Creator',
      rows: [{ label: '', value: enrichment.authors.map((p) => personDisplayName(p)).join('; ') }],
    })

  const detailRows = DETAIL_FIELDS.filter((f) => !ENRICHED_KEYS.has(f.key))
    .map((field) => {
      const v = field.format === 'date'
        ? formatDate(record[field.key] as string | null)
        : formatValue(record[field.key])
      return v ? { label: field.label, value: v } : null
    })
    .filter((r): r is { label: string; value: string } => r !== null)
  if (detailRows.length > 0) pdfSections.push({ heading: 'Record Details', rows: detailRows })

  if (enrichment.mentionedPersons.length > 0)
    pdfSections.push({
      heading: 'People Mentioned',
      rows: enrichment.mentionedPersons.map(({ person, relationship_type }) => ({
        label: personDisplayName(person),
        value: [relationship_type, person.short_summary].filter(Boolean).join(' — '),
      })),
    })

  const citeRows: PdfSection['rows'] = []
  if (rec[CITE_AS_KEY]) citeRows.push({ label: 'Cite as', value: rec[CITE_AS_KEY] as string })
  if (rec[SOURCE_URL_KEY]) citeRows.push({ label: 'Source URL', value: rec[SOURCE_URL_KEY] as string })
  if (citeRows.length > 0) pdfSections.push({ heading: 'Citation', rows: citeRows })

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
            <li><Link href="/">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/search">Search Records</Link></li>
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
        {rec.short_summary && (
          <>
            <section aria-label="Summary">
              <SectionHeading>Summary</SectionHeading>
              <p className="text-base leading-relaxed text-ink font-serif">
                {rec.short_summary}
              </p>
            </section>
            <Divider />
          </>
        )}

        {/* ── Full verbatim title ──────────────────────────────────────────── */}
        {rec.title && rec.title !== title && (
          <>
            <section aria-label="Full title">
              <SectionHeading>Full Title</SectionHeading>
              <p className="text-sm leading-relaxed italic text-ink">
                {rec.title}
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
              <ContainerCard container={enrichment.container} />
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
                  <PersonChip key={p.id} person={p} />
                ))}
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── All other structured fields ──────────────────────────────────── */}
        <section aria-label="Record details">
          <SectionHeading>Full Record</SectionHeading>
          <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3">
            {DETAIL_FIELDS.filter((f) => !ENRICHED_KEYS.has(f.key)).map((field) => {
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
                    <PersonChip person={person} />
                    <span className="text-xs self-center text-muted">
                      {relationship_type}
                    </span>
                    {person.short_summary && (
                      <span className="text-xs self-center text-muted">
                        — {person.short_summary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {/* ── Cite-as / source URL ─────────────────────────────────────────── */}
        {(rec[CITE_AS_KEY] || rec[SOURCE_URL_KEY]) && (
          <>
            <Divider />
            <footer className="text-sm text-muted">
              {rec[CITE_AS_KEY] && (
                <p><span className="font-semibold">Cite as: </span>{rec[CITE_AS_KEY] as string}</p>
              )}
              {rec[SOURCE_URL_KEY] && (
                <p className="mt-1">
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
          </>
        )}
      </article>

      <div className="mt-5">
        <Link href="/search" className="text-sm">
          ← Back to search results
        </Link>
      </div>
    </div>
  )
}

// ── Container card ─────────────────────────────────────────────────────────

function ContainerCard({ container }: { container: ContainerSummary }) {
  const name = container.name_title ?? container.short_name ?? container.title ?? `Publication #${container.id}`
  return (
    <div className="rounded p-3 text-sm bg-tag-bg border border-border">
      <p className="font-semibold text-ink">
        {name}
        {container.short_name && container.short_name !== name && (
          <span className="font-normal ml-2 text-muted">
            ({container.short_name})
          </span>
        )}
      </p>
      {container.short_summary && (
        <p className="mt-1 text-muted">
          {container.short_summary}
        </p>
      )}
      {container.cite_as && (
        <p className="mt-1">
          <a
            href={container.cite_as}
            target="_blank"
            rel="noopener noreferrer"
          >
            View in source database ↗
          </a>
        </p>
      )}
    </div>
  )
}
