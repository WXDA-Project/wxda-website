import Link from 'next/link'
import NavMenu from '@/components/NavMenu'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      <header className="bg-header-bg text-header-fg relative z-10" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-base sm:text-xl font-bold tracking-wide hover:opacity-90 transition-opacity leading-tight font-serif"
          >
            <span className="hidden sm:inline">Waterloo Cross-Dressing Archive</span>
            <span className="sm:hidden">WXDA</span>
          </Link>

          <NavMenu />
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <footer className="bg-header-bg text-header-fg" role="contentinfo">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm opacity-80">
          <p>
            Waterloo Cross-Dressing Archive (WXDA) — University of Waterloo.
            Historical records relating to cross-dressing and gender non-conformity, 1785–1884
          </p>
          <p className="mt-2">
            &copy; 2026 University of Waterloo
          </p>
        </div>
      </footer>
    </>
  )
}
