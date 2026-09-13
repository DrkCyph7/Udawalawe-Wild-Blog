'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import type { Post } from '@/lib/types/blog'

export default function BlogQueue() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})

  useEffect(() => {
    const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID
    
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // For strictly enforcing the admin UID:
      if (user && user.uid === adminUid) {
        setIsAdmin(true)
        fetchPendingPosts()
      } else {
        // Access Denied
        setIsAdmin(false)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const fetchPendingPosts = async () => {
    try {
      // Fetching all pending posts. Sorting on the client to avoid needing a Firestore composite index.
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'pending')
      )
      const snapshot = await getDocs(q)
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[]
      
      // Sort newest first
      fetchedPosts.sort((a, b) => {
        const dateA = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate().getTime() : new Date(a.createdAt).getTime();
        const dateB = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate().getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setPosts(fetchedPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'posts', id), {
        status: 'approved',
        updatedAt: serverTimestamp()
      })
      setPosts(posts.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error approving post:', error)
    }
  }

  const handleReject = async (id: string) => {
    const reason = rejectionReason[id] || ''
    try {
      await updateDoc(doc(db, 'posts', id), {
        status: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      })
      setPosts(posts.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error rejecting post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f4]">
        <div className="w-8 h-8 border-2 border-[#2a362d] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#f9f8f4] p-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-serif text-red-700 mb-4">Access Denied</h1>
        <p className="text-gray-600 max-w-md">
          You do not have permission to view this page. Please log in with the admin account that matches the <code className="bg-gray-200 px-1 py-0.5 rounded">NEXT_PUBLIC_ADMIN_UID</code> environment variable.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f4] py-12">
      <div className="max-w-4xl mx-auto p-6 lg:p-0">
        <div className="flex items-center justify-between mb-8 border-b border-[#e2dfd5] pb-6">
          <h1 className="text-4xl font-serif text-[#2a362d]">Moderation Queue</h1>
          <div className="bg-[#2a362d] text-[#f9f8f4] px-4 py-1.5 rounded-full text-sm font-medium tracking-wide">
            {posts.length} Pending
          </div>
        </div>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#e2dfd5]">
              <p className="text-[#657067] font-serif text-lg">No pending posts to review.</p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="border border-[#e2dfd5] bg-white p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-serif text-[#2a362d] mb-2">{post.title}</h2>
                    <div className="text-xs uppercase tracking-widest text-[#69736c] flex flex-wrap gap-x-4 gap-y-2">
                      <span>By {post.authorName}</span>
                      <span>&bull;</span>
                      <span>{post.type}</span>
                      {post.type === 'Review' && (
                        <>
                          <span>&bull;</span>
                          <span className="text-[#c1a063]">Rating: {post.rating} / 5</span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span>
                        {(post.createdAt as any)?.toDate 
                          ? (post.createdAt as any).toDate().toLocaleDateString() 
                          : new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {post.images && post.images.length > 0 && (
                  <div className="flex gap-4 mb-6 overflow-x-auto pb-2 custom-scrollbar">
                    {post.images.map((img, i) => (
                      <img key={i} src={img} alt={`Image ${i+1} for ${post.title}`} className="h-40 w-auto object-cover border border-[#e2dfd5]" />
                    ))}
                  </div>
                )}

                <div className="bg-[#f9f8f4] p-5 border border-[#e2dfd5] mb-6">
                  <h3 className="text-xs uppercase tracking-widest text-[#69736c] mb-3">Content Preview</h3>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700 font-serif leading-relaxed line-clamp-6"
                    dangerouslySetInnerHTML={{ __html: post.body }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#e2dfd5] items-start sm:items-center">
                  <button 
                    onClick={() => handleApprove(post.id)}
                    className="bg-[#2a362d] hover:bg-[#1f2821] text-white px-6 py-2.5 text-sm uppercase tracking-wider transition-colors w-full sm:w-auto"
                  >
                    Approve Post
                  </button>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-1">
                    <button 
                      onClick={() => handleReject(post.id)}
                      className="border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 px-6 py-2.5 text-sm uppercase tracking-wider transition-colors w-full sm:w-auto"
                    >
                      Reject
                    </button>
                    <input
                      type="text"
                      placeholder="Optional rejection reason..."
                      className="border border-[#e2dfd5] bg-white p-2.5 w-full sm:flex-1 text-sm outline-none focus:border-[#2a362d]"
                      value={rejectionReason[post.id] || ''}
                      onChange={(e) => setRejectionReason({ ...rejectionReason, [post.id]: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
