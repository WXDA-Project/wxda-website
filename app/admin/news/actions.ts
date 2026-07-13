'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function invalidateNews() {
  updateTag('news')
  revalidatePath('/', 'layout')
}

export type SaveNewsItemInput = {
  id?: number
  item_date: string
  text: string
}

export async function saveNewsItem(data: SaveNewsItemInput): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const payload = {
      item_date: data.item_date,
      text: data.text,
      updated_at: new Date().toISOString(),
    }

    if (data.id) {
      const { error } = await supabase.from('news_items').update(payload).eq('id', data.id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from('news_items').insert(payload)
      if (error) return { error: error.message }
    }

    invalidateNews()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function deleteNewsItem(id: number): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('news_items').delete().eq('id', id)
    if (error) return { error: error.message }

    invalidateNews()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}
