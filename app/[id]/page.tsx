import { doc, getDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { PostDetailView } from '@/components/PostDetailView'
import { PrivatePostViewer } from '@/components/PrivatePostViewer'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      const rawText = data.body?.replace(/<[^>]*>?/gm, '') || ''
      const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText
      return {
        title: `${data.title} | Udawalawe Wild Blog`,
        description: excerpt,
        openGraph: {
          title: data.title,
          description: excerpt,
          images: data.images?.length > 0 ? [data.images[0]] : [],
        },
      }
    }
  } catch {}
  return { title: 'Story not found | Udawalawe Wild Blog' }
}

export const dynamic = 'force-dynamic'

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params
  let post: BlogPost | null = null
  let isPermissionDenied = false

  try {
    const docRef = doc(db, 'posts', id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()

      const isVisible =
        data.status === 'approved' && data.visibility === 'public' && data.status !== 'deleted'

      if (isVisible) {
        post = {
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorPhotoURL: data.authorPhotoURL || null,
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
        } as BlogPost
      }
    }
  } catch (error: any) {
    console.error('Error fetching post:', error)
    if (error?.code === 'permission-denied' || error?.message?.includes('Missing or insufficient permissions')) {
      isPermissionDenied = true
    }
  }

  // If we couldn't fetch because of a permission error, it might be a private post.
  // Delegate fetching and rendering to a Client Component with the user's auth context.
  if (isPermissionDenied) {
    return <PrivatePostViewer id={id} />
  }

  if (!post) notFound()

  let relatedPosts: BlogPost[] = []
  try {
    const postsRef = collection(db, 'posts')
    const fetchedDocs: any[] = []

    const currentTags = post.tags || []
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
      querySnapshot.forEach(doc => {
        if (doc.id !== post!.id) {
          fetchedDocs.push({ id: doc.id, ...doc.data() })
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

    relatedPosts = fetchedDocs.slice(0, 3)

    if (relatedPosts.length < 3) {
      const qRecent = query(
        postsRef,
        where('status', '==', 'approved'),
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const recentSnapshot = await getDocs(qRecent)
      recentSnapshot.forEach(doc => {
        if (relatedPosts.length >= 3) return
        if (doc.id !== post!.id && !relatedPosts.some(p => p.id === doc.id)) {
          relatedPosts.push({ id: doc.id, ...doc.data() })
        }
      })
    }

    relatedPosts = relatedPosts.map(data => ({
      id: data.id,
      authorId: data.authorId,
      authorName: data.authorName,
      authorPhotoURL: data.authorPhotoURL || null,
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
    } as BlogPost))
  } catch (error) {
    console.error('Error fetching related posts:', error)
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        image: post.images,
        datePublished: post.createdAt,
        dateModified: post.updatedAt || post.createdAt,
        author: [{ '@type': 'Person', name: post.isAnonymous ? 'Anonymous' : (post.authorName || 'Explorer') }],
        abstract: post.body.replace(/<[^>]*>?/gm, '').substring(0, 200),
      }) }} />
      <PostDetailView post={post} relatedPosts={relatedPosts} />
    </>
  )
}
