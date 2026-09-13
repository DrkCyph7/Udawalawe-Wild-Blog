'use client'

import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import Link from 'next/link'
import { FileEdit } from 'lucide-react'

export function PostEditButton({ authorId, postId }: { authorId: string, postId: string }) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === authorId) {
        setIsOwner(true)
      } else {
        setIsOwner(false)
      }
    })
    return () => unsub()
  }, [authorId])

  if (!isOwner) return null

  return (
    <Link 
      href={`/blog/${postId}/edit`} 
      className="inline-flex items-center gap-1.5 ml-4 text-xs font-semibold text-[#304936] hover:underline"
    >
      <FileEdit size={13}/>
      Edit Post
    </Link>
  )
}
