import { ArrowRight, Camera } from 'lucide-react'
import { BlogCard } from '@/components/BlogCard'
import { LoadMore } from '@/components/LoadMore'
import Link from 'next/link'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'

export const dynamic = 'force-dynamic' // Ensure this page runs dynamically for fresh posts, or could revalidate

export default async function BlogListingPage() { 
  let initialPosts: BlogPost[] = [];
  let initialLastDate: string | null = null;

  try {
    // To avoid requiring a composite index in Firestore for status + createdAt,
    // we query by status, and sort in memory. 
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'approved')
    );

    const querySnapshot = await getDocs(q);
    const allApprovedPosts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
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
    });

    // Sort descending by createdAt
    allApprovedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Take the first 6
    initialPosts = allApprovedPosts.slice(0, 6);

    if (initialPosts.length > 0) {
      initialLastDate = initialPosts[initialPosts.length - 1].createdAt;
    }
  } catch (error) {
    console.error("Error fetching initial blog posts:", error);
  }

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow"><span className="eyebrow-line"/> Field notes from Sri Lanka</p>
          <h1>Stories from<br/><i>the wild.</i></h1>
          <p className="hero-copy">A community journal for curious travelers, devoted naturalists, and everyone who feels most at home under an open sky.</p>
          <a href="#stories" className="outline-button">Explore the stories <ArrowRight size={16}/></a>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1200&q=85" alt="Elephant walking through a Sri Lankan landscape"/>
          <div className="image-caption"><Camera size={14}/> Udawalawe National Park · Sri Lanka</div>
        </div>
      </section>
      <main id="stories" className="listing">
        <div className="section-heading">
          <div><p className="eyebrow">The journal</p><h2>Latest stories</h2></div>
          <div className="filters">
            <button className="filter active">All stories</button>
            <button className="filter">Wildlife</button>
            <button className="filter">Travel tips</button>
            <button className="filter">Conservation</button>
          </div>
        </div>
        <div className="post-grid">
          {initialPosts.length > 0 ? (
            <>
              {initialPosts.map(post => <BlogCard key={post.id} post={post} />)}
              <LoadMore initialLastDate={initialLastDate} />
            </>
          ) : (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No stories published yet.
            </div>
          )}
        </div>
        <div className="join-banner">
          <div>
            <p className="eyebrow">Your turn</p>
            <h3>Seen something<br/><i>worth sharing?</i></h3>
          </div>
          <p>Every story helps us see this place a little more clearly. Share your field notes with the community.</p>
          <Link href="/blog/new" className="dark-button !inline-flex items-center gap-2">Share a story <ArrowRight size={16}/></Link>
        </div>
      </main>
    </>
  ) 
}
