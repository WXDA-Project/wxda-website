'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ROUTE_MAP: Record<string, string> = {
  document: '/record',
  person: '/person',
}

export default function RandomEntryButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/random-record')
      if (!res.ok) return
      const { type, id } = await res.json()
      const base = ROUTE_MAP[type]
      if (base && id) router.push(`${base}/${id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="bg-transparent border-0 p-0 text-crimson underline underline-offset-[2px] cursor-pointer hover:text-crimson-hover disabled:opacity-50 disabled:cursor-wait"
    >
      {loading ? 'Loading…' : 'random entry'}
    </button>
  )
}
