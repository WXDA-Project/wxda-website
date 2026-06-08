'use client'

import {
  MDXEditor,
  MDXEditorMethods,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  BlockTypeSelect,
  ListsToggle,
  CreateLink,
  InsertImage,
  InsertThematicBreak,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { createClient } from '@/lib/supabase/client'

type Props = {
  initialMarkdown: string
  onChange: (md: string) => void
  editorRef?: React.Ref<MDXEditorMethods>
  onImageUploaded?: (url: string) => void
}

export default function MDXEditorClient({ initialMarkdown, onChange, editorRef, onImageUploaded }: Props) {
  async function uploadImageToSupabase(file: File): Promise<string> {
    const supabase = createClient()
    const ext = file.name.split('.').pop() ?? 'bin'
    const path = `${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from('blog-images').upload(path, file)
    if (error) throw new Error(error.message)
    const url = supabase.storage.from('blog-images').getPublicUrl(path).data.publicUrl
    onImageUploaded?.(url)
    return url
  }

  return (
    <MDXEditor
      ref={editorRef}
      markdown={initialMarkdown}
      onChange={onChange}
      contentEditableClassName="blog-content min-h-[400px] px-4 py-3 focus:outline-none"
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({ imageUploadHandler: uploadImageToSupabase }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles />
              <StrikeThroughSupSubToggles options={['Strikethrough']} />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <InsertThematicBreak />
            </>
          ),
        }),
      ]}
    />
  )
}
