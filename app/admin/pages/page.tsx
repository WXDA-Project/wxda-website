import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Page Content — Admin' }

export default function AdminPagesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminPagesContent />
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

async function AdminPagesContent() {
  await requireUser()
  const supabase = await createClient()
  const { data: blocks } = await supabase
    .from('page_content')
    .select('id, key, label, updated_at')
    .order('key')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-bold font-serif text-ink mb-2">Page Content</h1>
      <p className="text-sm text-muted mb-6">
        Editable text blocks used on the Home, About, and History pages.
      </p>

      {!blocks || blocks.length === 0 ? (
        <p className="text-sm text-muted">No content blocks found.</p>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tag-bg border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Block</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink w-40">Last updated</th>
                <th className="px-4 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-paper">
              {blocks.map((block) => (
                <tr key={block.id}>
                  <td className="px-4 py-3 text-ink font-serif">{block.label}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(block.updated_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pages/${block.id}/edit`}
                      className="text-xs !text-crimson !no-underline hover:underline"
                    >
                      Edit
                    </Link>
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
