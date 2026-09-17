'use client'

import React, { useState, useMemo } from 'react'
import Fuse from 'fuse.js'
import debounce from 'lodash.debounce'
import { BlogPost } from '@/lib/types'
import { BlogCard } from './BlogCard'
import { SortControl } from './SortControl'
import { CategoryChips } from './CategoryChips'
import { Search } from 'lucide-react'
import Link from 'next/link'

interface Props {
  initialPosts: BlogPost[]
  currentSort: string
  headerLeft: React.ReactNode
  emptyStateNoPosts: React.ReactNode
}

function stripHtmlAndMarkdown(html: string) {
  if (!html) return ''
  // Very basic strip for fuse indexing
  let text = html.replace(/<[^>]*>?/gm, ' ')
  // Strip some basic markdown
  text = text.replace(/[*_~`#]/g, '')
  return text
}

export function FilteredPostListing({ initialPosts, currentSort, headerLeft, emptyStateNoPosts }: Props) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Note: The app currently does not paginate posts, so `initialPosts` contains
  // all posts (or all posts in the active category). If pagination is introduced later,
  // we would need to either implement server-side search (e.g. Algolia/Typesense) or
  // fetch a large chunk (e.g. limit 500) explicitly for client-side search indexing here.
  
  const updateQuery = useMemo(() => debounce((q: string) => {
    setDebouncedQuery(q)
  }, 250), [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    updateQuery(e.target.value)
  }

  // Pre-process posts to have plain text body for better searching
  const postsToSearch = useMemo(() => {
    return initialPosts.map(p => ({
      ...p,
      bodyPlain: stripHtmlAndMarkdown(p.body || '')
    }))
  }, [initialPosts])

  const fuse = useMemo(() => {
    return new Fuse(postsToSearch, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'bodyPlain', weight: 1 },
        { name: 'tags', weight: 1 },
        { name: 'authorName', weight: 1 }
      ],
      threshold: 0.35,
      ignoreLocation: true, // better for finding substrings anywhere in body
    })
  }, [postsToSearch])

  const filteredPosts = useMemo(() => {
    if (!debouncedQuery.trim()) return initialPosts
    const results = fuse.search(debouncedQuery)
    return results.map(r => r.item)
  }, [debouncedQuery, initialPosts, fuse])

  return (
    <>
      <div className="section-heading">
        {headerLeft}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 mt-6 md:mt-0 w-full md:w-auto">
          <div className="relative w-full md:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#768078]" size={15} />
            <input
              type="text"
              placeholder="Search stories..."
              value={query}
              onChange={handleChange}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-[#d8d5ca] text-sm focus:outline-none focus:border-[#304936] text-[#2a3c30] placeholder:text-[#768078] bg-white transition-colors"
            />
          </div>
          <SortControl currentSort={currentSort} />
        </div>
      </div>

      <CategoryChips />

      {debouncedQuery.trim() && (
        <div className="mb-6 text-sm font-serif text-[#768078]">
          {filteredPosts.length === 1 ? '1 story found' : `${filteredPosts.length} stories found`}
        </div>
      )}

      <div className="post-grid">
        {!debouncedQuery.trim() && initialPosts.length === 0 ? (
          emptyStateNoPosts
        ) : debouncedQuery.trim() && filteredPosts.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <p className="text-[#768078] font-serif text-lg mb-2">
              No stories match &apos;{debouncedQuery}&apos;
            </p>
            <p className="text-[#768078] text-sm">
              Try a different search or <Link href="/" className="underline hover:text-[#304936]">browse by category</Link>
            </p>
          </div>
        ) : (
          filteredPosts.map(post => <BlogCard key={post.id} post={post as BlogPost} />)
        )}
      </div>
    </>
  )
}
