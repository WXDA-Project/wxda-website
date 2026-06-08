'use server'

import { updateTag, revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

function friendlyError(msg: string): string {
  if (msg.includes('blog_posts_slug_key')) return 'A post with that slug already exists — please choose a different slug.'
  return msg
}

function extractStoragePaths(content: string | null, coverUrl: string | null): string[] {
  const marker = '/storage/v1/object/public/blog-images/'
  const urls: string[] = []
  if (coverUrl) urls.push(coverUrl)
  if (content) {
    // markdown: ![alt](url)
    for (const m of content.matchAll(/!\[.*?\]\((https?:\/\/[^)]+)\)/g)) urls.push(m[1])
    // html img tags from MDXEditor
    for (const m of content.matchAll(/src=["'](https?:\/\/[^"']+)["']/g)) urls.push(m[1])
  }
  return urls
    .map((u) => { const i = u.indexOf(marker); return i !== -1 ? u.slice(i + marker.length) : null })
    .filter((p): p is string => p !== null)
}

function invalidateBlog(slug?: string) {
  updateTag('blog')
  if (slug) updateTag(`blog-${slug}`)
  revalidatePath('/blog', 'layout')
}

export type SavePostInput = {
  id?: number
  title: string
  slug: string
  summary: string | null
  cover_image_url: string | null
  content: string | null
  published_at: string | null
}

export async function savePost(data: SavePostInput): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const payload = {
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      cover_image_url: data.cover_image_url,
      content: data.content,
      published_at: data.published_at,
      updated_at: new Date().toISOString(),
    }

    if (data.id) {
      const { error } = await supabase.from('blog_posts').update(payload).eq('id', data.id)
      if (error) return { error: friendlyError(error.message) }
    } else {
      const { error } = await supabase.from('blog_posts').insert(payload)
      if (error) return { error: friendlyError(error.message) }
    }

    invalidateBlog(data.slug)
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}

export async function deletePost(id: number, slug: string): Promise<{ error?: string }> {
  await requireUser()
  const supabase = await createClient()

  try {
    const { data: post } = await supabase
      .from('blog_posts')
      .select('cover_image_url, content')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('blog_posts').delete().eq('id', id)
    if (error) return { error: error.message }

    if (post) {
      const paths = extractStoragePaths(post.content, post.cover_image_url)
      if (paths.length > 0) {
        await supabase.storage.from('blog-images').remove(paths)
      }
    }

    invalidateBlog(slug)
    return {}
  } catch (e) {
    return { error: (e as Error).message }
  }
}
