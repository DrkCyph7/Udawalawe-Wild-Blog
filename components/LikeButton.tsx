'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { callToggleLike } from '@/lib/functions'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  postId: string
  initialLikes: number
  initialLikedBy: string[]
}

export function LikeButton({ postId, initialLikes, initialLikedBy }: LikeButtonProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const uid = auth?.currentUser?.uid
    setLiked(uid ? initialLikedBy.includes(uid) : false)
  }, [initialLikedBy])

  const handleLike = async () => {
    if (!auth?.currentUser) {
      router.push('/login')
      return
    }
    if (loading) return

    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    setLikes(prev => prev + (newLiked ? 1 : -1))
    setLoading(true)

    try {
      const result = await callToggleLike(postId)
      const data = result.data as { liked: boolean }
      // Sync with server truth
      setLiked(data.liked)
    } catch (err) {
      // Revert on error
      setLiked(!newLiked)
      setLikes(prev => prev + (newLiked ? -1 : 1))
      console.error('Like error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`like-button ${liked ? 'liked' : ''}`}
      aria-label={liked ? 'Unlike this post' : 'Like this post'}
    >
      <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
      <span>{likes}</span>
    </button>
  )
}
