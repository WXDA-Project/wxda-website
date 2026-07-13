'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { MDXEditorMethods } from '@mdxeditor/editor'
import { savePageContent } from './actions'

const MDXEditorClient = dynamic(() => import('@/components/MDXEditorClient'), { ssr: false })

export default function PageContentEditor({
  id,
  label,
  content,
}: {
  id: number
  label: string
  content: string
}) {
  const router = useRouter()
  const editorRef = useRef<MDXEditorMethods>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setSaved(false)
    setError(null)
    const markdown = editorRef.current?.getMarkdown() ?? ''
    startTransition(async () => {
      const result = await savePageContent(id, markdown)
      if (result.error) { setError(result.error); return }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-serif text-ink">{label}</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-muted">Saved</span>}
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold bg-ink text-paper rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-crimson bg-crimson/5 text-sm text-crimson">
          {error}
        </div>
      )}

      <div className="border border-border rounded overflow-hidden">
        <MDXEditorClient initialMarkdown={content} onChange={() => setSaved(false)} editorRef={editorRef} />
      </div>
    </div>
  )
}
