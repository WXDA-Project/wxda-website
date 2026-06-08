import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { getBlogPosts } from '@/lib/queries/blog'
import Pagination from '@/components/Pagination'

export const metadata: Metadata = {
  title: 'Blog — Waterloo Cross-Dressing Archive',
}

export default function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  return (
    <Suspense>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  )
}

async function BlogContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const { posts, total } = await getBlogPosts(page)
  const totalPages = Math.ceil(total / 10)

  return (
    <div className="bg-parchment min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        <header className="mb-10">
          <p className="text-xs tracking-widest uppercase text-muted font-sans mb-3">
            Waterloo Cross-Dressing Archive
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight">
            Blog
          </h1>
          <div className="mt-5 border-t-2 border-ink" />
        </header>

        {posts.length === 0 ? (
          <p className="font-serif text-muted text-base">No posts yet.</p>
        ) : (
          <>
            <ol className="list-none m-0 p-0 space-y-8">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block !no-underline">
                    <article className="border border-border rounded bg-paper overflow-hidden hover:border-ink transition-colors">
                      {post.cover_image_url && (
                        <div className="relative w-full h-48">
                          <Image
                            src={post.cover_image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 768px"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <time className="text-xs tracking-wide uppercase text-muted font-sans">
                          {new Date(post.published_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </time>
                        <h2 className="font-serif text-xl font-bold text-ink mt-1 mb-2">
                          {post.title}
                        </h2>
                        {post.summary && (
                          <p className="font-serif text-muted text-sm leading-relaxed line-clamp-3">
                            {post.summary}
                          </p>
                        )}
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ol>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/blog" />
          </>
        )}

      </div>
    </div>
  )
}
