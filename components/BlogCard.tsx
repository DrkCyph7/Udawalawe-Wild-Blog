import Link from 'next/link'
import { Rating } from './Rating'
import { BlogPost } from '@/lib/types'

export function BlogCard({ post }: { post: BlogPost }) { 
  // Strip HTML for the excerpt
  const rawText = post.body.replace(/<[^>]*>?/gm, '');
  const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;

  // Format date
  const dateObj = new Date(post.createdAt);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Calculate read time (rough estimate: 200 words per min)
  const words = rawText.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <article className={`blog-card`}>
      <Link href={`/blog/${post.id}`} className="image-button block">
        {post.images && post.images.length > 0 ? (
          <img src={post.images[0]} alt={post.title} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
            <span className="text-zinc-400">No image</span>
          </div>
        )}
        <span className="category-tag">{post.type}</span>
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
            <span className="avatar">{post.authorName.charAt(0)}</span> {post.authorName}
          </span>
          {post.type === 'Review' && post.rating !== undefined && (
            <Rating value={post.rating} />
          )}
        </div>
      </div>
    </article>
  ) 
}
