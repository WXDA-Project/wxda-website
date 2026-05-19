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
import { DETAIL_FIELDS, ENRICHED_KEYS } from '@/lib/field-config'

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
    (rec.author_or_creator as string[] | null) ?? [],
    (rec.container as string | null) ?? null,
    numId,
  )

  const title = rec.name_title || rec.title || `Record #${id}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex gap-2 list-none p-0 m-0 flex-wrap">
          <li><Link href="/">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/search">Search Records</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">Record #{id}</li>
        </ol>
      </nav>

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
          {rec.date && (
            <p className="mt-1 text-sm text-muted">
              {formatDate(rec.date as string)}
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
        {(rec.cite_as || rec.url) && (
          <>
            <Divider />
            <footer className="text-sm text-muted">
              {rec.cite_as && (
                <p><span className="font-semibold">Cite as: </span>{rec.cite_as}</p>
              )}
              {rec.url && (
                <p className="mt-1">
                  <span className="font-semibold">Source URL: </span>
                  <a
                    href={rec.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {rec.url}
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
