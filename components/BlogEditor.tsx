'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { createClient } from '@/lib/supabase/client'
import { savePost } from '@/app/admin/blog/actions'
import type { MDXEditorMethods } from '@mdxeditor/editor'

const MDXEditorClient = dynamic(() => import('./MDXEditorClient'), { ssr: false })

const BLOG_IMAGES_MARKER = '/storage/v1/object/public/blog-images/'

function extractContentImageUrls(content: string | null): string[] {
  if (!content) return []
  const urls: string[] = []
  for (const m of content.matchAll(/!\[.*?\]\((https?:\/\/[^)]+)\)/g)) urls.push(m[1])
  for (const m of content.matchAll(/src=["'](https?:\/\/[^"']+)["']/g)) urls.push(m[1])
  return urls.filter(u => u.includes(BLOG_IMAGES_MARKER))
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export type BlogEditorPost = {
  id: number
  slug: string
  title: string
  summary: string | null
  cover_image_url: string | null
  content: string | null
  published_at: string | null
}

export default function BlogEditor({ post }: { post?: BlogEditorPost }) {
  const router = useRouter()
  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [summary, setSummary] = useState(post?.summary ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showPreview, setShowPreview] = useState(false)
  const [previewContent, setPreviewContent] = useState(post?.content ?? '')
  const editorRef = useRef<MDXEditorMethods>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const committedCoverUrl = useRef(post?.cover_image_url ?? null)
  const pendingCoverUrl = useRef<string | null>(null)
  const committedContentImages = useRef<string[]>(extractContentImageUrls(post?.content ?? null))
  const sessionUploadedImages = useRef<string[]>([])

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [showPreview])

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!slugManuallyEdited) setSlug(slugify(value))
  }

  function deleteImageFromStorage(url: string) {
    const i = url.indexOf(BLOG_IMAGES_MARKER)
    if (i === -1) return
    createClient().storage.from('blog-images').remove([url.slice(i + BLOG_IMAGES_MARKER.length)])
  }

  async function handleCoverImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploadingCover(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await supabase.storage.from('blog-images').upload(path, file)
    setUploadingCover(false)
    if (uploadError) { setError(uploadError.message); return }
    if (pendingCoverUrl.current) deleteImageFromStorage(pendingCoverUrl.current)
    const newUrl = supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl
    pendingCoverUrl.current = newUrl
    setCoverImageUrl(newUrl)
  }

  function handleSubmit(publish: boolean) {
    if (!title.trim()) { setError('Title is required'); return }
    if (!slug.trim()) { setError('Slug is required'); return }
    setError(null)
    const publishedAt = publish ? (post?.published_at ?? new Date().toISOString()) : null
    const content = editorRef.current?.getMarkdown() ?? null
    startTransition(async () => {
      const result = await savePost({
        id: post?.id,
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim() || null,
        cover_image_url: coverImageUrl || null,
        content,
        published_at: publishedAt,
      })
      if (result.error) { setError(result.error); return }
      if (committedCoverUrl.current && committedCoverUrl.current !== (coverImageUrl || null)) {
        deleteImageFromStorage(committedCoverUrl.current)
      }
      if (pendingCoverUrl.current && pendingCoverUrl.current !== (coverImageUrl || null)) {
        deleteImageFromStorage(pendingCoverUrl.current)
      }
      committedCoverUrl.current = coverImageUrl || null
      const newContentImages = extractContentImageUrls(content)
      const allPriorImages = [...new Set([...committedContentImages.current, ...sessionUploadedImages.current])]
      allPriorImages
        .filter(url => !newContentImages.includes(url))
        .forEach(url => deleteImageFromStorage(url))

      router.push('/admin/blog')
      router.refresh()
    })
  }

  const isPublished = !!post?.published_at

  return (
    <div className="max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-serif text-ink">
          {post ? 'Edit Post' : 'New Post'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (!showPreview) setPreviewContent(editorRef.current?.getMarkdown() ?? post?.content ?? '')
              setShowPreview(v => !v)
            }}
            className="px-4 py-2 text-sm font-semibold border border-border rounded hover:bg-tag-bg transition-colors cursor-pointer"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold border border-border rounded hover:bg-tag-bg transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold bg-ink text-paper rounded hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isPublished ? 'Save & Keep Published' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded border border-crimson bg-crimson/5 text-sm text-crimson">
          {error}
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-6">
          <div className="w-full max-w-3xl">
            <div className="bg-paper border border-border rounded-lg px-6 py-10 max-h-[calc(100vh-3rem)] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="mb-8 text-sm text-muted hover:text-ink transition-colors cursor-pointer"
              >
                ← Close preview
              </button>

              {coverImageUrl && (
                <div className="relative w-full h-72 rounded mb-8 border border-border overflow-hidden">
                  <Image
                    src={coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              )}

              <header className="mb-10">
                <p className="text-xs tracking-widest uppercase text-muted font-sans">
                  {post?.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Draft'}
                </p>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink leading-tight mt-2">
                  {title || <span className="text-muted italic">No title</span>}
                </h1>
                <div className="mt-5 border-t-2 border-ink" />
              </header>

              <div className="blog-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {previewContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Title *</label>
          <input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper"
            placeholder="Post title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Slug <span className="font-normal text-muted text-xs">(URL: /blog/your-slug)</span>
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
            className="w-full px-3 py-2 border border-border rounded text-sm font-mono focus:outline-none focus:border-ink bg-paper"
            placeholder="auto-generated-from-title"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">
            Summary <span className="font-normal text-muted text-xs">(shown on blog list)</span>
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-border rounded text-sm focus:outline-none focus:border-ink bg-paper resize-y"
            placeholder="A short description of this post"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink mb-1">Cover image</label>
          <div className="flex items-center gap-3">
            {coverImageUrl && (
              <Image src={coverImageUrl} alt="" width={80} height={48} className="object-cover rounded border border-border" />
            )}
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploadingCover}
              className="px-3 py-1.5 text-sm border border-border rounded hover:bg-tag-bg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploadingCover ? 'Uploading…' : coverImageUrl ? 'Change' : 'Upload'}
            </button>
            {coverImageUrl && (
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="text-sm !text-crimson hover:underline cursor-pointer !no-underline"
              >
                Remove
              </button>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
        </div>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <MDXEditorClient
          initialMarkdown={post?.content ?? ''}
          onChange={() => {}}
          editorRef={editorRef}
          onImageUploaded={(url) => sessionUploadedImages.current.push(url)}
        />
      </div>

    </div>
  )
}
