'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LogOut, X, Home, Compass, BookOpen, PenLine, Shield, Calendar, AlignRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<{ displayName?: string | null, photoURL?: string | null } | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [iconKey, setIconKey] = useState(0) // forces re-mount for animation

  // ── Scroll-aware header shadow ──────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Body scroll lock when drawer is open ───────────────────────
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isMenuOpen])

  // ── Firebase auth + user profile listener ──────────────────────
  useEffect(() => {
    if (!auth) return
    let unsubSnap: (() => void) | undefined

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (unsubSnap) unsubSnap()

      if (currentUser) {
        const token = await currentUser.getIdTokenResult()
        setIsAdmin(!!token.claims.admin)

        const userRef = doc(db, 'users', currentUser.uid)
        unsubSnap = onSnapshot(userRef, async (snap) => {
          if (!snap.exists()) {
            await setDoc(userRef, {
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
              photoURL: currentUser.photoURL || null,
              email: currentUser.email || null,
              bio: null,
              createdAt: serverTimestamp(),
              postCount: 0,
            })
          } else {
            setUserProfile({
              displayName: snap.data().displayName,
              photoURL: snap.data().photoURL,
            })
          }
        }, (err) => console.error('Error listening to user doc:', err))
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

  // ── Close drawer on route change ───────────────────────────────
  useEffect(() => { setIsMenuOpen(false) }, [pathname])

  const toggleMenu = () => {
    setIconKey(k => k + 1) // re-trigger icon animation
    setIsMenuOpen(o => !o)
  }

  const handleLogout = async () => {
    if (auth) await signOut(auth)
  }

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split('@')[0]
  const photoURL = userProfile?.photoURL || user?.photoURL

  return (
    <>
      {/* ── Desktop / Mobile Header Bar ──────────────────────────── */}
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-wrap">
          {/* Brand logo */}
          <a href="https://udawalawe-wild.com/" className="brand flex items-center" aria-label="Udawalawe Wild – home">
            <Image
              src="/blog/logo-black.png"
              alt="Udawalawe Wild"
              width={180}
              height={48}
              className="h-8 md:h-9 w-auto object-contain"
              priority
            />
          </a>

          {/* Desktop nav */}
          <nav aria-label="Primary navigation">
            <a href="https://udawalawe-wild.com/" className="flex items-center gap-1.5">
              <Home size={13} strokeWidth={1.75} /> Home
            </a>
            <a href="https://udawalawe-wild.com/safaris" className="flex items-center gap-1.5">
              <Compass size={13} strokeWidth={1.75} /> Safaris
            </a>
            <Link href="/" className={`flex items-center gap-1.5 ${pathname === '/' ? 'active' : ''}`}>
              <BookOpen size={13} strokeWidth={1.75} /> Blog
            </Link>
            <Link href="/new" className={`flex items-center gap-1.5 ${pathname === '/new' ? 'active' : ''}`}>
              <PenLine size={13} strokeWidth={1.75} /> Share a story
            </Link>
            {isAdmin && (
              <Link href="/admin" className={`flex items-center gap-1.5 ${pathname === '/admin' ? 'active' : ''}`}>
                <Shield size={13} strokeWidth={1.75} /> Admin
              </Link>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="nav-actions">
            {/* CTA button – desktop only */}
            <a
              href="https://udawalawe-wild.com/book"
              className="hidden lg:flex items-center gap-2 bg-[#c29d5f] hover:bg-[#b08d55] text-white px-4 py-2 rounded-full text-[11.5px] font-bold tracking-[0.04em] transition-all duration-200 hover:shadow-[0_4px_14px_rgba(194,157,95,.35)] hover:-translate-y-px active:translate-y-0"
            >
              <Calendar size={13} strokeWidth={2} /> Plan my safari
            </a>

            {/* User profile / auth – desktop */}
            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link href={`/profile/${user.uid}`} className="nav-profile-link">
                  {photoURL ? (
                    <img src={photoURL} alt="Profile" className="avatar object-cover" />
                  ) : (
                    <span className="avatar">{(displayName || 'U').charAt(0).toUpperCase()}</span>
                  )}
                  <span className="nav-name">{displayName}</span>
                </Link>
                <button onClick={handleLogout} className="text-link flex items-center gap-1.5 text-[12px]">
                  <LogOut size={13} strokeWidth={1.75} /> Log out
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-link hidden md:inline-flex text-[12.5px]">Sign in</Link>
                <Link href="/signup" className="pill-button small !hidden md:!inline-flex items-center justify-center">Join</Link>
              </>
            )}

            {/* Hamburger – mobile only */}
            <button
              className="menu-button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={toggleMenu}
            >
              <span key={iconKey} className="menu-icon-animate">
                {isMenuOpen ? <X size={21} strokeWidth={1.75} /> : <AlignRight size={21} strokeWidth={1.75} />}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────── */}

      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[110] transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Drawer panel */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-[82%] max-w-[320px] bg-[#f7f5ef] shadow-2xl flex flex-col px-7 pt-8 pb-8 z-[120] transform transition-transform duration-[320ms] ease-[cubic-bezier(.22,1,.36,1)] overflow-y-auto ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex justify-between items-center mb-8">
          <a href="https://udawalawe-wild.com/" onClick={() => setIsMenuOpen(false)}>
            <Image src="/blog/logo-black.png" alt="Udawalawe Wild" width={130} height={34} className="h-7 w-auto object-contain" />
          </a>
          <button
            className="text-[#768078] hover:text-[#304936] transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#e9e5d9] -mr-1.5"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex flex-col" aria-label="Mobile navigation">
          <a href="https://udawalawe-wild.com/" className="flex items-center gap-3.5 py-3.5 px-3 -mx-3 text-[16px] font-serif text-[#768078] hover:text-[#304936] hover:bg-[#f0ede4] rounded-lg transition-colors">
            <Home size={18} strokeWidth={1.75} /> Home
          </a>
          <a href="https://udawalawe-wild.com/safaris" className="flex items-center gap-3.5 py-3.5 px-3 -mx-3 text-[16px] font-serif text-[#768078] hover:text-[#304936] hover:bg-[#f0ede4] rounded-lg transition-colors">
            <Compass size={18} strokeWidth={1.75} /> Safaris
          </a>
          <Link href="/" className={`flex items-center gap-3.5 py-3.5 px-3 -mx-3 text-[16px] font-serif hover:bg-[#f0ede4] rounded-lg transition-colors ${pathname === '/' ? 'text-[#304936] font-semibold' : 'text-[#768078] hover:text-[#304936]'}`}>
            <BookOpen size={18} strokeWidth={1.75} /> Blog Stories
          </Link>
          <Link href="/new" className={`flex items-center gap-3.5 py-3.5 px-3 -mx-3 text-[16px] font-serif hover:bg-[#f0ede4] rounded-lg transition-colors ${pathname === '/new' ? 'text-[#304936] font-semibold' : 'text-[#768078] hover:text-[#304936]'}`}>
            <PenLine size={18} strokeWidth={1.75} /> Share a story
          </Link>
          {isAdmin && (
            <Link href="/admin" className={`flex items-center gap-3.5 py-3.5 px-3 -mx-3 text-[16px] font-serif hover:bg-[#f0ede4] rounded-lg transition-colors ${pathname === '/admin' ? 'text-[#304936] font-semibold' : 'text-[#768078] hover:text-[#304936]'}`}>
              <Shield size={18} strokeWidth={1.75} /> Admin
            </Link>
          )}
        </nav>

        {/* Bottom section — pushed to bottom */}
        <div className="mt-auto flex flex-col gap-5 pt-6">
          <hr className="border-[#d8d5ca]" />

          {/* Plan my safari CTA */}
          <a
            href="https://udawalawe-wild.com/book"
            className="mobile-safari-cta flex items-center justify-center gap-2.5 bg-[#c29d5f] text-white px-4 py-3.5 rounded-full text-[14px] font-bold tracking-[0.04em] shadow w-full"
          >
            <Calendar size={16} strokeWidth={2} /> Plan my safari
          </a>

          {/* Auth */}
          {user ? (
            <div className="flex flex-col gap-4">
              <Link
                href={`/profile/${user.uid}`}
                className="text-[#304936] font-semibold flex items-center gap-3.5 text-[15px] py-1"
              >
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="avatar !w-10 !h-10 flex-shrink-0 object-cover" />
                ) : (
                  <span className="avatar !w-10 !h-10 !text-sm flex-shrink-0">{(displayName || 'U').charAt(0).toUpperCase()}</span>
                )}
                {displayName}
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#768078] hover:text-[#304936] text-left text-[14px] font-medium flex items-center gap-2.5 transition-colors"
              >
                <LogOut size={16} strokeWidth={1.75} /> Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="text-[14px] font-medium text-[#768078] hover:text-[#304936] text-center w-full py-2.5 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-[#304936] hover:bg-[#243a29] text-white py-3.5 px-4 rounded-[4px] text-center text-[13px] font-bold tracking-[0.06em] uppercase w-full shadow transition-colors"
              >
                Join the community
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
