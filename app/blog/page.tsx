import { ArrowRight, Camera } from 'lucide-react'
import { BlogCard } from '@/components/BlogCard'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'
import { SortControl } from '@/components/SortControl'

export const dynamic = 'force-dynamic'

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'newest' } = await searchParams
  let initialPosts: BlogPost[] = []

  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'approved')
    )

    const querySnapshot = await getDocs(q)
    initialPosts = querySnapshot.docs
      .map(d => {
        const data = d.data()
        return {
          id: d.id,
          authorId: data.authorId,
          authorName: data.authorName,
          isAnonymous: data.isAnonymous ?? false,
          visibility: data.visibility ?? 'public',
          title: data.title,
          body: data.body,
          images: data.images || [],
          type: data.type,
          rating: data.rating,
          status: data.status,
          likes: data.likes ?? 0,
          likedBy: data.likedBy ?? [],
          reportCount: data.reportCount ?? 0,
          reportedBy: data.reportedBy ?? [],
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
        } as BlogPost
      })
      // Exclude deleted and private
      .filter(p => p.status !== 'deleted' && p.visibility !== 'private')

    // Sort in memory (avoids needing composite indexes)
    if (sort === 'liked') {
      initialPosts.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0))
    } else if (sort === 'rated') {
      initialPosts = initialPosts.filter(p => p.type === 'Review' && p.rating !== undefined)
      initialPosts.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else {
      initialPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error)
  }

  const featured = initialPosts[0] || null
  const rest = initialPosts.slice(1)

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
          <img src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=1200&q=85" alt="Elephant in Udawalawe"/>
        </div>
      </section>

      <section className="listing" id="stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow"><span className="eyebrow-line"/> Community stories</p>
            <h2>From the <i>field.</i></h2>
          </div>
          <SortControl currentSort={sort} />
        </div>

        <div className="post-grid">
          {initialPosts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-[#768078] font-serif text-lg">No stories yet. Be the first to share!</p>
              <Link href="/blog/new" className="dark-button !inline-flex mt-6">
                Share a story <Camera size={15}/>
              </Link>
            </div>
          ) : (
            initialPosts.map(post => <BlogCard key={post.id} post={post} />)
          )}
        </div>
      </section>

      <section className="join-banner">
        <div>
          <p className="eyebrow"><span className="eyebrow-line"/> Become a contributor</p>
          <h2>Have a story<br/><i>to tell?</i></h2>
        </div>
        <p>Share what you saw. Your field notes help others plan mindful visits and deepen their connection with this extraordinary place.</p>
        <Link href="/blog/new" className="pill-button !inline-flex items-center gap-2">
          Share a story <ArrowRight size={15}/>
        </Link>
      </section>
    </>
  )
}
