'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { BlogPost } from '@/lib/types'
import { PostDetailView } from './PostDetailView'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function PrivatePostViewer({ id }: { id: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
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
          const currentPost = {
            id: docSnap.id,
            authorId: data.authorId,
            authorName: data.authorName,
            isAnonymous: data.isAnonymous ?? false,
            visibility: data.visibility ?? 'public',
            title: data.title,
            body: data.body,
            images: data.images || [],
            tags: data.tags || [],
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
          } as BlogPost
          setPost(currentPost)

          // Fetch related stories
          const postsRef = collection(db, 'posts')
          const fetchedDocs: any[] = []
          const currentTags = currentPost.tags || []

          if (currentTags.length > 0) {
            const tagsToQuery = currentTags.slice(0, 10)
            const q = query(
              postsRef,
              where('status', '==', 'approved'),
              where('visibility', '==', 'public'),
              where('tags', 'array-contains-any', tagsToQuery),
              limit(20)
            )
            const querySnapshot = await getDocs(q)
            querySnapshot.forEach(d => {
              if (d.id !== currentPost.id) {
                fetchedDocs.push({ id: d.id, ...d.data() })
              }
            })
          }

          fetchedDocs.sort((a, b) => {
            const aTags = a.tags || []
            const bTags = b.tags || []
            const aCommon = aTags.filter((t: string) => currentTags.includes(t)).length
            const bCommon = bTags.filter((t: string) => currentTags.includes(t)).length
            if (aCommon !== bCommon) {
              return bCommon - aCommon
            }
            const aDate = a.createdAt?.toDate().getTime() || 0
            const bDate = b.createdAt?.toDate().getTime() || 0
            return bDate - aDate
          })

          let relPosts = fetchedDocs.slice(0, 3)

          if (relPosts.length < 3) {
            const qRecent = query(
              postsRef,
              where('status', '==', 'approved'),
              where('visibility', '==', 'public'),
              orderBy('createdAt', 'desc'),
              limit(10)
            )
            const recentSnapshot = await getDocs(qRecent)
            recentSnapshot.forEach(d => {
              if (relPosts.length >= 3) return
              if (d.id !== currentPost.id && !relPosts.some((p: any) => p.id === d.id)) {
                relPosts.push({ id: d.id, ...d.data() })
              }
            })
          }

          const finalRelated = relPosts.map((rData: any) => ({
            id: rData.id,
            authorId: rData.authorId,
            authorName: rData.authorName,
            authorPhotoURL: rData.authorPhotoURL || null,
            isAnonymous: rData.isAnonymous ?? false,
            visibility: rData.visibility ?? 'public',
            title: rData.title,
            body: rData.body,
            images: rData.images || [],
            tags: rData.tags || [],
            type: rData.type,
            rating: rData.rating,
            status: rData.status,
            likes: rData.likes ?? 0,
            likedBy: rData.likedBy ?? [],
            reportCount: rData.reportCount ?? 0,
            reportedBy: rData.reportedBy ?? [],
            pendingEdit: rData.pendingEdit ?? null,
            deletedAt: rData.deletedAt ?? null,
            deletedBy: rData.deletedBy ?? null,
            createdAt: rData.createdAt?.toDate().toISOString(),
            updatedAt: rData.updatedAt?.toDate().toISOString(),
          })) as BlogPost[]

          setRelatedPosts(finalRelated)

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

  return <PostDetailView post={post} relatedPosts={relatedPosts} />
}
