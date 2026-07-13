import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from '../supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export interface PageContentBlock {
  id: number
  key: string
  label: string
  content: string
}

// ── Queries ────────────────────────────────────────────────────────────────

const EMPTY_CONTENT: Record<string, string> = {}

/** Fetches all page content blocks, keyed by `key`. */
export async function getPageContentMap(): Promise<Record<string, string>> {
  'use cache: remote'
  cacheLife('days')
  cacheTag('page-content')

  const { data, error } = await supabase
    .from('page_content')
    .select('key, content')

  if (error) throw new Error(`Failed to load page content: ${error.message}`)
  if (!data) return EMPTY_CONTENT

  return Object.fromEntries(data.map((row) => [row.key, row.content as string]))
}

export async function getPageContent(key: string): Promise<string> {
  const map = await getPageContentMap()
  return map[key] ?? ''
}
