import Link from 'next/link'
import { Rating } from './Rating'
import { Heart, Lock } from 'lucide-react'
import { BlogPost } from '@/lib/types'

export function BlogCard({ post }: { post: BlogPost }) {
  // Strip HTML for the excerpt
  const rawText = post.body.replace(/<[^>]*>?/gm, '')
  const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText

  // Format date
  const dateObj = new Date(post.createdAt)
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  // Calculate read time
  const words = rawText.split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(words / 200))

  // Display name — anonymous posts hide identity
  const displayName = post.isAnonymous ? 'Anonymous' : (post.authorName || 'Explorer')
  const canLinkToProfile = !post.isAnonymous && !!post.authorId

  return (
    <article className="blog-card">
      <Link href={`/blog/${post.id}`} className="image-button block">
        {post.images && post.images.length > 0 ? (
          <img src={post.images[0]} alt={post.title} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400 text-sm">No image</span>
          </div>
        )}
        <span className="category-tag">{post.type}</span>
        {post.visibility === 'private' && (
          <span className="private-tag"><Lock size={10}/> Private</span>
        )}
      </Link>
      <div className="card-copy">
        <div className="meta">
          <span>{dateStr}</span><span>·</span><span>{readTime} min read</span>
        </div>
        <Link href={`/blog/${post.id}`} className="card-title block">
          {post.title}
        </Link>
        <p>{excerpt}</p>
        <div className="card-footer">
          <span className="author">
            <span className="avatar">{displayName.charAt(0)}</span>
            {canLinkToProfile ? (
              <Link href={`/blog/profile/${post.authorId}`} className="author-link">
                {displayName}
              </Link>
            ) : (
              <span>{displayName}</span>
            )}
          </span>
          <div className="card-footer-right">
            {post.type === 'Review' && post.rating !== undefined && (
              <Rating value={post.rating} />
            )}
            {(post.likes ?? 0) > 0 && (
              <span className="card-likes">
                <Heart size={11} fill="currentColor" /> {post.likes}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
