'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function invalidatePageContent() {
  updateTag('page-content')
  // page_content is read from many routes (footer.body on every page, plus
  // site.eyebrow/titles on Home, About, History, News, Advisory Board, Blog)
  // — revalidate the whole layout, same as field-config, rather than trying
  // to enumerate every consuming route.
  revalidatePath('/', 'layout')
}

export async function savePageContent(id: number, content: string): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('page_content')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    invalidatePageContent()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}
