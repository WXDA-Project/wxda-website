import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import NavMenu from '@/components/NavMenu'
import { getPageContent } from '@/lib/queries'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const footer = await getPageContent('footer.body')

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-sm opacity-80 [&>p+p]:mt-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{footer}</ReactMarkdown>
        </div>
      </footer>
    </>
  )
}
