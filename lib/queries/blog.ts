import { cacheLife, cacheTag } from 'next/cache'
import { supabase } from '../supabase'

// ── Types ──────────────────────────────────────────────────────────────────

export interface BlogPostSummary {
  id: number
  slug: string
  title: string
  summary: string | null
  cover_image_url: string | null
  published_at: string
}

export interface BlogPost extends BlogPostSummary {
  content: string | null
}

// ── Queries ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export async function getBlogPosts(page = 1): Promise<{ posts: BlogPostSummary[]; total: number }> {
  'use cache: remote'
  cacheLife('days')
  cacheTag('blog')

  const from = (page - 1) * PAGE_SIZE
  const { data, count } = await supabase
    .from('blog_posts')
    .select('id, slug, title, summary, cover_image_url, published_at', { count: 'exact' })
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)

  return { posts: (data ?? []) as BlogPostSummary[], total: count ?? 0 }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  'use cache: remote'
  cacheLife('days')
  cacheTag('blog')
  cacheTag(`blog-${slug}`)

  const { data } = await supabase
    .from('blog_posts')
    .select('id, slug, title, summary, cover_image_url, published_at, content')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .maybeSingle()
  return data as BlogPost | null
}
