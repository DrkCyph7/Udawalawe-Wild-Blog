'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Menu, LogOut, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    if (auth) await signOut(auth)
  }

  return (
    <header className="site-header">
      <div className="nav-wrap relative">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <Image src="/blog/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
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
            <div className="hidden md:flex items-center gap-3">
              <Link href={`/profile/${user.uid}`} className="nav-profile-link">
                <span className="avatar">{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                <span className="nav-name">{user.displayName || user.email?.split('@')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-link flex items-center gap-1.5">
                <LogOut size={14} /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-link hidden md:inline-flex">Sign in</Link>
              <Link href="/signup" className="pill-button small !hidden md:!inline-flex items-center justify-center">Join</Link>
            </>
          )}
          <button 
            className="menu-button md:hidden" 
            aria-label="Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-[78px] left-0 w-full bg-[#f7f5ef] border-b border-[#d8d5ca] shadow-lg flex flex-col px-6 py-8 gap-5 md:hidden z-50">
          <Link href="/" className={`text-[16px] font-medium ${pathname === '/' ? 'text-[#304936]' : 'text-[#768078]'}`}>Stories</Link>
          <Link href="/new" className={`text-[16px] font-medium ${pathname === '/new' ? 'text-[#304936]' : 'text-[#768078]'}`}>Share a story</Link>
          {isAdmin && (
            <Link href="/admin" className={`text-[16px] font-medium ${pathname === '/admin' ? 'text-[#304936]' : 'text-[#768078]'}`}>Admin</Link>
          )}
          
          <hr className="border-[#d8d5ca] my-1" />
          
          {user ? (
            <div className="flex flex-col gap-5">
              <Link href={`/profile/${user.uid}`} className="text-[#304936] font-semibold flex items-center gap-3 text-[15px]">
                <span className="avatar flex-shrink-0">{(user.displayName || user.email || 'U').charAt(0).toUpperCase()}</span>
                {user.displayName || user.email?.split('@')[0]}
              </Link>
              <button onClick={handleLogout} className="text-[#768078] hover:text-[#304936] text-left text-[15px] font-medium flex items-center gap-2">
                <LogOut size={16} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-2">
              <Link href="/login" className="text-[15px] font-medium text-[#768078] text-center w-full py-2">Sign in</Link>
              <Link href="/signup" className="bg-[#304936] text-white py-3.5 px-4 rounded-[2px] text-center text-[13px] font-medium tracking-[0.03em] w-full">Join the community</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
