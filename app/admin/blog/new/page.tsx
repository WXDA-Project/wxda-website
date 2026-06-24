import type { Metadata } from 'next'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import BlogEditor from '@/components/BlogEditor'

export const metadata: Metadata = { title: 'New Post — Admin' }

export default function NewPostPage() {
  return (
    <Suspense>
      <NewPostContent />
    </Suspense>
  )
}

async function NewPostContent() {
  await requireUser()
  return <BlogEditor key="new" />
}
