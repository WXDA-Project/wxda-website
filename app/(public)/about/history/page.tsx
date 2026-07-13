import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPageContentMap } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'History — Waterloo Cross-Dressing Archive',
  description:
    'An overview of the Waterloo Cross-Dressing Archive project, its aims, scope, and development methodology.',
}

export default async function HistoryPage() {
  const content = await getPageContentMap()

  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            {content['site.eyebrow'] ?? ''}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            {content['history.title'] ?? ''}
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <article className="text-ink font-serif [&>p]:text-base sm:[&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-muted [&>p]:mb-5 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:pt-10 [&_h2]:mb-5 [&_h2]:border-t [&_h2]:border-border [&_ol]:mb-5 [&_ol]:space-y-3 [&_ol]:list-decimal [&_ol]:list-outside [&_ol]:pl-6 [&_ol]:text-muted [&_ul]:mb-5 [&_ul]:space-y-3 [&_ul]:list-disc [&_ul]:list-outside [&_ul]:pl-6 [&_ul]:text-muted [&_li]:text-base sm:[&_li]:text-lg [&_li]:leading-relaxed">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content['history.body'] ?? ''}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
