import type { Metadata } from 'next'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import HomeSearchBar from '@/components/HomeSearchBar'
import RandomEntryButton from '@/components/RandomEntryButton'
import { getNewsItems, getPageContent } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Waterloo Cross-Dressing Archive',
}

export default async function HomePage() {
  const [news, welcome, tagline, title] = await Promise.all([
    getNewsItems(5),
    getPageContent('home.welcome'),
    getPageContent('home.tagline'),
    getPageContent('home.title'),
  ])

  return (
    <div className="bg-parchment min-h-full">

      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight font-serif text-ink">
            {title}
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-[38rem]">
            {tagline}
          </p>
          <div className="w-full max-w-xl">
            <HomeSearchBar />
          </div>
          <p className="text-sm text-muted -mt-2">
            <Link href="/search">Browse the archive</Link>
            {' '} or {' '}
            <RandomEntryButton />.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">

          <div className="lg:flex-1 min-w-0">
            <h2 className="font-serif text-xl font-bold text-ink mb-5 pb-2 border-b-2 border-ink">
              Welcome
            </h2>
            <div className="font-serif text-base leading-relaxed text-muted space-y-5 [&_strong]:text-ink">
              <ReactMarkdown>{welcome}</ReactMarkdown>
            </div>
          </div>

          <aside className="lg:w-72 shrink-0">
            <h2 className="font-serif text-xl font-bold text-ink mb-5 pb-2 border-b-2 border-ink">
              What&#8217;s new on the WXDA?
            </h2>
            <ol className="list-none m-0 p-0 space-y-0 divide-y divide-border">
              {news.map(({ id, item_date, text }) => (
                <li key={id} className="py-3 text-sm">
                  <time
                    dateTime={item_date}
                    className="block font-semibold text-ink font-sans text-xs tracking-wide mb-0.5"
                  >
                    {new Date(item_date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
                    })}
                  </time>
                  <span className="font-serif text-muted leading-snug">{text}</span>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <Link href="/about/news" className="text-sm no-underline">
                See all news →
              </Link>
            </div>
          </aside>

        </div>
      </div>

    </div>
  )
}
