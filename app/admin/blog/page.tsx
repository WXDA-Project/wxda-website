import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import BlogPostActions from './BlogPostActions'

export const metadata: Metadata = { title: 'Blog — Admin' }

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminBlogContent />
    </Suspense>
  )
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-6 w-32 bg-border rounded mb-6" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-border rounded" />
        ))}
      </div>
    </div>
  )
}

async function AdminBlogContent() {
  await requireUser()
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, title, published_at, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-serif text-ink">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="px-4 py-2 text-sm font-semibold bg-ink !text-paper rounded transition-colors hover:bg-ink/80 cursor-pointer !no-underline"
        >
          New Post
        </Link>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-sm text-muted">No posts yet. Create your first one!</p>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tag-bg border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Title</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink w-28">Status</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink w-32">Date</th>
                <th className="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-paper">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3 text-ink font-serif">{post.title}</td>
                  <td className="px-4 py-3">
                    {post.published_at ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-ink text-paper">
                        Published
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-tag-bg text-muted">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      {post.published_at && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs !text-muted hover:!text-ink !no-underline"
                        >
                          View
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="text-xs !text-crimson !no-underline hover:underline"
                      >
                        Edit
                      </Link>
                      <BlogPostActions id={post.id} slug={post.slug} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
