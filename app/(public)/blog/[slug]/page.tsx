import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { getBlogPost } from '@/lib/queries/blog'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return {}
  return {
    title: `${post.title} — WXDA Blog`,
    description: post.summary ?? undefined,
  }
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense>
      <BlogPostContent params={params} />
    </Suspense>
  )
}

async function BlogPostContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <nav className="mb-8 text-sm">
          <Link href="/blog" className="text-crimson hover:underline">
            ← Blog
          </Link>
        </nav>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt=""
            className="w-full max-h-72 object-cover rounded mb-8 border border-border"
          />
        )}

        <header className="mb-10">
          <time className="text-xs tracking-widest uppercase text-muted font-sans">
            {new Date(post.published_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight mt-2">
            {post.title}
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        <div className="blog-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {post.content ?? ''}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  )
}
