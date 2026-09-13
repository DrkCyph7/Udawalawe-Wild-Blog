'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, Link as LinkIcon } from 'lucide-react'
import { useCallback } from 'react'

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 border rounded-b-md',
      },
    },
  })

  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 p-2 border border-[#e2dfd5] border-b-0 rounded-t-md bg-[#f9f8f4]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-[#e2dfd5] text-[#2a362d] ${editor.isActive('bold') ? 'bg-[#e2dfd5]' : ''}`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-[#e2dfd5] text-[#2a362d] ${editor.isActive('italic') ? 'bg-[#e2dfd5]' : ''}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-[#e2dfd5] text-[#2a362d] ${editor.isActive('bulletList') ? 'bg-[#e2dfd5]' : ''}`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-[#e2dfd5] text-[#2a362d] ${editor.isActive('link') ? 'bg-[#e2dfd5]' : ''}`}
        >
          <LinkIcon size={16} />
        </button>
      </div>
      <EditorContent editor={editor} className="editor-content bg-white text-[#4f5b51] border-[#e2dfd5]" />
    </div>
  )
}
