import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import NewsItemActions from './NewsItemActions'

export const metadata: Metadata = { title: 'News — Admin' }

export default function AdminNewsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminNewsContent />
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

async function AdminNewsContent() {
  await requireUser()
  const supabase = await createClient()
  const { data: items } = await supabase
    .from('news_items')
    .select('id, item_date, text')
    .order('item_date', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-serif text-ink">News Items</h1>
        <Link
          href="/admin/news/new"
          className="px-4 py-2 text-sm font-semibold bg-ink !text-paper rounded transition-colors hover:bg-ink/80 cursor-pointer !no-underline"
        >
          New Item
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <p className="text-sm text-muted">No news items yet. Create your first one!</p>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tag-bg border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-ink w-32">Date</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Text</th>
                <th className="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-paper">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {new Date(item.item_date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </td>
                  <td className="px-4 py-3 text-ink font-serif">{item.text}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/news/${item.id}/edit`}
                        className="text-xs !text-crimson !no-underline hover:underline"
                      >
                        Edit
                      </Link>
                      <NewsItemActions id={item.id} />
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
