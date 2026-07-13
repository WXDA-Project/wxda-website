import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { getAdvisors, getPageContentMap } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Advisory Board — Waterloo Cross-Dressing Archive',
  description:
    'Meet the scholars who advise the Waterloo Cross-Dressing Archive project.',
}

export default async function AdvisoryBoardPage() {
  const [advisors, content] = await Promise.all([
    getAdvisors(),
    getPageContentMap(),
  ])

  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            {content['site.eyebrow'] ?? ''}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            {content['advisory-board.title'] ?? ''}
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
          <p className="mt-7 font-serif text-base sm:text-lg text-muted leading-relaxed">
            {content['advisory-board.intro'] ?? ''}
          </p>
        </header>

        <ul className="list-none m-0 p-0 border-t border-border divide-y divide-border">
          {advisors.map((advisor) => (
            <li key={advisor.id} className="py-8">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-ink leading-snug mb-3">
                {advisor.url ? (
                  <Link
                    href={advisor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline hover:text-crimson transition-colors"
                  >
                    {advisor.name}
                  </Link>
                ) : (
                  advisor.name
                )}
              </h2>
              <div className="font-serif text-base leading-relaxed text-muted [&>p]:m-0">
                <ReactMarkdown>{advisor.bio}</ReactMarkdown>
              </div>
            </li>
          ))}
        </ul>

      </div>
    </div>
  )
}
