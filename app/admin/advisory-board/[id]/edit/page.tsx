import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdvisorForm from '../../AdvisorForm'

export const metadata: Metadata = { title: 'Edit Advisor — Admin' }

export default function EditAdvisorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <Suspense>
      <EditAdvisorContent params={params} />
    </Suspense>
  )
}

async function EditAdvisorContent({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()
  const { data: advisor } = await supabase
    .from('advisory_board')
    .select('id, name, url, bio, sort_order')
    .eq('id', parseInt(id))
    .maybeSingle()

  if (!advisor) notFound()
  return <AdvisorForm key={advisor.id} item={advisor} />
}
