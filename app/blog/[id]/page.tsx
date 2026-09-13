import { ChevronLeft, Leaf, Pencil } from 'lucide-react'
import { Rating } from '@/components/Rating'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

// Next.js 15+ requires params to be awaited
type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const rawText = data.body?.replace(/<[^>]*>?/gm, '') || '';
      const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;
      return {
        title: `${data.title} | Udawalawe Wild Blog`,
        description: excerpt,
        openGraph: {
          title: data.title,
          description: excerpt,
          images: data.images && data.images.length > 0 ? [data.images[0]] : [],
        }
      }
    }
  } catch (e) {}
  
  return {
    title: 'Story not found | Udawalawe Wild Blog'
  }
}

export default async function PostDetailPage({ params }: Props) { 
  const { id } = await params;
  let post: BlogPost | null = null;

  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.status === 'approved') {
        post = {
          id: docSnap.id,
          authorId: data.authorId,
          authorName: data.authorName,
          title: data.title,
          body: data.body,
          images: data.images || [],
          type: data.type,
          rating: data.rating,
          status: data.status,
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
        } as BlogPost;
      }
    }
  } catch (error) {
    console.error("Error fetching post:", error);
  }

  if (!post) {
    notFound();
  }

  // Format date
  const dateObj = new Date(post.createdAt);
  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Calculate read time
  const rawText = post.body.replace(/<[^>]*>?/gm, '');
  const words = rawText.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));
  
  const excerpt = rawText.length > 150 ? rawText.substring(0, 150) + '...' : rawText;

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.images,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: [{
      '@type': 'Person',
      name: post.authorName,
    }],
    abstract: excerpt,
  };

  return (
    <main className="post-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <Link href="/blog" className="back-link !inline-flex items-center"><ChevronLeft size={16}/> Back to all stories</Link>
      <div className="detail-header">
        <div>
          <span className="category-tag static">{post.type}</span>
          <h1>{post.title}</h1>
          <p className="detail-dek">{excerpt}</p>
          <div className="detail-byline">
            <span className="avatar large">{post.authorName.charAt(0)}</span>
            <div>
              <strong>{post.authorName}</strong>
              <span>{dateStr} · {readTime} min read</span>
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
        </article>
        
        <aside className="review-card">
          <h3>Have you been here?</h3>
          <p>Share your experience with fellow explorers.</p>
          <Link href="/blog/new" className="dark-button full !inline-flex justify-center items-center gap-2">Write a review <Pencil size={15}/></Link>
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
