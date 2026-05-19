'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type SearchTab = 'records' | 'persons'

export default function HomeSearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [searchTab, setSearchTab] = useState<SearchTab>('records')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTab === 'persons') params.set('tab', 'persons')
    if (q.trim()) params.set('q', q.trim())
    router.push(`/search${params.size ? `?${params}` : ''}`)
  }

  const tabClass = (active: boolean) =>
    [
      'py-1.5 px-4 text-[0.8125rem] border border-border rounded-t -mb-px relative cursor-pointer transition-colors',
      active
        ? 'font-bold border-b-paper bg-paper text-ink z-[1]'
        : 'font-normal border-b-border bg-transparent text-muted z-0',
    ].join(' ')

  return (
    <form
      role="search"
      aria-label="Search the archive"
      onSubmit={handleSubmit}
      className="flex flex-col gap-0"
    >
      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border">
        <button type="button" onClick={() => setSearchTab('records')} className={tabClass(searchTab === 'records')}>
          Records
        </button>
        <button type="button" onClick={() => setSearchTab('persons')} className={tabClass(searchTab === 'persons')}>
          Persons
        </button>
      </div>

      {/* Search input */}
      <div className="flex gap-2 p-3 border border-t-0 border-border rounded rounded-tl-none bg-paper">
        <label htmlFor="home-search" className="sr-only">
          {searchTab === 'records' ? 'Search records' : 'Search persons'}
        </label>
        <input
          id="home-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            searchTab === 'records'
              ? 'Search records \u2014 e.g. \u201cfemale husband\u201d or \u201cLondon 1800\u201d'
              : 'Search persons \u2014 e.g. \u201cMary Hamilton\u201d or \u201csailor\u201d'
          }
          className="flex-1 px-4 py-3 text-base rounded border border-border bg-paper text-ink"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 sm:px-5 py-3 text-sm font-semibold rounded text-white transition-colors shrink-0 bg-crimson hover:bg-crimson-hover cursor-pointer"
          aria-label="Search"
        >
          <span className="hidden sm:inline">Search</span>
          <span className="sm:hidden" aria-hidden="true">→</span>
        </button>
      </div>

      <p className="text-xs text-center mt-2 text-muted">
        Use <code className="font-mono">&quot;quoted phrases&quot;</code>,{' '}
        <code className="font-mono">OR</code>, and{' '}
        <code className="font-mono">-exclusions</code>
      </p>
    </form>
  )
}
