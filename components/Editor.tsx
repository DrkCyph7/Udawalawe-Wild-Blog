'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, List, Link as LinkIcon, Heading2, Heading3, Quote, ListOrdered, Strikethrough } from 'lucide-react'
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
    immediatelyRender: false,
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

  const ToolbarButton = ({ onClick, active, icon: Icon, title }: any) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-[#e2dfd5] text-[#2a362d] transition-colors ${active ? 'bg-[#e2dfd5]' : ''}`}
    >
      <Icon size={16} />
    </button>
  )

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-1 p-2 border border-[#e2dfd5] border-b-0 rounded-t-md bg-[#f9f8f4]">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} icon={Bold} title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} icon={Italic} title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} icon={Strikethrough} title="Strikethrough" />
        <div className="w-px h-5 bg-[#d6d2c4] mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} icon={Heading2} title="Heading 2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} icon={Heading3} title="Heading 3" />
        <div className="w-px h-5 bg-[#d6d2c4] mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} icon={List} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} icon={ListOrdered} title="Ordered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} icon={Quote} title="Quote" />
        <div className="w-px h-5 bg-[#d6d2c4] mx-1" />
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} icon={LinkIcon} title="Link" />
      </div>
      <EditorContent editor={editor} className="editor-content bg-white text-[#4f5b51] border-[#e2dfd5]" />
    </div>
  )
}
