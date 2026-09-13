'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ArrowUpDown } from 'lucide-react'

const SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'liked', label: 'Most Liked' },
  { id: 'rated', label: 'Top Rated' },
]

export function SortControl({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="sort-control">
      <ArrowUpDown size={13} className="sort-icon" />
      {SORTS.map(s => (
        <button
          key={s.id}
          onClick={() => router.push(`${pathname}?sort=${s.id}`)}
          className={`sort-btn ${currentSort === s.id ? 'active' : ''}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
