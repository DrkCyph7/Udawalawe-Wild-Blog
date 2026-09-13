'use client';

import Link from 'next/link'
import { Leaf, Search, Menu } from 'lucide-react'
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Link href="/blog" className="brand">
          <span className="brand-mark"><Leaf size={18}/></span>
          <span>UDAWALAWE<br/><em>WILD</em></span>
        </Link>
        <nav>
          <Link href="/blog" className={pathname === '/blog' ? 'active' : ''}>Stories</Link>
          <Link href="/blog/new" className={pathname === '/blog/new' ? 'active' : ''}>Share a story</Link>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" aria-label="Search"><Search size={18}/></button>
          <Link href="/blog/login" className="text-link">Sign in</Link>
          <Link href="/blog/signup" className="pill-button small !inline-flex items-center justify-center">Join the community</Link>
          <button className="menu-button" aria-label="Menu"><Menu size={20}/></button>
        </div>
      </div>
    </header>
  )
}
