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
    <div className="relative mb-8">
      <div className="flex flex-nowrap md:flex-wrap overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <Link 
          href={`/?sort=${currentSort}`}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap min-h-[44px] flex items-center justify-center ${
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border whitespace-nowrap min-h-[44px] flex items-center justify-center ${
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
      <div className="absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-[#fbfaf6] to-transparent pointer-events-none md:hidden" />
    </div>
  )
}
