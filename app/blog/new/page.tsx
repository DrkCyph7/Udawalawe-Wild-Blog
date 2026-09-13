'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { callSubmitPost } from '@/lib/functions'
import { Editor } from '@/components/Editor'
import { ImageUpload } from '@/components/ImageUpload'
import { StarRating } from '@/components/StarRating'
import { ChevronLeft, Send, Lock, Globe, EyeOff } from 'lucide-react'
import Link from 'next/link'

type PostType = 'Blog Post' | 'Review'

export default function NewStory() {
  const router = useRouter()
  const [type, setType] = useState<PostType>('Blog Post')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [rating, setRating] = useState(0)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  const uploadImagesToCloudinary = async (files: File[]): Promise<string[]> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary configuration is missing.')

    return Promise.all(files.map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Failed to upload image ${file.name}`)
      return (await res.json()).secure_url as string
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const currentUser = auth?.currentUser
    if (!currentUser) {
      setError('You must be signed in to submit a story.')
      return
    }
    if (!title.trim() || !content.trim() || (type === 'Review' && rating === 0)) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Upload images first
      setProgress('Uploading images…')
      let imageUrls: string[] = []
      if (images.length > 0) {
        imageUrls = await uploadImagesToCloudinary(images)
      }

      // Submit via Cloud Function (handles rate limit atomically server-side)
      setProgress('Submitting…')
      await callSubmitPost({
        title: title.trim(),
        body: content,
        images: imageUrls,
        type,
        ...(type === 'Review' && { rating }),
        isAnonymous,
        visibility,
      })

      router.push('/blog/success')
    } catch (err: any) {
      console.error(err)
      // Firebase callable errors have a `message` from the function
      const msg = err?.message || err?.details || 'An error occurred during submission.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
      setProgress('')
    }
  }

  return (
    <main className="new-page">
      <div className="new-top">
        <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Cancel</Link>
        <span className="save-status">Stories are reviewed before publishing.</span>
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
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
            placeholder={type === 'Blog Post' ? 'Give your story a title' : 'Search destinations or enter a title'}
            required
            className="w-full text-xl p-4 border border-[#e2dfd5] rounded-md focus:outline-none bg-[#f9f8f4] text-[#2a362d]"
          />
        </label>

        {type === 'Review' && (
          <label>Your rating
            <div className="star-select"><StarRating value={rating} onChange={setRating} /></div>
          </label>
        )}

        <label className="flex flex-col gap-2">
          {type === 'Blog Post' ? 'What did you see?' : 'Your experience'}
          <Editor content={content} onChange={setContent} />
        </label>

        <div className="mt-4">
          <ImageUpload images={images} onChange={setImages} />
        </div>

        {/* Privacy & Visibility controls */}
        <div className="mt-7 border border-[#d8d5ca] p-5 flex flex-col gap-4 bg-[#fbfaf6]">
          <div>
            <p className="text-[#667957] text-[10px] uppercase tracking-[0.12em] flex items-center gap-1.5 margin-0 mb-2.5 font-bold">
              <Globe size={13}/> Visibility
            </p>
            <div className="inline-flex border border-[#d8d5ca]">
              <button
                type="button"
                className={`flex items-center gap-1.5 border-0 px-3.5 py-2 text-[11px] transition-colors ${
                  visibility === 'public' ? 'bg-[#304936] text-white' : 'bg-transparent text-[#768078] hover:bg-[#e9e5d9]'
                }`}
                onClick={() => setVisibility('public')}
              >
                <Globe size={12}/> Public
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 border-0 px-3.5 py-2 text-[11px] transition-colors ${
                  visibility === 'private' ? 'bg-[#304936] text-white' : 'bg-transparent text-[#768078] hover:bg-[#e9e5d9]'
                }`}
                onClick={() => setVisibility('private')}
              >
                <Lock size={12}/> Private
              </button>
            </div>
            <p className="text-[#768078] text-[10px] mt-2 font-serif leading-relaxed">
              {visibility === 'private'
                ? 'Only you can see this post.'
                : 'Visible to everyone after approval.'}
            </p>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-[#304936] tracking-[0.04em] m-0 cursor-pointer font-bold">
            <input
              type="checkbox"
              className="w-auto m-0"
              checked={isAnonymous}
              onChange={e => setIsAnonymous(e.target.checked)}
            />
            <EyeOff size={13}/>
            Post anonymously
            <span className="text-[#768078] text-[10px] ml-1 font-serif font-normal">
              (your name won&apos;t show publicly)
            </span>
          </label>
        </div>

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
                {progress || 'Submitting…'}
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
