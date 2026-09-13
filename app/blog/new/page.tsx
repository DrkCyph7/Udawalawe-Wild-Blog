'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Editor } from '@/components/Editor'
import { ImageUpload } from '@/components/ImageUpload'
import { StarRating } from '@/components/StarRating'
import { ChevronLeft, Send, Upload } from 'lucide-react'
import Link from 'next/link'

// MOCK USER for testing purposes
const MOCK_USER = {
  uid: 'test-user-123',
  displayName: 'Jane Doe'
}

type PostType = 'Blog Post' | 'Review'

export default function NewStory() {
  const router = useRouter()
  const [type, setType] = useState<PostType>('Blog Post')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [rating, setRating] = useState(0)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration is missing. Please set environment variables.')
    }

    const uploadPromises = files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(`Failed to upload image ${file.name}`)
      }

      const data = await res.json()
      return data.secure_url
    })

    return Promise.all(uploadPromises)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || (type === 'Review' && rating === 0)) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setProgress('Checking rate limits...')

    try {
      // 1. Check rate limit
      const userRef = doc(db, 'users', MOCK_USER.uid)
      const userSnap = await getDoc(userRef)
      
      const now = new Date()
      if (userSnap.exists()) {
        const userData = userSnap.data()
        if (userData.lastPostAt) {
          const lastPost = userData.lastPostAt.toDate()
          const hoursSinceLastPost = (now.getTime() - lastPost.getTime()) / (1000 * 60 * 60)
          
          if (hoursSinceLastPost < 24) {
            throw new Error(`You can only submit one post every 24 hours. Please wait ${Math.ceil(24 - hoursSinceLastPost)} more hours.`)
          }
        }
      }

      // 2. Upload images
      setProgress('Uploading images...')
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImagesToCloudinary(images)
      }

      // 3. Write post to Firestore
      setProgress('Saving post...')
      const postData = {
        authorId: MOCK_USER.uid,
        authorName: MOCK_USER.displayName,
        title,
        body: content,
        images: imageUrls,
        type,
        ...(type === 'Review' && { rating }),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      }

      await addDoc(collection(db, 'posts'), postData)

      // 4. Update user's lastPostAt
      setProgress('Finalizing...')
      await setDoc(userRef, { lastPostAt: now }, { merge: true })

      router.push('/blog/success')
      
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
      setProgress('')
    }
  }

  return (
    <main className="new-page">
      <div className="new-top">
        <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Cancel</Link>
        <span className="save-status">Draft saved just now</span>
      </div>
      
      <form onSubmit={handleSubmit} className="new-inner">
        <p className="eyebrow">Contribute to the journal</p>
        <h1>Tell us what<br/><i>you saw.</i></h1>
        
        <div className="toggle">
          <button type="button" className={type === 'Blog Post' ? 'selected' : ''} onClick={() => setType('Blog Post')}>Write a story</button>
          <button type="button" className={type === 'Review' ? 'selected' : ''} onClick={() => setType('Review')}>Leave a review</button>
        </div>

        <label>
          {type === 'Blog Post' ? 'Story title' : 'Which place are you reviewing?'}
          <input 
            placeholder={type === 'Blog Post' ? "Give your story a title" : "Search destinations or enter a title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        {type === 'Review' && (
          <label>Your rating
            <div className="star-select">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </label>
        )}

        <label className="flex flex-col gap-2">
          {type === 'Blog Post' ? 'What did you see?' : 'Your experience'}
          <Editor content={content} onChange={setContent} />
        </label>

        <label className="flex flex-col gap-2 mt-4">
          Add photographs (Max 5, up to 5MB each)
          <div className="mt-2">
            <ImageUpload images={images} onChange={setImages} />
          </div>
        </label>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 mt-4">
            {error}
          </div>
        )}

        <div className="submit-row mt-8">
          <span>Stories are reviewed before publishing.</span>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="dark-button !inline-flex justify-center items-center gap-2 border-0 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progress || 'Submitting...'}
              </>
            ) : (
              <>Submit for review <Send size={15}/></>
            )}
          </button>
        </div>
      </form>
    </main>
  )
}
