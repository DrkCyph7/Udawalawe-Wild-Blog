'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { BlogPost } from '@/lib/types'
import { BlogCard } from '@/components/BlogCard'

type Tab = 'public' | 'private' | 'pending'

export function ProfileTabs({ uid, initialPublicPosts }: { uid: string, initialPublicPosts: BlogPost[] }) {
  const [isOwner, setIsOwner] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('public')
  const [posts, setPosts] = useState<Record<Tab, BlogPost[]>>({
    public: initialPublicPosts,
    private: [],
    pending: []
  })
  const [loading, setLoading] = useState(false)
  const [fetchErrors, setFetchErrors] = useState<Record<Tab, boolean>>({
    public: false,
    private: false,
    pending: false
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.uid === uid) {
        setIsOwner(true)
        // Fetch private and pending posts once we know they are the owner
        fetchOwnerPosts('private', user.uid)
        fetchOwnerPosts('pending', user.uid)
      } else {
        setIsOwner(false)
      }
    })
    return () => unsub()
  }, [uid])

  const fetchOwnerPosts = async (tab: Tab, ownerUid: string) => {
    setLoading(true)
    setFetchErrors(prev => ({ ...prev, [tab]: false }))
    try {
      let q
      if (tab === 'private') {
        q = query(
          collection(db, 'posts'),
          where('authorId', '==', ownerUid),
          where('visibility', '==', 'private'),
          where('status', '==', 'approved')
        )
      } else if (tab === 'pending') {
        q = query(
          collection(db, 'posts'),
          where('authorId', '==', ownerUid),
          where('status', '==', 'pending')
        )
      }
      
      if (!q) return

      const snap = await getDocs(q)
      const fetched = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
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
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
        }
      }) as BlogPost[]
      
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      
      setPosts(prev => ({ ...prev, [tab]: fetched }))
    } catch (e) {
      console.error(`Error fetching ${tab} posts:`, e)
      setFetchErrors(prev => ({ ...prev, [tab]: true }))
    } finally {
      setLoading(false)
    }
  }

  const currentPosts = posts[activeTab]

  if (!isOwner) {
    // If not owner, just render the public posts normally
    return (
      <div className="profile-body">
        {initialPublicPosts.length === 0 ? (
          <div className="profile-empty">
            <p>No public stories yet.</p>
          </div>
        ) : (
          <div className="post-grid">
            {initialPublicPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="profile-body profile-tabs-container">
      <div className="flex gap-4 border-b border-[#d8d5ca] mb-8 pb-2 overflow-x-auto">
        {(['public', 'private', 'pending'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-sm uppercase tracking-widest px-2 py-1 transition-colors whitespace-nowrap ${
              activeTab === t 
                ? 'text-[#304936] font-bold border-b-2 border-[#304936] -mb-[9px]' 
                : 'text-[#768078] hover:text-[#526356]'
            }`}
          >
            {t} ({posts[t].length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#768078] font-serif">Loading…</div>
      ) : fetchErrors[activeTab] ? (
        <div className="py-16 text-center">
          <p className="text-red-600 font-serif mb-4">Failed to load {activeTab} stories.</p>
          <button onClick={() => fetchOwnerPosts(activeTab, uid)} className="border border-[#304936] text-[#304936] px-4 py-2 hover:bg-[#304936] hover:text-white transition-colors">Retry</button>
        </div>
      ) : currentPosts.length === 0 ? (
        <div className="profile-empty">
          <p>No {activeTab} stories found.</p>
        </div>
      ) : (
        <div className="post-grid">
          {currentPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
