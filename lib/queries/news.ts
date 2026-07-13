import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from '../supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export interface NewsItem {
  id: number
  item_date: string
  text: string
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getNewsItems(limit?: number): Promise<NewsItem[]> {
  'use cache: remote'
  cacheLife('days')
  cacheTag('news')

  let query = supabase
    .from('news_items')
    .select('id, item_date, text')
    .order('item_date', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw new Error(`Failed to load news items: ${error.message}`)

  return (data ?? []) as NewsItem[]
}
