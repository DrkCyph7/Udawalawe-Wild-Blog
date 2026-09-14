'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, getDoc, onSnapshot, doc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { callAdminModeratePost, callAdminDeletePost } from '@/lib/functions'
import { Trash2, Check, X, Bell, FileEdit } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

type Tab = 'pending' | 'approved' | 'reported'

export default function BlogQueue() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('pending')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({})
  const [pendingCount, setPendingCount] = useState(0)
  const [reportedCount, setReportedCount] = useState(0)

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) { setIsAdmin(false); setLoading(false); return }
      // Check NEXT_PUBLIC_ADMIN_UID or admins collection (Free Plan compatible)
      try {
        const isEnvAdmin = user.uid === process.env.NEXT_PUBLIC_ADMIN_UID
        const adminSnap = await getDoc(doc(db, 'admins', user.uid))
        if (isEnvAdmin || adminSnap.exists()) {
          setIsAdmin(true)
          // Subscribe to meta/stats for badge counts
          const unsubStats = onSnapshot(doc(db, 'meta', 'stats'), (snap) => {
            if (snap.exists()) {
              setPendingCount(snap.data().pendingCount ?? 0)
              setReportedCount(snap.data().reportedCount ?? 0)
            }
          })
          return () => unsubStats()
        } else {
          setIsAdmin(false)
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
        setIsAdmin(false)
        setLoading(false)
      }
    })
    return () => unsubAuth()
  }, [])

  useEffect(() => {
    if (isAdmin) fetchPosts(tab)
  }, [isAdmin, tab])

  const fetchPosts = async (activeTab: Tab) => {
    setLoading(true)
    setFetchError(false)
    try {
      let q
      if (activeTab === 'pending') {
        q = query(collection(db, 'posts'), where('status', '==', 'pending'))
      } else if (activeTab === 'approved') {
        q = query(collection(db, 'posts'), where('status', '==', 'approved'))
      } else {
        // reported: approved posts with reportCount >= 1
        q = query(
          collection(db, 'posts'),
          where('status', '==', 'approved'),
          where('reportCount', '>=', 1)
        )
      }
      const snap = await getDocs(q)
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() })) as BlogPost[]
      fetched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setPosts(fetched)
    } catch (e) {
      console.error(e)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  const doAction = async (postId: string, action: Parameters<typeof callAdminModeratePost>[1], reason?: string) => {
    setActionLoading(postId + action)
    try {
      await callAdminModeratePost(postId, action, reason)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const doDelete = async (postId: string) => {
    if (!confirm('Soft-delete this post? It will be hidden from all public views but retained for audit.')) return
    setActionLoading(postId + 'delete')
    try {
      await callAdminDeletePost(postId)
      setPosts(prev => prev.filter(p => p.id !== postId))
    } catch (e) { console.error(e) }
    finally { setActionLoading(null) }
  }

  if (isAdmin === null || (isAdmin && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f8f4]">
        <div className="w-8 h-8 border-2 border-[#304936] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4">
        <h1 className="text-6xl font-serif text-[#324b37] mb-6">Access Denied</h1>
        <p className="text-lg text-[#526356] max-w-lg text-center">
          You do not have permission to view this page.
        </p>
      </div>
    )
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'pending', label: 'Pending', count: pendingCount || undefined },
    { id: 'approved', label: 'Approved' },
    { id: 'reported', label: 'Reported', count: reportedCount || undefined },
  ]

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow"><span className="eyebrow-line"/> Moderation</p>
          <h1>Admin <i>Queue</i></h1>
        </div>
        <div className="admin-tab-bar">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`admin-tab ${tab === t.id ? 'active' : ''}`}
            >
              {t.label}
              {t.count ? <span className="admin-tab-badge">{t.count}</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="queue">
        <div className="queue-title">
          <h2>{tab.charAt(0).toUpperCase() + tab.slice(1)} posts</h2>
          <span>{posts.length} items</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#768078] font-serif">Loading…</div>
        ) : fetchError ? (
          <div className="py-16 text-center">
            <p className="text-red-600 font-serif mb-4">Failed to load posts.</p>
            <button onClick={() => fetchPosts(tab)} className="border border-[#304936] text-[#304936] px-4 py-2 hover:bg-[#304936] hover:text-white transition-colors">Retry</button>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-[#768078] font-serif">Nothing here.</div>
        ) : (
          posts.map(post => {
            const hasPendingEdit = !!post.pendingEdit
            const displayName = post.isAnonymous ? `Anonymous (real: ${post.authorName})` : post.authorName
            const dateStr = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : '—'

            return (
              <div key={post.id} className={`queue-row flex-col items-start gap-4 ${hasPendingEdit ? 'has-edit' : ''}`}>
                <div className="w-full flex items-start justify-between gap-4">
                  <div className="queue-copy flex-1">
                    <strong>{post.title}</strong>
                    <span>
                      {displayName} · {post.type}
                      {post.type === 'Review' && post.rating ? ` · ★ ${post.rating}` : ''}
                      {' · '}{dateStr}
                      {post.isAnonymous ? ' · 🕵 Anonymous' : ''}
                      {post.visibility === 'private' ? ' · 🔒 Private' : ''}
                    </span>
                    {post.reportCount > 0 && (
                      <span className="report-badge">⚑ {post.reportCount} report{post.reportCount !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <span className="queue-type">{post.status}</span>
                </div>

                {post.images && post.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {post.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="h-28 w-auto object-cover border border-[#e2dfd5]" />
                    ))}
                  </div>
                )}

                <div className="admin-preview">
                  <div dangerouslySetInnerHTML={{ __html: post.body }} className="line-clamp-4 text-sm text-[#526356] font-serif" />
                </div>

                {/* Pending Edit indicator */}
                {hasPendingEdit && (
                  <div className="pending-edit-box">
                    <div className="pending-edit-header">
                      <FileEdit size={14}/> Pending edit submitted
                    </div>
                    <div className="pending-edit-diff">
                      <p><strong>New title:</strong> {post.pendingEdit!.title}</p>
                      <div dangerouslySetInnerHTML={{ __html: post.pendingEdit!.body }} className="line-clamp-3 text-sm mt-1" />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => doAction(post.id, 'approve_edit')}
                        disabled={actionLoading === post.id + 'approve_edit'}
                        className="queue-row button bg-[#304936] text-white px-4 py-2 text-xs"
                      >
                        <Check size={13}/> Approve edit
                      </button>
                      <button
                        onClick={() => doAction(post.id, 'reject_edit')}
                        disabled={actionLoading === post.id + 'reject_edit'}
                        className="queue-row button border border-[#d8d5ca] px-4 py-2 text-xs"
                      >
                        <X size={13}/> Reject edit
                      </button>
                    </div>
                  </div>
                )}

                {/* Main actions */}
                <div className="w-full flex flex-wrap gap-3 pt-3 border-t border-[#e2dfd5]">
                  {tab === 'pending' && (
                    <>
                      <button
                        onClick={() => doAction(post.id, 'approve')}
                        disabled={!!actionLoading}
                        className="bg-[#304936] text-white px-5 py-2 text-xs uppercase tracking-wider"
                      >
                        <Check size={13}/> Approve
                      </button>
                      <div className="flex gap-2 flex-1">
                        <button
                          onClick={() => doAction(post.id, 'reject', rejectionReason[post.id])}
                          disabled={!!actionLoading}
                          className="border border-red-300 text-red-700 bg-red-50 px-5 py-2 text-xs uppercase tracking-wider"
                        >
                          <X size={13}/> Reject
                        </button>
                        <input
                          type="text"
                          placeholder="Rejection reason (optional)…"
                          className="border border-[#e2dfd5] bg-white p-2 flex-1 text-xs outline-none"
                          value={rejectionReason[post.id] || ''}
                          onChange={e => setRejectionReason(prev => ({ ...prev, [post.id]: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                  {tab === 'reported' && (
                    <button
                      onClick={() => doAction(post.id, 'dismiss_report')}
                      disabled={!!actionLoading}
                      className="border border-[#d8d5ca] text-[#526356] px-5 py-2 text-xs uppercase tracking-wider"
                    >
                      <Bell size={13}/> Dismiss report
                    </button>
                  )}
                  <button
                    onClick={() => doDelete(post.id)}
                    disabled={!!actionLoading}
                    className="border border-red-200 text-red-700 px-4 py-2 text-xs uppercase tracking-wider ml-auto"
                  >
                    <Trash2 size={13}/> Delete
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
