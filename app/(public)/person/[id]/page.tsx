import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPerson, getPersonDocuments, personDisplayName, documentDisplayTitle, type PersonSummary } from '@/lib/queries'
import { getPersonConfig, getDocumentConfig } from '@/lib/config/db-config'
import DownloadPdfButton, { type PdfDoc, type PdfSection } from '@/components/DownloadPdfButton'

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatArr(v: unknown): string | null {
  if (Array.isArray(v)) return v.length > 0 ? v.join('; ') : null
  if (typeof v === 'string') return v.trim() || null
  return null
}

// ── Metadata ───────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const [person, { PERSON_GIVEN_NAME_KEY, PERSON_SURNAME_KEY, PERSON_TITLE_KEY }] = await Promise.all([
    getPerson(Number(id)),
    getPersonConfig(),
  ])
  if (!person) return { title: 'Person Not Found' }
  return { title: personDisplayName(person as unknown as PersonSummary, { PERSON_GIVEN_NAME_KEY, PERSON_SURNAME_KEY, PERSON_TITLE_KEY }) }
}

// ── Document list ──────────────────────────────────────────────────────────

type DocKeys = { DOC_NAME_TITLE_KEY: string; DOC_TITLE_KEY: string; SORT_DATE_KEY: string; DOC_SUMMARY_KEY: string; DOC_CATEGORY_KEY: string }

