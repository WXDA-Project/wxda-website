import type { Metadata } from 'next'
import { NEWS } from './news'

export const metadata: Metadata = {
  title: 'News — Waterloo Cross-Dressing Archive',
  description: 'Latest news and updates from the Waterloo Cross-Dressing Archive.',
}

export default function NewsPage() {
  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            Waterloo Cross-Dressing Archive &middot; University of Waterloo
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            News
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <ol className="list-none m-0 p-0 relative">
          {/* vertical rule */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

          {NEWS.map(({ date, text }) => (
            <li key={date} className="relative pl-8 pb-8 last:pb-0">
              {/* dot */}
              <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-crimson bg-parchment" aria-hidden="true" />
              <time
                dateTime={date}
                className="block font-sans text-xs font-semibold uppercase tracking-widest text-crimson mb-1"
              >
                {date}
              </time>
              <p className="font-serif text-base text-muted leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>

      </div>
    </div>
  )
}
