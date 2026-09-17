import { ChevronLeft, Leaf, Pencil } from 'lucide-react'
import { Rating } from '@/components/Rating'
import { LikeButton } from '@/components/LikeButton'
import { ReportButton } from '@/components/ReportButton'
import Link from 'next/link'
import { BlogPost } from '@/lib/types'
import { PostEditButton } from '@/components/PostEditButton'
import { BlogCard } from '@/components/BlogCard'
import { getExcerpt } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export function PostDetailView({ post, relatedPosts }: { post: BlogPost; relatedPosts?: BlogPost[] }) {
  const dateObj = new Date(post.createdAt)
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const rawText = post.body.replace(/<[^>]*>?/gm, ' ')
  const words = rawText.split(/\s+/).filter(Boolean).length
  const readTime = Math.max(1, Math.ceil(words / 200))
  const excerpt = getExcerpt(post.body, 200)

  const displayName = post.isAnonymous ? 'Anonymous' : (post.authorName || 'Explorer')
  const canLinkToProfile = !post.isAnonymous && !!post.authorId

  const primaryTagSlug = post.tags?.[0];
  const primaryTagObj = primaryTagSlug ? [
    { label: 'Elephants', slug: 'elephants' },
    { label: 'Birdlife', slug: 'birdlife' },
    { label: 'Park Tips', slug: 'park-tips' },
    { label: 'Photography', slug: 'photography' },
    { label: 'Conservation', slug: 'conservation' },
    { label: 'Wildlife Sightings', slug: 'wildlife-sightings' },
    { label: 'Culture & Community', slug: 'culture-community' },
  ].find(t => t.slug === primaryTagSlug) : null;

  const titleTruncated = post.title.length > 30 ? post.title.substring(0, 30) + '...' : post.title;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://udawalawe-wild-blog.vercel.app/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://udawalawe-wild-blog.vercel.app/' },
      ...(primaryTagObj ? [{ 
        '@type': 'ListItem', 
        position: 3, 
        name: primaryTagObj.label, 
        item: `https://udawalawe-wild-blog.vercel.app/category/${primaryTagObj.slug}` 
      }] : []),
      { 
        '@type': 'ListItem', 
        position: primaryTagObj ? 4 : 3, 
        name: post.title, 
        item: `https://udawalawe-wild-blog.vercel.app/${post.id}` 
      }
    ]
  };

  return (
    <main className="post-detail pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="max-w-4xl mx-auto mb-6 px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Blog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {primaryTagObj && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/category/${primaryTagObj.slug}`}>{primaryTagObj.label}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{titleTruncated}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="detail-header">
        <div>
          <span className="category-tag static">{post.type}</span>
          <h1>{post.title}</h1>
          <p className="detail-dek">{excerpt}</p>
          <div className="detail-byline">
            <span className="avatar large">{displayName.charAt(0)}</span>
            <div>
              {canLinkToProfile ? (
                <Link href={`/profile/${post.authorId}`} className="author-link font-semibold text-sm">
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
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tagSlug => {
                const tagObj = [
                  { label: 'Elephants', slug: 'elephants' },
                  { label: 'Birdlife', slug: 'birdlife' },
                  { label: 'Park Tips', slug: 'park-tips' },
                  { label: 'Photography', slug: 'photography' },
                  { label: 'Conservation', slug: 'conservation' },
                  { label: 'Wildlife Sightings', slug: 'wildlife-sightings' },
                  { label: 'Culture & Community', slug: 'culture-community' },
                ].find(t => t.slug === tagSlug);
                
                return (
                  <Link 
                    key={tagSlug} 
                    href={`/blog/category/${tagSlug}`}
                    className="bg-[#e9e5d9] hover:bg-[#d8d5ca] text-[#304936] px-3 py-1 text-xs font-semibold rounded-full transition-colors inline-block"
                  >
                    {tagObj?.label || tagSlug}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        {post.images && post.images.length > 0 && (
          <img src={post.images[0]} alt={post.title} />
        )}
      </div>

      <div className="article-layout">
        <article className="article-body" style={{ gridRow: 1, gridColumn: 1 }}>
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

        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[var(--line)]" style={{ gridRow: 2, gridColumn: '1 / -1' }}>
            <h2 className="text-3xl font-serif text-[var(--forest)] mb-8">More from the field</h2>
            <div className="post-grid">
              {relatedPosts.map(p => <BlogCard key={p.id} post={p} />)}
            </div>
          </div>
        )}

        <aside className="review-card" style={{ gridRow: 1, gridColumn: 2 }}>
          <h3>Have you been here?</h3>
          <p>Share your experience with fellow explorers.</p>
          <Link href="/new" className="dark-button full !inline-flex justify-center items-center gap-2">
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
