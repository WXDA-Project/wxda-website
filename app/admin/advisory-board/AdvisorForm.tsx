'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { MDXEditorMethods } from '@mdxeditor/editor'
import { saveAdvisor } from './actions'

const MDXEditorClient = dynamic(() => import('@/components/MDXEditorClient'), { ssr: false })

export type AdvisorFormItem = {
  id: number
  name: string
  url: string | null
  bio: string
  sort_order: number
}

export default function AdvisorForm({
  item,
  defaultSortOrder = 0,
}: {
  item?: AdvisorFormItem
  defaultSortOrder?: number
}) {
  const router = useRouter()
  const [name, setName] = useState(item?.name ?? '')
  const [url, setUrl] = useState(item?.url ?? '')
  const [sortOrder, setSortOrder] = useState(item?.sort_order ?? defaultSortOrder)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const editorRef = useRef<MDXEditorMethods>(null)

  function handleSubmit() {
    const bio = editorRef.current?.getMarkdown().trim() ?? ''
    if (!name.trim()) { setError('Name is required'); return }
    if (!bio) { setError('Bio is required'); return }
    setError(null)
    startTransition(async () => {
      const result = await saveAdvisor({
        id: item?.id,
        name: name.trim(),
        url: url.trim() || null,
        bio,
        sort_order: sortOrder,
      })
      if (result.error) { setError(result.error); return }
      router.push('/admin/advisory-board')
      router.refresh()
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold font-serif text-ink mb-6">
        {item ? 'Edit Advisor' : 'New Advisor'}
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded border border-crimson bg-crimson/5 text-sm text-crimson">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Profile URL <span className="font-normal text-muted text-xs">(optional)</span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm font-mono focus:outline-none focus:border-ink bg-paper"
            placeholder="https://…"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Bio</label>
          <div className="border border-border rounded overflow-hidden">
            <MDXEditorClient initialMarkdown={item?.bio ?? ''} onChange={() => {}} editorRef={editorRef} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Sort order <span className="font-normal text-muted text-xs">(lower shows first)</span>
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            className="w-24 px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 text-sm font-semibold bg-ink text-paper rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/advisory-board')}
          className="px-4 py-2 text-sm font-semibold border border-border rounded hover:bg-tag-bg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
