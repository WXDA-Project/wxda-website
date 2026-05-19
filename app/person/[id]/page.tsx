import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPerson, getPersonDocuments, personDisplayName, type PersonSummary } from '@/lib/queries'
import { PERSON_DETAIL_FIELDS } from '@/lib/person-field-config'

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
  const person = await getPerson(Number(id))
  if (!person) return { title: 'Person Not Found' }
  return { title: personDisplayName(person as unknown as PersonSummary) }
}

// ── Document list ──────────────────────────────────────────────────────────

function DocumentList({ docs }: { docs: Record<string, unknown>[] }) {
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
        const nameTitle = Array.isArray(doc.name_title) ? doc.name_title[0] : doc.name_title
        const displayTitle = (nameTitle as string) || (doc.title as string) || `Record #${doc.id}`
        const summary = doc.short_summary as string | null
        const dateStr = doc.date as string | null
        const categories = doc.provisional_category as string[] | null

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

  const [person, docs] = await Promise.all([getPerson(numId), getPersonDocuments(numId)])

  if (!person) notFound()

  const p = person as unknown as PersonSummary & Record<string, unknown>
  const name = personDisplayName(p)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted">
        <ol className="flex gap-2 list-none p-0 m-0 flex-wrap">
          <li><Link href="/">Home</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/search">Search Records</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{name}</li>
        </ol>
      </nav>

      <article aria-label={`Person: ${name}`}>
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="mb-6 p-5 sm:p-7 rounded bg-paper border border-border">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-muted">
            WXDA Person Record #{id}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2 font-serif text-ink">
            {name}
          </h1>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {p.person_type &&
              (p.person_type as string[]).map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full font-semibold bg-tag-bg text-tag-fg"
                >
                  {t}
                </span>
              ))}
            {p.presumptive_sex && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-tag-bg text-muted">
                {p.presumptive_sex as string}
              </span>
            )}
            {p.social_rank && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-tag-bg text-muted">
                {p.social_rank as string}
              </span>
            )}
          </div>

          {/* Short summary */}
          {p.short_summary && (
            <p className="mt-4 text-base leading-relaxed text-ink font-serif">
              {p.short_summary as string}
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
          <DocumentList docs={docs.mentioned} />
        </div>

        {/* ── Documents authored by this person ──────────────────────────── */}
        {docs.authored.length > 0 && (
          <div className="mb-6 p-5 sm:p-6 rounded bg-paper border border-border">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-muted">
              Author / Creator of {docs.authored.length} Record{docs.authored.length !== 1 ? 's' : ''}
            </h2>
            <DocumentList docs={docs.authored} />
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
