'use client'

import { useSearchParams, useRouter } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

export default function Pagination({ currentPage, totalPages, basePath = '/search' }: PaginationProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  if (totalPages <= 1) return null

  function goTo(page: number) {
    const p = new URLSearchParams(searchParams.toString())
    if (page === 1) p.delete('page')
    else p.set('page', String(page))
    const str = p.toString()
    router.push(`${basePath}${str ? `?${str}` : ''}`, { scroll: true })
  }

  // Page number window for the desktop strip
  const pages: (number | '…')[] = []
  const delta = 2
  const left = currentPage - delta
  const right = currentPage + delta

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      pages.push(i)
    } else if (i === left - 1 || i === right + 1) {
      pages.push('…')
    }
  }

  const sharedBtnClass = 'rounded border transition-colors'
  const enabledBtnClass = 'border-border bg-paper text-ink cursor-pointer'
  const disabledBtnClass = 'border-border bg-paper text-ink opacity-40 cursor-not-allowed'

  return (
    <nav aria-label="Pagination" className="mt-8">
      {/* ── Mobile: Prev / "Page X of Y" / Next ─────────────────────────── */}
      <div className="flex sm:hidden items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`px-4 py-2 text-sm ${sharedBtnClass} ${currentPage === 1 ? disabledBtnClass : enabledBtnClass}`}
        >
          ← Prev
        </button>

        <span className="text-sm text-muted">
          Page <strong className="text-ink">{currentPage}</strong> of{' '}
          <strong className="text-ink">{totalPages}</strong>
        </span>

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`px-4 py-2 text-sm ${sharedBtnClass} ${currentPage === totalPages ? disabledBtnClass : enabledBtnClass}`}
        >
          Next →
        </button>
      </div>

      {/* ── Desktop: full page-number strip ─────────────────────────────── */}
      <ul className="hidden sm:flex items-center justify-center gap-1 list-none p-0 m-0">
        <li>
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`px-3 py-1.5 text-sm ${sharedBtnClass} ${currentPage === 1 ? disabledBtnClass : enabledBtnClass}`}
          >
            ← Prev
          </button>
        </li>

        {pages.map((p, idx) =>
          p === '…' ? (
            <li key={`ellipsis-${idx}`} aria-hidden="true">
              <span className="px-2 py-1.5 text-sm text-muted">…</span>
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                onClick={() => goTo(p)}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? 'page' : undefined}
                className={`px-3 py-1.5 text-sm rounded border transition-colors cursor-pointer ${
                  p === currentPage
                    ? 'border-crimson bg-crimson text-on-accent font-bold'
                    : 'border-border bg-paper text-ink font-normal'
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`px-3 py-1.5 text-sm ${sharedBtnClass} ${currentPage === totalPages ? disabledBtnClass : enabledBtnClass}`}
          >
            Next →
          </button>
        </li>
      </ul>
    </nav>
  )
}
