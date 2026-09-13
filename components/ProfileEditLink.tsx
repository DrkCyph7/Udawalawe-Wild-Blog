'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

export function ProfileEditLink({ uid }: { uid: string }) {
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsOwner(user?.uid === uid)
    })
    return () => unsub()
  }, [uid])

  if (!isOwner) return null

  return (
    <Link href={`/blog/profile/${uid}/edit`} className="profile-edit-link">
      <Pencil size={12}/> Edit profile
    </Link>
  )
}
