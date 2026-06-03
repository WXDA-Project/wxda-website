import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginForm />}>
      <AuthRedirect />
    </Suspense>
  )
}

async function AuthRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/admin/fields')
  return <LoginForm />
}
