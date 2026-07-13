import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from '../supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export interface Advisor {
  id: number
  name: string
  url: string | null
  bio: string
  sort_order: number
}

// ── Queries ────────────────────────────────────────────────────────────────

export async function getAdvisors(): Promise<Advisor[]> {
  'use cache: remote'
  cacheLife('days')
  cacheTag('advisory-board')

  const { data, error } = await supabase
    .from('advisory_board')
    .select('id, name, url, bio, sort_order')
    .order('sort_order')

  if (error) throw new Error(`Failed to load advisory board: ${error.message}`)

  return (data ?? []) as Advisor[]
}
