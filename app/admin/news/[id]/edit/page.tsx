import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import NewsForm from '../../NewsForm'

export const metadata: Metadata = { title: 'Edit News Item — Admin' }

export default function EditNewsItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense>
      <EditNewsItemContent params={params} />
    </Suspense>
  )
}

async function EditNewsItemContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()
  const { data: item } = await supabase
    .from('news_items')
    .select('id, item_date, text')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (!item) notFound()
  return <NewsForm key={item.id} item={item} />
}
