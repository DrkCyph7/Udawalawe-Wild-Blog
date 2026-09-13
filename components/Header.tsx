'use client';

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Menu, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/blog" className="brand">
          <span className="brand-mark">
            <Image src="/logo.png" alt="Logo" width={24} height={24} className="object-contain" />
          </span>
          <span>UDAWALAWE<br/><em>WILD</em></span>
        </Link>
        <nav>
          <Link href="/blog" className={pathname === '/blog' ? 'active' : ''}>Stories</Link>
          <Link href="/blog/new" className={pathname === '/blog/new' ? 'active' : ''}>Share a story</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Search"><Search size={18}/></button>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-stone-600">
                Hi, {user.displayName || user.email?.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="text-link flex items-center gap-2">
                <LogOut size={16} /> Log out
              </button>
            </div>
          ) : (
            <>
              <Link href="/blog/login" className="text-link">Sign in</Link>
              <Link href="/blog/signup" className="pill-button small !inline-flex items-center justify-center">Join the community</Link>
            </>
          )}
          <button className="menu-button" aria-label="Menu"><Menu size={20}/></button>
        </div>
      </div>
    </header>
  )
}
