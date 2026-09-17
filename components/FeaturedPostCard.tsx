import Link from 'next/link'
import { Rating } from './Rating'
import { Heart, Lock } from 'lucide-react'
import { BlogPost } from '@/lib/types'
import { PostEditButton } from './PostEditButton'
import { getExcerpt } from '@/lib/utils'

export function FeaturedPostCard({ post }: { post: BlogPost }) {
  // Strip HTML for the excerpt
  const excerpt = getExcerpt(post.body, 250)

  // Format date
  const dateObj = new Date(post.createdAt)
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  // Calculate read time
  const words = rawText.split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(words / 200))

  // Display name — anonymous posts hide identity
  const displayName = post.isAnonymous ? 'Anonymous' : (post.authorName || 'Explorer')
  const canLinkToProfile = !post.isAnonymous && !!post.authorId

  return (
    <article className="mb-12 bg-white rounded-2xl overflow-hidden shadow-sm border border-[#d8d5ca] flex flex-col md:flex-row transition-shadow hover:shadow-md group">
      <Link href={`/${post.id}`} className="md:w-3/5 h-64 md:h-auto relative overflow-hidden block">
        {post.images && post.images.length > 0 ? (
          <img 
            src={post.images[0]} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400">No image</span>
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-[#e49b5d] text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            Featured
          </span>
          <span className="bg-white/90 backdrop-blur-sm text-[#304936] text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
            {post.type}
          </span>
          {post.visibility === 'private' && (
            <span className="bg-black/70 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Lock size={12}/> Private
            </span>
          )}
        </div>
      </Link>
      <div className="md:w-2/5 p-8 flex flex-col justify-center">
        <div className="text-xs uppercase tracking-widest text-[#768078] font-semibold mb-3">
          <span>{dateStr}</span><span className="mx-2">·</span><span>{readTime} min read</span>
        </div>
        <Link href={`/${post.id}`} className="text-3xl font-serif text-[#2a3c30] mb-4 leading-tight group-hover:text-[#304936] transition-colors">
          {post.title}
        </Link>
        <p className="text-[#526356] leading-relaxed mb-6 font-serif">
          {excerpt}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="flex items-center gap-3">
            {post.authorPhotoURL && canLinkToProfile ? (
              <img src={post.authorPhotoURL} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-[#304936] text-white flex items-center justify-center font-bold text-sm">
                {displayName.charAt(0)}
              </span>
            )}
            {canLinkToProfile ? (
              <Link href={`/profile/${post.authorId}`} className="font-semibold text-[#2a3c30] hover:underline">
                {displayName}
              </Link>
            ) : (
              <span className="font-semibold text-[#2a3c30]">{displayName}</span>
            )}
          </span>
          <div className="flex items-center gap-3 text-[#768078]">
            <PostEditButton authorId={post.authorId} postId={post.id} />
            {post.type === 'Review' && post.rating !== undefined && (
              <Rating value={post.rating} />
            )}
            {(post.likes ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <Heart size={14} fill="currentColor" className="text-[#e49b5d]" /> {post.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
