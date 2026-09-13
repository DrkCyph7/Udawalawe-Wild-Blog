import { ChevronLeft, Leaf, Pencil } from 'lucide-react'
import { Rating } from '@/components/Rating'
import { posts } from '@/lib/mock-data'
import Link from 'next/link'

export default function PostDetailPage() { 
  const post = posts[0]; 
  return (
    <main className="post-detail">
      <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Back to all stories</Link>
      <div className="detail-header">
        <div>
          <span className="category-tag static">{post.category}</span>
          <h1>{post.title}</h1>
          <p className="detail-dek">A morning among Sri Lanka’s most iconic residents, and what their quiet rituals teach us about wild places.</p>
          <div className="detail-byline">
            <span className="avatar large">N</span>
            <div>
              <strong>{post.author}</strong>
              <span>{post.date} · {post.read}</span>
            </div>
            <Rating value={post.rating} large/>
          </div>
        </div>
        <img src={post.image} alt="Elephant walking in Udawalawe"/>
      </div>
      <div className="article-layout">
        <article className="article-body">
          <p className="lead">At 6:12 on a cool September morning, the first elephant appeared through the mist. She was older, deliberate, and entirely unhurried.</p>
          <p>Udawalawe is known for its elephants. But to call them an attraction is to miss the point. They are the park’s original residents, moving through the grasslands with a patience that makes our own hurried lives feel slightly absurd.</p>
          <blockquote>“The best sightings are not the dramatic ones. They are the quiet moments when the wild forgets you are there.”</blockquote>
          <p>We watched her family gather at the water’s edge. A calf leaned into its mother; a tusker stood guard beneath a rain tree. Then, as softly as they had arrived, they disappeared into the green.</p>
          <div className="article-note">
            <Leaf size={19}/>
            <span><strong>Leave no trace</strong><br/>Keep a respectful distance and never feed wildlife.</span>
          </div>
        </article>
        <aside className="review-card">
          <h3>Have you been here?</h3>
          <p>Share your experience with fellow explorers.</p>
          <Link href="/blog/login" className="dark-button full !inline-flex justify-center items-center gap-2">Write a review <Pencil size={15}/></Link>
          <div className="review-divider"/>
          <div className="review-stat">
            <strong>4.9</strong>
            <Rating value={4.9} large/>
            <span>Based on 28 reviews</span>
          </div>
        </aside>
      </div>
    </main>
  ) 
}
