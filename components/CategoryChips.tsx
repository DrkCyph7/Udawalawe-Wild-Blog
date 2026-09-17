'use client'

import Link from 'next/link'
import { AVAILABLE_TAGS } from '@/lib/constants/categories'
import { usePathname, useSearchParams } from 'next/navigation'

export function CategoryChips() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'newest';

  const isCategoryPage = pathname.startsWith('/category/');
  const currentSlug = isCategoryPage ? pathname.split('/')[2] : 'all';

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      <Link 
        href={`/?sort=${currentSort}`}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
          currentSlug === 'all' 
            ? 'bg-[#304936] text-white border-[#304936]' 
            : 'bg-white text-[#526356] border-[#d8d5ca] hover:bg-[#fbfaf6]'
        }`}
      >
        All
      </Link>
      {AVAILABLE_TAGS.map(tag => {
        const isActive = currentSlug === tag.slug;
        return (
          <Link
            key={tag.slug}
            href={`/category/${tag.slug}?sort=${currentSort}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isActive
                ? 'bg-[#304936] text-white border-[#304936]'
                : 'bg-white text-[#526356] border-[#d8d5ca] hover:bg-[#fbfaf6]'
            }`}
          >
            {tag.label}
          </Link>
        )
      })}
    </div>
  )
}
