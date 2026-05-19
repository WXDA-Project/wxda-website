import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Waterloo Cross-Dressing Archive',
    template: '%s | WXDA',
  },
  description:
    'A scholarly archive of historical documents relating to cross-dressing and gender non-conformity, 1785–1848.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex flex-col min-h-screen">
        {/* Skip navigation for keyboard / screen-reader users */}
        <a href="#main-content" className="skip-nav">
          Skip to main content
        </a>

        {/* ── Site header ─────────────────────────────────────────────────── */}
        <header className="bg-header-bg text-header-fg" role="banner">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-base sm:text-xl font-bold tracking-wide hover:opacity-90 transition-opacity leading-tight font-serif"
            >
              <span className="hidden sm:inline">Waterloo Cross-Dressing Archive</span>
              <span className="sm:hidden">WXDA</span>
            </Link>

            <nav aria-label="Main navigation">
              <ul className="flex gap-4 sm:gap-6 list-none m-0 p-0 text-sm">
                <li>
                  <Link href="/" className="hover:opacity-75 transition-opacity">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="hover:opacity-75 transition-opacity whitespace-nowrap">
                    Search Records
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* ── Site footer ─────────────────────────────────────────────────── */}
        <footer className="border-t border-border bg-paper" role="contentinfo">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm text-muted">
            <p>
              Waterloo Cross-Dressing Archive (WXDA) — University of Waterloo.
              Historical records relating to cross-dressing and gender non-conformity, 1785–1848.
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
