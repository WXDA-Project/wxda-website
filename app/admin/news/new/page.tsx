import type { Metadata } from 'next'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import NewsForm from '../NewsForm'

export const metadata: Metadata = { title: 'New News Item — Admin' }

export default function NewNewsItemPage() {
  return (
    <Suspense>
      <NewNewsItemContent />
    </Suspense>
  )
}

async function NewNewsItemContent() {
  await requireUser()
  return <NewsForm />
}