function DocumentList({ docs, docKeys }: { docs: Record<string, unknown>[]; docKeys: DocKeys }) {
  if (docs.length === 0) {
    return (
      <p className="text-sm text-muted">
        No records found.
      </p>
    )
  }
  return (
    <ul className="space-y-3 list-none p-0 m-0">
      {docs.map((doc) => {
        const displayTitle = documentDisplayTitle(doc, docKeys)
        const summary = doc[docKeys.DOC_SUMMARY_KEY] as string | null
        const dateStr = doc[docKeys.SORT_DATE_KEY] as string | null
        const categories = doc[docKeys.DOC_CATEGORY_KEY] as string[] | null

        return (
          <li
            key={doc.id as number}
            className="border-l-[3px] border-border pl-3"
          >
            <Link
              href={`/record/${doc.id}`}
              className="text-sm font-semibold hover:underline"
            >
              {displayTitle}
            </Link>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {dateStr && (
                <span className="text-xs text-muted">
                  {formatDate(dateStr)}
                </span>
              )}
              {categories && categories.length > 0 && (
                <span className="text-xs text-muted">
                  {categories.join(', ')}
                </span>
              )}
            </div>
            {summary && (
              <p className="text-xs mt-1 leading-relaxed text-ink">
                {summary.length > 160 ? summary.slice(0, 160) + '…' : summary}
              </p>
            )}
          </li>
        )
      })}
    </ul>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)

  const [
    [person, docs],
    {
      PERSON_DETAIL_FIELDS, PERSON_BADGE_FIELDS, PERSON_SUMMARY_KEY,
      PERSON_GIVEN_NAME_KEY, PERSON_SURNAME_KEY, PERSON_TITLE_KEY,
    },
    { SORT_DATE_KEY, DOC_SUMMARY_KEY, DOC_CATEGORY_KEY, DOC_NAME_TITLE_KEY, DOC_TITLE_KEY },
  ] = await Promise.all([
    Promise.all([getPerson(numId), getPersonDocuments(numId)]),
    getPersonConfig(),
    getDocumentConfig(),
  ])

  if (!person) notFound()

  const p = person as PersonSummary
  const personKeys = { PERSON_GIVEN_NAME_KEY, PERSON_SURNAME_KEY, PERSON_TITLE_KEY }
  const docKeys: DocKeys = { DOC_NAME_TITLE_KEY, DOC_TITLE_KEY, SORT_DATE_KEY, DOC_SUMMARY_KEY, DOC_CATEGORY_KEY }
  const name = personDisplayName(p, personKeys)

  // ── Build PDF document ────────────────────────────────────────────────────
  const pdfSections: PdfSection[] = []

  if (p[PERSON_SUMMARY_KEY])
    pdfSections.push({ heading: 'Summary', rows: [{ label: '', value: p[PERSON_SUMMARY_KEY] as string }] })

  const personDetailRows = PERSON_DETAIL_FIELDS
    .map(({ key, label }) => {
      const val = formatArr(p[key])
      return val ? { label, value: val } : null
    })
    .filter((r): r is { label: string; value: string } => r !== null)
  if (personDetailRows.length > 0) pdfSections.push({ heading: 'Person Details', rows: personDetailRows })

  if (docs.mentioned.length > 0)
    pdfSections.push({
      heading: `Mentioned in ${docs.mentioned.length} Record${docs.mentioned.length !== 1 ? 's' : ''}`,
      rows: docs.mentioned.map((doc) => {
        const displayTitle = documentDisplayTitle(doc, docKeys)
        const dateStr = doc[SORT_DATE_KEY] as string | null
        return { label: dateStr ? formatDate(dateStr) : '', value: displayTitle }
      }),
    })

  if (docs.authored.length > 0)
    pdfSections.push({
      heading: `Author / Creator of ${docs.authored.length} Record${docs.authored.length !== 1 ? 's' : ''}`,
      rows: docs.authored.map((doc) => {
        const displayTitle = documentDisplayTitle(doc, docKeys)
        const dateStr = doc[SORT_DATE_KEY] as string | null
        return { label: dateStr ? formatDate(dateStr) : '', value: displayTitle }
      }),
    })

  const badges = PERSON_BADGE_FIELDS.flatMap((field) => {
    const val = p[field.key]
    if (!val) return []
    return field.isArray ? (val as string[]) : [val as string]
  })

  const pdfDoc: PdfDoc = {
    title: name,
    subtitle: `WXDA Person Record #${id}${badges.length > 0 ? ` · ${badges.join(', ')}` : ''}`,
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
            <li aria-current="page">{name}</li>
          </ol>
        </nav>
        <DownloadPdfButton pdf={pdfDoc} />
      </div>

      <article aria-label={`Person: ${name}`}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-6 p-5 sm:p-7 rounded bg-paper border border-border">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted">
            WXDA Person Record #{id}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2 font-serif text-ink">
            {name}
          </h1>

          {/* Badges — driven by PERSON_BADGE_FIELDS */}
          <div className="flex flex-wrap gap-2 mt-2">
            {PERSON_BADGE_FIELDS.flatMap((field, fi) => {
              const val = p[field.key]
              if (!val) return []
              const values = field.isArray ? (val as string[]) : [val as string]
              return values.map((v) => (
                <span
                  key={`${field.key}-${v}`}
                  className={`text-xs px-2.5 py-1 rounded-full bg-tag-bg ${
                    fi === 0 ? 'font-semibold text-tag-fg' : 'text-muted'
                  }`}
                >
                  {v}
                </span>
              ))
            })}
          </div>

          {/* Short summary */}
          {(p[PERSON_SUMMARY_KEY] as string | null) && (
            <p className="mt-4 text-base leading-relaxed text-ink font-serif">
              {p[PERSON_SUMMARY_KEY] as string}
            </p>
          )}
        </div>

        {/* ── Person detail fields ───────────────────────────────────────── */}
        <div className="mb-6 p-5 sm:p-6 rounded bg-paper border border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted">
            Person Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3">
            {PERSON_DETAIL_FIELDS.map(({ key, label }) => {
              const val = formatArr(p[key])
              if (!val) return null
              return (
                <div key={key} className="contents">
                  <dt className="text-sm font-semibold pt-0.5 text-muted">
                    {label}
                  </dt>
                  <dd className="text-sm text-ink m-0">
                    {val}
                  </dd>
                </div>
              )
            })}
          </dl>
        </div>

        {/* ── Documents where this person is mentioned ───────────────────── */}
        <div className="mb-6 p-5 sm:p-6 rounded bg-paper border border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted">
            Mentioned in {docs.mentioned.length > 0 ? `${docs.mentioned.length} Record${docs.mentioned.length !== 1 ? 's' : ''}` : 'Records'}
          </h2>
          <DocumentList docs={docs.mentioned} docKeys={docKeys} />
        </div>

        {/* ── Documents authored by this person ──────────────────────────── */}
        {docs.authored.length > 0 && (
          <div className="mb-6 p-5 sm:p-6 rounded bg-paper border border-border">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted">
              Author / Creator of {docs.authored.length} Record{docs.authored.length !== 1 ? 's' : ''}
            </h2>
            <DocumentList docs={docs.authored} docKeys={docKeys} />
          </div>
        )}
      </article>

      <div className="mt-4">
        <Link href="/search" className="text-sm">
          ← Back to search results
        </Link>
      </div>
    </div>
  )
}
