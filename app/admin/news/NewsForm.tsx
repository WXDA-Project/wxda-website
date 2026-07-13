'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveNewsItem } from './actions'

export type NewsFormItem = {
  id: number
  item_date: string
  text: string
}

export default function NewsForm({ item }: { item?: NewsFormItem }) {
  const router = useRouter()
  const [itemDate, setItemDate] = useState(item?.item_date ?? new Date().toISOString().slice(0, 10))
  const [text, setText] = useState(item?.text ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    if (!itemDate) { setError('Date is required'); return }
    if (!text.trim()) { setError('Text is required'); return }
    setError(null)
    startTransition(async () => {
      const result = await saveNewsItem({ id: item?.id, item_date: itemDate, text: text.trim() })
      if (result.error) { setError(result.error); return }
      router.push('/admin/news')
      router.refresh()
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold font-serif text-ink mb-6">
        {item ? 'Edit News Item' : 'New News Item'}
      </h1>

      {error && (
        <div className="mb-4 p-3 rounded border border-crimson bg-crimson/5 text-sm text-crimson">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Date</label>
          <input
            type="date"
            value={itemDate}
            onChange={(e) => setItemDate(e.target.value)}
            className="px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper resize-y"
            placeholder="What's new?"
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
          onClick={() => router.push('/admin/news')}
          className="px-4 py-2 text-sm font-semibold border border-border rounded hover:bg-tag-bg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
