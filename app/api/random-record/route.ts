import { supabase } from '@/lib/supabase'
import { VISIBILITY_COLUMN } from '@/lib/config/db-config'

export async function GET() {
  const { count, error: countError } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq(VISIBILITY_COLUMN, 'public')

  if (countError || !count) {
    return Response.json({ error: 'No records found' }, { status: 404 })
  }

  const randomOffset = Math.floor(Math.random() * count)

  const { data, error } = await supabase
    .from('documents')
    .select('id')
    .eq(VISIBILITY_COLUMN, 'public')
    .order('id', { ascending: true })
    .range(randomOffset, randomOffset)

  if (error || !data || data.length === 0) {
    return Response.json({ error: 'Failed to fetch record' }, { status: 500 })
  }

  const id = (data[0] as { id: number }).id
  return Response.json({ type: 'document', id })
}
