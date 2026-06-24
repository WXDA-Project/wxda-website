'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deletePost } from './actions'

export default function BlogPostActions({ id, slug }: { id: number; slug: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    startTransition(async () => {
      await deletePost(id, slug)
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
