import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getPageContentMap } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'About — Waterloo Cross-Dressing Archive',
  description:
    'About the Waterloo Cross-Dressing Archive, a project directed by Professor Fraser Easton at the University of Waterloo.',
}

export default async function AboutPage() {
  const content = await getPageContentMap()

  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            {content['site.eyebrow'] ?? ''}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            {content['about.title'] ?? ''}
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <article className="text-ink font-serif mb-10 [&>p]:text-base sm:[&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-muted [&>p]:mb-5 [&_a]:text-crimson [&_a]:underline hover:[&_a]:text-crimson-hover [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-ink [&_h2]:mt-10 [&_h2]:pt-10 [&_h2]:mb-5 [&_h2]:border-t [&_h2]:border-border [&_hr]:mt-10 [&_hr]:mb-5 [&_hr]:border-border">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content['about.body'] ?? ''}</ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
