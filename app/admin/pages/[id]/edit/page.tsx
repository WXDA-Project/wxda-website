import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import PageContentEditor from '../../PageContentEditor'

export const metadata: Metadata = { title: 'Edit Page Content — Admin' }

export default function EditPageContentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense>
      <EditPageContentContent params={params} />
    </Suspense>
  )
}

async function EditPageContentContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()
  const { data: block } = await supabase
    .from('page_content')
    .select('id, label, content')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (!block) notFound()
  return <PageContentEditor key={block.id} id={block.id} label={block.label} content={block.content} />
}
