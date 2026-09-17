import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost, UserProfile } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import { BlogCard } from '@/components/BlogCard'
import { ProfileEditLink } from '@/components/ProfileEditLink'
import { ProfileTabs } from '@/components/ProfileTabs'

type Props = { params: Promise<{ uid: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      const data = snap.data()
      return {
        title: `${data.displayName || 'Explorer'} | Udawalawe Wild Blog`,
        description: data.bio || `Wildlife stories by ${data.displayName || 'this explorer'}.`,
      }
    }
  } catch {}
  return { title: 'Profile | Udawalawe Wild Blog' }
}

export const dynamic = 'force-dynamic'

export default async function ProfilePage({ params }: Props) {
  const { uid } = await params

  // Fetch user profile
  const userSnap = await getDoc(doc(db, 'users', uid))
  if (!userSnap.exists()) notFound()
  const profile: UserProfile = { uid, ...userSnap.data() } as UserProfile

  // Fetch their approved public posts only
  const q = query(
    collection(db, 'posts'),
    where('authorId', '==', uid),
    where('status', '==', 'approved'),
    where('visibility', '==', 'public')
  )
  const snapshot = await getDocs(q)
  const posts: BlogPost[] = snapshot.docs
    .map(d => {
      const data = d.data()
      return {
        id: d.id,
        authorId: data.authorId,
        authorName: data.authorName,
        authorPhotoURL: data.authorPhotoURL || null,
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
      } as BlogPost
    })
    // Hide anonymous posts from profile (they appear as "Anonymous" in feeds but
    // the author's profile should not reveal which anonymous posts belong to them)
    // Also hide private posts
    .filter(p => !p.isAnonymous && p.visibility !== 'private')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const initials = (profile.displayName || 'U')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
  let joinedDateStr = null
  const rawCreatedAt = userSnap.data().createdAt
  if (rawCreatedAt) {
    const d = rawCreatedAt.toDate ? rawCreatedAt.toDate() : new Date(rawCreatedAt)
    if (!isNaN(d.getTime())) {
      joinedDateStr = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-wrap">
          {profile.photoURL ? (
            <img src={profile.photoURL} alt={profile.displayName} className="profile-avatar-img" />
          ) : (
            <span className="profile-avatar-fallback">{initials}</span>
          )}
        </div>
        <div className="profile-meta">
          <p className="eyebrow"><span className="eyebrow-line" /> Explorer profile</p>
          <h1 style={!profile.bio ? { marginBottom: '8px' } : undefined}>{profile.displayName || 'Explorer'}</h1>
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> public stories</span>
            {joinedDateStr && (
              <>
                <span className="text-zinc-300 mx-3">•</span>
                <span>Joined {joinedDateStr}</span>
              </>
            )}
          </div>
          {posts.length <= 1 && (
            <div className="mt-5">
              <Link href="/new" className="text-link !inline-flex items-center gap-1">
                Share your next sighting <span style={{ fontSize: '1.2em', lineHeight: 1 }}>→</span>
              </Link>
            </div>
          )}
          <ProfileEditLink uid={uid} />
        </div>
      </div>

      <ProfileTabs uid={uid} initialPublicPosts={posts} />
    </main>
  )
}
