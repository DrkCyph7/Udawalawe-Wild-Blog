'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { BlogPost } from '@/lib/types'
import { PostDetailView } from './PostDetailView'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function PrivatePostViewer({ id }: { id: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        const docRef = doc(db, 'posts', id)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          const data = docSnap.data()
          setPost({
            id: docSnap.id,
            authorId: data.authorId,
            authorName: data.authorName,
            isAnonymous: data.isAnonymous ?? false,
            visibility: data.visibility ?? 'public',
            title: data.title,
            body: data.body,
            images: data.images || [],
            type: data.type,
            rating: data.rating,
            status: data.status,
            likes: data.likes ?? 0,
            likedBy: data.likedBy ?? [],
            reportCount: data.reportCount ?? 0,
            reportedBy: data.reportedBy ?? [],
            pendingEdit: data.pendingEdit ?? null,
            deletedAt: data.deletedAt ?? null,
            deletedBy: data.deletedBy ?? null,
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString(),
          } as BlogPost)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error("Failed to load private post:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [id])

  if (loading) {
    return (
      <main className="post-detail min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#304936] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="post-detail min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-serif text-[#324b37] mb-4">Story Not Found</h1>
        <p className="text-[#526356] mb-8 max-w-md">
          This story may have been deleted, or it is private and you do not have permission to view it.
        </p>
        <Link href="/" className="pill-button !inline-flex items-center gap-2">
          <ChevronLeft size={16}/> Back to stories
        </Link>
      </main>
    )
  }

  return <PostDetailView post={post} />
}
