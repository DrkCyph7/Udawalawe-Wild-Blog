import { ChevronLeft, Leaf, Pencil } from 'lucide-react'
import { Rating } from '@/components/Rating'
import { LikeButton } from '@/components/LikeButton'
import { ReportButton } from '@/components/ReportButton'
import Link from 'next/link'
import { BlogPost } from '@/lib/types'
import { PostEditButton } from '@/components/PostEditButton'

export function PostDetailView({ post }: { post: BlogPost }) {
  const dateObj = new Date(post.createdAt)
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const rawText = post.body.replace(/<[^>]*>?/gm, '')
  const words = rawText.split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(words / 200))
  const excerpt = rawText.length > 200 ? rawText.substring(0, 200) + '...' : rawText

  const displayName = post.isAnonymous ? 'Anonymous' : (post.authorName || 'Explorer')
  const canLinkToProfile = !post.isAnonymous && !!post.authorId

  return (
    <main className="post-detail">
      <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Back to all stories</Link>

      <div className="detail-header">
        <div>
          <span className="category-tag static">{post.type}</span>
          <h1>{post.title}</h1>
          <p className="detail-dek">{excerpt}</p>
          <div className="detail-byline">
            <span className="avatar large">{displayName.charAt(0)}</span>
            <div>
              {canLinkToProfile ? (
                <Link href={`/blog/profile/${post.authorId}`} className="author-link font-semibold text-sm">
                  {displayName}
                </Link>
              ) : (
                <strong>{displayName}</strong>
              )}
              <span>{dateStr} · {readTime} min read</span>
              {post.visibility === 'private' && (
                <span className="ml-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Private
                </span>
              )}
              <PostEditButton authorId={post.authorId} postId={post.id} />
            </div>
            {post.type === 'Review' && post.rating !== undefined && (
              <Rating value={post.rating} large/>
            )}
          </div>
        </div>
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt={post.title} />
        )}
      </div>

      <div className="article-layout">
        <article className="article-body">
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          {post.images && post.images.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xl font-medium mb-4 border-b pb-2">Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.images.slice(1).map((img, i) => (
                  <img key={i} src={img} alt={`Gallery image ${i + 1}`} className="rounded-lg object-cover w-full aspect-video" loading="lazy" />
                ))}
              </div>
            </div>
          )}

          <div className="article-note mt-12">
            <Leaf size={19}/>
            <span><strong>Leave no trace</strong><br/>Keep a respectful distance and never feed wildlife.</span>
          </div>

          {/* Like + Report row */}
          <div className="post-actions">
            <LikeButton
              postId={post.id}
              initialLikes={post.likes}
              initialLikedBy={post.likedBy}
            />
            <ReportButton
              postId={post.id}
              authorId={post.authorId}
              initialReportedBy={post.reportedBy}
            />
          </div>
        </article>

        <aside className="review-card">
          <h3>Have you been here?</h3>
          <p>Share your experience with fellow explorers.</p>
          <Link href="/blog/new" className="dark-button full !inline-flex justify-center items-center gap-2">
            Write a review <Pencil size={15}/>
          </Link>
          {post.type === 'Review' && post.rating !== undefined && (
            <>
              <div className="review-divider"/>
              <div className="review-stat">
                <strong>{post.rating.toFixed(1)}</strong>
                <Rating value={post.rating} large/>
              </div>
            </>
          )}
        </aside>
      </div>
    </main>
  )
}
