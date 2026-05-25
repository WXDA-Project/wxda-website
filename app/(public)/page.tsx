import type { Metadata } from 'next'
import HomeSearchBar from '@/components/HomeSearchBar'

export const metadata: Metadata = {
  title: 'Waterloo Cross-Dressing Archive',
}

export default function HomePage() {
  return (
    <div
      className="flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-28 min-h-[60vh]"
    >
      {/* Hero */}
      <div className="max-w-2xl w-full text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight font-serif text-ink">
          Waterloo Cross-Dressing Archive
        </h1>
        <p className="text-base sm:text-lg text-muted max-w-[36rem] mx-auto">
          A scholarly archive of historical documents relating to cross-dressing and gender
          non-conformity in the English-language press, 1785–1848.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl w-full">
        <HomeSearchBar />
      </div>

      {/* Quick-link */}
      <p className="mt-6 text-sm text-muted">
        Or{' '}
        <a href="/search">
          browse all records
        </a>{' '}
        using the full filter panel.
      </p>
    </div>
  )
}
