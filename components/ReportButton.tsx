'use client'

import { useState } from 'react'
import { Flag } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { callReportPost } from '@/lib/functions'
import { useRouter } from 'next/navigation'

interface ReportButtonProps {
  postId: string
  authorId: string
  initialReportedBy: string[]
}

export function ReportButton({ postId, authorId, initialReportedBy }: ReportButtonProps) {
  const router = useRouter()
  const [reported, setReported] = useState(
    () => !!auth?.currentUser && initialReportedBy.includes(auth.currentUser.uid)
  )
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const currentUser = auth?.currentUser
  // Hide for post's own author
  if (currentUser?.uid === authorId) return null

  const handleReport = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    if (reported || loading) return
    setShowConfirm(true)
  }

  const confirmReport = async () => {
    setShowConfirm(false)
    setLoading(true)
    try {
      await callReportPost(postId, 'User report')
      setReported(true)
    } catch (err: any) {
      if (err?.code === 'functions/already-exists') {
        setReported(true)
      } else {
        console.error('Report error:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  if (reported) {
    return (
      <span className="report-button reported" aria-label="Post reported">
        <Flag size={14} /> Reported
      </span>
    )
  }

  return (
    <>
      <button
        onClick={handleReport}
        disabled={loading}
        className="report-button"
        aria-label="Report this post"
      >
        <Flag size={14} />
        {loading ? 'Reporting…' : 'Report'}
      </button>

      {showConfirm && (
        <div className="report-overlay" role="dialog" aria-modal="true">
          <div className="report-dialog">
            <h3>Report this post?</h3>
            <p>This will flag the post for admin review. Thank you for helping keep the community safe.</p>
            <div className="report-actions">
              <button onClick={confirmReport} className="dark-button">Yes, report it</button>
              <button onClick={() => setShowConfirm(false)} className="outline-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
