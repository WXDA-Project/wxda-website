import type { Metadata } from 'next'
import { Suspense } from 'react'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AdvisorForm from '../AdvisorForm'

export const metadata: Metadata = { title: 'New Advisor — Admin' }

export default function NewAdvisorPage() {
  return (
    <Suspense>
      <NewAdvisorContent />
    </Suspense>
  )
}

async function NewAdvisorContent() {
  await requireUser()
  const supabase = await createClient()
  const { count } = await supabase
    .from('advisory_board')
    .select('id', { count: 'exact', head: true })

  return <AdvisorForm defaultSortOrder={count ?? 0} />
}
