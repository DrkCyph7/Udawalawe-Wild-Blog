import Link from 'next/link'
import { Rating } from './Rating'
import { Post } from '@/lib/mock-data'

export function BlogCard({ post }: { post: Post }) { 
  return (
    <article className={`blog-card ${post.featured ? 'featured-card' : ''}`}>
      <Link href={`/blog/${post.id}`} className="image-button block">
        <img src={post.image} alt=""/>
        <span className="category-tag">{post.category}</span>
      </Link>
      <div className="card-copy">
        <div className="meta">
          <span>{post.date}</span><span>·</span><span>{post.read}</span>
        </div>
        <Link href={`/blog/${post.id}`} className="card-title block">
          {post.title}
        </Link>
        <p>{post.excerpt}</p>
        <div className="card-footer">
          <span className="author">
            <span className="avatar">{post.author.charAt(0)}</span> {post.author}
          </span>
          <Rating value={post.rating}/>
        </div>
      </div>
    </article>
  ) 
}
