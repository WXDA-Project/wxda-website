import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdvisorActions from './AdvisorActions'

export const metadata: Metadata = { title: 'Advisory Board — Admin' }

export default function AdminAdvisoryBoardPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminAdvisoryBoardContent />
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

async function AdminAdvisoryBoardContent() {
  await requireUser()
  const supabase = await createClient()
  const { data: advisors } = await supabase
    .from('advisory_board')
    .select('id, name, url, sort_order')
    .order('sort_order')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-serif text-ink">Advisory Board</h1>
        <Link
          href="/admin/advisory-board/new"
          className="px-4 py-2 text-sm font-semibold bg-ink !text-paper rounded transition-colors hover:bg-ink/80 cursor-pointer !no-underline"
        >
          New Advisor
        </Link>
      </div>

      {!advisors || advisors.length === 0 ? (
        <p className="text-sm text-muted">No advisors yet. Add your first one!</p>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tag-bg border-b border-border">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-ink w-16">Order</th>
                <th className="text-left px-4 py-2.5 font-semibold text-ink">Name</th>
                <th className="px-4 py-2.5 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-paper">
              {advisors.map((advisor) => (
                <tr key={advisor.id}>
                  <td className="px-4 py-3 text-muted">{advisor.sort_order}</td>
                  <td className="px-4 py-3 text-ink font-serif">{advisor.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/advisory-board/${advisor.id}/edit`}
                        className="text-xs !text-crimson !no-underline hover:underline"
                      >
                        Edit
                      </Link>
                      <AdvisorActions id={advisor.id} />
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
