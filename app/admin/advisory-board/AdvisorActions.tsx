'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteAdvisor } from './actions'

export default function AdvisorActions({ id }: { id: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('Delete this advisory board member? This cannot be undone.')) return
    startTransition(async () => {
      await deleteAdvisor(id)
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
