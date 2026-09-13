'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Menu, LogOut, UserCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const token = await currentUser.getIdTokenResult()
        setIsAdmin(!!token.claims.admin)
      } else {
        setIsAdmin(false)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (auth) await signOut(auth)
  }

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </span>
          <span>UDAWALAWE<br/><em>WILD</em></span>
        </Link>
        <nav>
          <Link href="/" className={pathname === '/' ? 'active' : ''}>Stories</Link>
          <Link href="/new" className={pathname === '/new' ? 'active' : ''}>Share a story</Link>
          {isAdmin && (
            <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link>
          )}
        </nav>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Search"><Search size={18}/></button>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={`/blog/profile/${user.uid}`} className="nav-profile-link">
                <span className="avatar">{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                <span className="nav-name">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-link flex items-center gap-1.5">
                <LogOut size={14} /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-link">Sign in</Link>
              <Link href="/signup" className="pill-button small !inline-flex items-center justify-center">Join</Link>
            </>
          )}
          <button className="menu-button" aria-label="Menu"><Menu size={20}/></button>
        </div>
      </div>
    </header>
  )
}
