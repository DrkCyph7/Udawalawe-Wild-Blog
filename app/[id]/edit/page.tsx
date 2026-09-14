'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Editor } from '@/components/Editor'
import { ImageUpload } from '@/components/ImageUpload'
import { StarRating } from '@/components/StarRating'
import { ChevronLeft, Send, Lock, Globe, EyeOff, FileEdit } from 'lucide-react'
import Link from 'next/link'
import { BlogPost } from '@/lib/types'

type PostType = 'Blog Post' | 'Review'

export default function EditStory() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState<PostType>('Blog Post')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([]) 
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [rating, setRating] = useState(0)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setError('You must be signed in to edit.')
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'posts', id))
        if (!snap.exists()) {
          setError('Post not found.')
        } else {
          const data = snap.data()
          if (data.authorId !== user.uid) {
            setError('You do not have permission to edit this post.')
          } else {
            setPost(data as BlogPost)
            setType(data.type || 'Blog Post')
            setTitle(data.title || '')
            setContent(data.body || '')
            setExistingImages(data.images || [])
            setRating(data.rating || 0)
            setIsAnonymous(data.isAnonymous ?? false)
            setVisibility(data.visibility || 'public')
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load post.')
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [id])

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

    if (!post) return
    const currentUser = auth?.currentUser
    if (!currentUser) {
      setError('You must be signed in to edit.')
      return
    }
    if (!title.trim() || !content.trim() || (type === 'Review' && rating === 0)) {
      setError('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      let finalImages = [...existingImages]
      if (images.length > 0) {
        setProgress('Uploading new images…')
        const newImageUrls = await uploadImagesToCloudinary(images)
        finalImages = newImageUrls
      }

      setProgress('Saving edit…')
      
      const docRef = doc(db, 'posts', id)
      
      const editData = {
        title: title.trim(),
        body: content,
        images: finalImages,
        type,
        ...(type === 'Review' && { rating }),
      }

      // Direct edit is only allowed if it is still pending
      if (post.status === 'pending') {
        await updateDoc(docRef, {
          ...editData,
          visibility, 
          updatedAt: serverTimestamp()
        })
      } else {
        // Post is approved. Requires a pendingEdit.
        await updateDoc(docRef, {
          pendingEdit: editData,
          visibility, 
          updatedAt: serverTimestamp()
        })
      }

      router.refresh()
      router.push(`/${id}`)
    } catch (err: any) {
      console.error(err)
      setError(err?.message || 'An error occurred during submission.')
    } finally {
      setIsSubmitting(false)
      setProgress('')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf6]">
        <div className="w-8 h-8 border-2 border-[#304936] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-serif text-[#324b37] mb-6">Error</h1>
        <p className="text-lg text-[#526356] max-w-lg text-center mb-6">{error}</p>
        <Link href="/" className="border border-[#304936] text-[#304936] px-6 py-3 hover:bg-[#304936] hover:text-white transition-colors">
          Go back to journal
        </Link>
      </div>
    )
  }

  return (
    <main className="new-page">
      <div className="new-top">
        <Link href={`/${id}`} className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Cancel</Link>
        <span className="save-status">
          {post?.status === 'approved' && post?.visibility === 'public' 
            ? 'Edits to public posts will be reviewed.' 
            : 'Saved immediately.'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="new-inner">
        <p className="eyebrow flex items-center gap-1.5"><FileEdit size={14}/> Edit story</p>
        <h1>Update what<br/><i>you saw.</i></h1>

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
          <label>Replace or remove existing images</label>
          {existingImages.length > 0 && images.length === 0 && (
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex gap-2">
                {existingImages.map((img, i) => (
                  <img key={i} src={img} alt="existing" className="h-16 w-16 object-cover border border-[#d8d5ca]" />
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setExistingImages([])}
                className="text-xs text-red-600 self-start hover:underline"
              >
                Remove existing images
              </button>
            </div>
          )}
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
          </div>
          {post?.status === 'approved' && visibility === 'public' && (
            <p className="text-[11px] text-[#526356] font-serif border-t border-[#d8d5ca] pt-4 mt-2">
              Since this post is approved and public, any text or image edits you make will be submitted to admins for review before appearing live.
            </p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm border border-red-200 mt-4">
            {error}
          </div>
        )}

        <div className="submit-row mt-8">
          <span>{post?.status === 'approved' && post?.visibility === 'public' ? 'Submit to queue' : 'Save immediately'}</span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="dark-button !inline-flex justify-center items-center gap-2 border-0 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {progress || 'Saving…'}
              </>
            ) : (
              <>Save changes <Send size={15}/></>
            )}
          </button>
        </div>
      </form>
    </main>
  )
}
