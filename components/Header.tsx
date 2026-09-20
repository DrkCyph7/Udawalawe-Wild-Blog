'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Menu, LogOut, X, Home, Compass, BookOpen, PenLine, Shield, Calendar } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ displayName?: string | null, photoURL?: string | null } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!auth) return
    let unsubSnap: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (unsubSnap) unsubSnap();

      if (currentUser) {
        const token = await currentUser.getIdTokenResult()
        setIsAdmin(!!token.claims.admin)
        
        // Ensure user document exists and listen to real-time updates for navbar
        const userRef = doc(db, 'users', currentUser.uid)
        unsubSnap = onSnapshot(userRef, async (snap) => {
          if (!snap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
              photoURL: currentUser.photoURL || null,
              email: currentUser.email || null,
              bio: null,
              createdAt: serverTimestamp(),
              postCount: 0
            })
          } else {
            setUserProfile({
              displayName: snap.data().displayName,
              photoURL: snap.data().photoURL
            })
          }
        }, (err) => {
          console.error("Error listening to user doc:", err)
        })
      } else {
        setIsAdmin(false)
        setUserProfile(null)
      }
    })
    return () => {
      unsubscribe()
      if (unsubSnap) unsubSnap()
    }
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
        <a href="https://udawalawe-wild.com/" className="brand flex items-center">
          <Image src="/blog/logo-black.png" alt="Udawalawe Wild" width={180} height={48} className="h-8 md:h-10 w-auto object-contain" />
        </a>
        <nav>
          <a href="https://udawalawe-wild.com/" className="flex items-center gap-1.5"><Home size={14}/> Home</a>
          <a href="https://udawalawe-wild.com/safaris" className="flex items-center gap-1.5"><Compass size={14}/> Safaris</a>
          <Link href="/" className={`flex items-center gap-1.5 ${pathname === '/' ? 'active' : ''}`}><BookOpen size={14}/> Blog</Link>
          <Link href="/new" className={`flex items-center gap-1.5 ${pathname === '/new' ? 'active' : ''}`}><PenLine size={14}/> Share a story</Link>
          {isAdmin && (
            <Link href="/admin" className={`flex items-center gap-1.5 ${pathname === '/admin' ? 'active' : ''}`}><Shield size={14}/> Admin</Link>
          )}
        </nav>
        <div className="nav-actions">
          <a href="https://udawalawe-wild.com/book" className="hidden lg:flex items-center gap-2 bg-[#c29d5f] hover:bg-[#b08d55] text-white px-4 py-2.5 rounded-full text-[12px] font-bold tracking-[0.03em] transition-colors">
            <Calendar size={14}/> Plan my safari
          </a>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link href={`/profile/${user.uid}`} className="nav-profile-link">
                {(userProfile?.photoURL || user.photoURL) ? (
                  <img src={userProfile?.photoURL || user.photoURL || ''} alt="Profile" className="avatar object-cover" />
                ) : (
                  <span className="avatar">{((userProfile?.displayName || user.displayName || user.email || 'U').charAt(0)).toUpperCase()}</span>
                )}
                <span className="nav-name">{userProfile?.displayName || user.displayName || user.email?.split('@')[0]}</span>
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

      {/* Next Level Mobile Nav Drawer */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)} 
      />
      <div 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[340px] bg-[#f7f5ef] shadow-2xl flex flex-col px-8 py-10 gap-8 md:hidden z-50 transform transition-transform duration-300 ease-out overflow-y-auto ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-4">
          <a href="https://udawalawe-wild.com/">
            <Image src="/blog/logo-black.png" alt="Udawalawe Wild" width={140} height={36} className="h-7 w-auto object-contain" />
          </a>
          <button 
            className="text-[#768078] hover:text-[#304936] transition-colors p-2 -mr-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={24}/>
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <a href="https://udawalawe-wild.com/" className="flex items-center gap-3 text-xl font-serif text-[#768078]"><Home size={20}/> Main Site</a>
          <a href="https://udawalawe-wild.com/safaris" className="flex items-center gap-3 text-xl font-serif text-[#768078]"><Compass size={20}/> Safaris</a>
          <a href="https://udawalawe-wild.com/book" className="flex items-center gap-3 text-xl font-serif text-[#c29d5f] font-bold"><Calendar size={20}/> Plan my safari</a>
          <Link href="/" className={`flex items-center gap-3 text-xl font-serif ${pathname === '/' ? 'text-[#304936]' : 'text-[#768078]'}`}><BookOpen size={20}/> Blog Stories</Link>
          <Link href="/new" className={`flex items-center gap-3 text-xl font-serif ${pathname === '/new' ? 'text-[#304936]' : 'text-[#768078]'}`}><PenLine size={20}/> Share a story</Link>
          {isAdmin && (
            <Link href="/admin" className={`flex items-center gap-3 text-xl font-serif ${pathname === '/admin' ? 'text-[#304936]' : 'text-[#768078]'}`}><Shield size={20}/> Admin</Link>
          )}
        </div>
        
        <hr className="border-[#d8d5ca] my-2" />
        
        {user ? (
          <div className="flex flex-col gap-6">
            <Link href={`/profile/${user.uid}`} className="text-[#304936] font-semibold flex items-center gap-4 text-[16px]">
              {(userProfile?.photoURL || user.photoURL) ? (
                <img src={userProfile?.photoURL || user.photoURL || ''} alt="Profile" className="avatar !w-10 !h-10 flex-shrink-0 object-cover" />
              ) : (
                <span className="avatar !w-10 !h-10 !text-sm flex-shrink-0">{((userProfile?.displayName || user.displayName || user.email || 'U').charAt(0)).toUpperCase()}</span>
              )}
              {userProfile?.displayName || user.displayName || user.email?.split('@')[0]}
            </Link>
            <button onClick={handleLogout} className="text-[#768078] hover:text-[#304936] text-left text-[16px] font-medium flex items-center gap-3">
              <LogOut size={18} /> Log out
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-auto pb-6">
            <Link href="/login" className="text-[16px] font-medium text-[#768078] text-center w-full py-3">Sign in</Link>
            <Link href="/signup" className="bg-[#304936] text-white py-4 px-4 rounded-[4px] text-center text-[14px] font-bold tracking-[0.05em] uppercase w-full shadow-lg">Join the community</Link>
          </div>
        )}
      </div>
    </header>
  )
}
