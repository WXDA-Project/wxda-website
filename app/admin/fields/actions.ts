'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function invalidateFieldConfig() {
  updateTag('field-config')
  // revalidatePath ensures the page component caches are also cleared —
  // updateTag alone can miss them when the component cache is re-created
  // between two consecutive saves (a known tag-propagation edge case).
  revalidatePath('/', 'layout')
}

export type AdminTable =
  | 'document_field_config'
  | 'person_field_config'
  | 'container_field_config'
  | 'relationship_field_config'

async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return supabase
}

export async function saveField(
  table: AdminTable,
  id: number,
  data: Record<string, unknown>,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth()
    const { data: updated, error } = await supabase.from(table).update(data).eq('id', id).select('id')
    if (error) return { error: error.message }
    if (!updated || updated.length === 0) return { error: 'Update matched 0 rows — check auth and row ID' }
    invalidateFieldConfig()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function addField(
  table: AdminTable,
  data: Record<string, unknown>,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth()
    const { error } = await supabase.from(table).insert(data)
    if (error) return { error: error.message }
    invalidateFieldConfig()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function deleteField(
  table: AdminTable,
  id: number,
): Promise<{ error?: string }> {
  try {
    const supabase = await requireAuth()
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) return { error: error.message }
    invalidateFieldConfig()
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}
