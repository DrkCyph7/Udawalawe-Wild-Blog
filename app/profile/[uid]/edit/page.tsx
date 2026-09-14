'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore'
import { User, updateProfile } from 'firebase/auth'
import { ChevronLeft, Camera, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const router = useRouter()
  const [uid, setUid] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [photoURL, setPhotoURL] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [fetchUser, setFetchUser] = useState<User | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadProfile = async (user: User) => {
    setLoading(true)
    setFetchError(false)
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      if (snap.exists()) {
        const data = snap.data()
        setDisplayName(data.displayName || user.displayName || '')
        setBio(data.bio || '')
        setPhotoURL(data.photoURL || null)
      } else {
        setDisplayName(user.displayName || '')
      }
    } catch (err) {
      console.error('Failed to load profile:', err)
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    params.then(async ({ uid: paramUid }) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/login')
          return
        }
        if (user.uid !== paramUid) {
          router.push(`/profile/${paramUid}`)
          return
        }
        setUid(user.uid)
        setFetchUser(user)
        loadProfile(user)
      })
      return () => unsubscribe()
    })
  }, [])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5MB.')
      return
    }
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError('')
  }

  const uploadPhoto = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary not configured.')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('Photo upload failed.')
    const data = await res.json()
    return data.secure_url
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setError('Display name is required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      let finalPhotoURL = photoURL
      if (photoFile) {
        finalPhotoURL = await uploadPhoto(photoFile)
      }

      // Only write allowed fields (rules enforce this server-side too)
      await setDoc(doc(db, 'users', uid), {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: finalPhotoURL,
      }, { merge: true })

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { 
          photoURL: finalPhotoURL || '',
          displayName: displayName.trim() 
        })
      }

      // Sync the new profile photo and name to existing posts
      try {
        const postsQ = query(collection(db, 'posts'), where('authorId', '==', uid));
        const postsSnap = await getDocs(postsQ);
        if (!postsSnap.empty) {
          const batch = writeBatch(db);
          postsSnap.forEach((docSnap) => {
            batch.update(docSnap.ref, {
              authorName: displayName.trim(),
              authorPhotoURL: finalPhotoURL,
              updatedAt: serverTimestamp()
            });
          });
          await batch.commit();
        }
      } catch (err) {
        console.error("Failed to sync posts with new profile details:", err);
      }

      setPhotoURL(finalPhotoURL)
      setPhotoFile(null)
      setPhotoPreview(null)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#304936] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fbfaf6]">
        <p className="text-red-600 mb-4 font-serif text-lg">Failed to load profile data.</p>
        <button onClick={() => fetchUser && loadProfile(fetchUser)} className="dark-button">Retry</button>
      </div>
    )
  }

  const avatarSrc = photoPreview || photoURL
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <main className="edit-profile-page">
      <Link href={`/profile/${uid}`} className="back-link !inline-flex items-center">
        <ChevronLeft size={16} /> Back to profile
      </Link>

      <div className="edit-profile-inner">
        <p className="eyebrow"><span className="eyebrow-line" /> Edit your profile</p>
        <h1>Your <i>story</i></h1>

        <form onSubmit={handleSave} className="edit-profile-form">
          {/* Avatar upload */}
          <div className="avatar-upload-wrap">
            <div className="avatar-upload" onClick={() => fileInputRef.current?.click()}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="avatar-upload-img" />
              ) : (
                <span className="avatar-upload-initials">{initials}</span>
              )}
              <div className="avatar-upload-overlay">
                <Camera size={20} />
                <span>Change photo</span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <p className="avatar-hint">Max 5MB · JPG, PNG, WebP</p>
          </div>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">Profile saved!</div>}

          <label>
            Display name
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={60}
            />
          </label>

          <label>
            Bio <span className="label-hint">(optional)</span>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell the community a little about yourself…"
              rows={4}
              maxLength={300}
            />
            <span className="char-count">{bio.length}/300</span>
          </label>

          <div className="edit-profile-actions">
            <button
              type="submit"
              disabled={saving}
              className="dark-button !inline-flex items-center gap-2"
            >
              {saving ? 'Saving…' : <><Save size={15} /> Save profile</>}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
