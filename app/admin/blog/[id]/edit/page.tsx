import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import BlogEditor from '@/components/BlogEditor'

export const metadata: Metadata = { title: 'Edit Post — Admin' }

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense>
      <EditPostContent params={params} />
    </Suspense>
  )
}

async function EditPostContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('id, slug, title, summary, cover_image_url, content, published_at')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (!post) notFound()
  return <BlogEditor key={post.id} post={post} />
}
