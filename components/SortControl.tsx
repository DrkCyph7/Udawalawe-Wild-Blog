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
    <div className="sort-control flex items-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <ArrowUpDown size={13} className="sort-icon flex-shrink-0 mr-2" />
      {SORTS.map(s => (
        <button
          key={s.id}
          onClick={() => router.push(`${pathname}?sort=${s.id}`)}
          className={`sort-btn flex-shrink-0 min-h-[44px] flex items-center justify-center ${currentSort === s.id ? 'active' : ''}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}
