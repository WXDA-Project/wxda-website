'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function invalidateAdvisoryBoard() {
  updateTag('advisory-board')
  revalidatePath('/', 'layout')
}

export type SaveAdvisorInput = {
  id?: number
  name: string
  url: string | null
  bio: string
  sort_order: number
}

export async function saveAdvisor(data: SaveAdvisorInput): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const payload = {
      name: data.name,
      url: data.url,
      bio: data.bio,
      sort_order: data.sort_order,
      updated_at: new Date().toISOString(),
    }

    if (data.id) {
      const { error } = await supabase.from('advisory_board').update(payload).eq('id', data.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('advisory_board').insert(payload)
      if (error) return { error: error.message }
    }

    invalidateAdvisoryBoard()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function deleteAdvisor(id: number): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('advisory_board').delete().eq('id', id)
    if (error) return { error: error.message }

    invalidateAdvisoryBoard()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}
