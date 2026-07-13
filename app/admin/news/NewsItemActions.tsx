'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteNewsItem } from './actions'

export default function NewsItemActions({ id }: { id: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('Delete this news item? This cannot be undone.')) return
    startTransition(async () => {
      await deleteNewsItem(id)
      router.refresh()
    })
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs text-muted hover:text-crimson transition-colors disabled:opacity-40"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
