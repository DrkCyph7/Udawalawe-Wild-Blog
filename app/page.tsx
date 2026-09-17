import { ArrowRight, Camera } from 'lucide-react'
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'
import Link from 'next/link'
import { FilteredPostListing } from '@/components/FilteredPostListing'
import { StatsBar } from '@/components/StatsBar'
import { FeaturedPostCard } from '@/components/FeaturedPostCard'

export const dynamic = 'force-dynamic'

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'newest' } = await searchParams
  let initialPosts: BlogPost[] = []
  let totalApprovedCount = 0;

  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'approved'),
      where('visibility', '==', 'public')
    )

    try {
      const countSnapshot = await getCountFromServer(q);
      totalApprovedCount = countSnapshot.data().count;
    } catch (e) {
      console.warn('Count query failed, falling back to array length', e);
    }

    const querySnapshot = await getDocs(q)
    initialPosts = querySnapshot.docs
      .map(d => {
        const data = d.data()
        return {
          id: d.id,
          authorId: data.authorId,
          authorName: data.authorName,
          authorPhotoURL: data.authorPhotoURL || null,
          isAnonymous: data.isAnonymous ?? false,
          visibility: data.visibility ?? 'public',
          title: data.title,
          body: data.body,
          images: data.images || [],
          tags: data.tags || [],
          featured: data.featured ?? false,
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

    if (!totalApprovedCount) {
      totalApprovedCount = initialPosts.length;
    }

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

  // We compute distinct contributors and categories from the fetched documents
  // because Firestore does not support count(distinct) aggregations.
  const uniqueContributors = new Set(initialPosts.map(p => p.authorId).filter(Boolean)).size;
  const uniqueCategories = new Set(initialPosts.flatMap(p => p.tags || [])).size;

  // Find the featured post. Sort by newest first to get the most recent explicitly featured post.
  const newestFirst = [...initialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const explicitFeatured = newestFirst.find(p => p.featured);
  
  // If there are > 3 posts and no explicit featured post, fall back to the newest one as featured. 
  // If < 3, omit it to avoid a sparse regular grid.
  const featuredPost = explicitFeatured || (initialPosts.length >= 3 ? newestFirst[0] : null);

  const restPosts = featuredPost 
    ? initialPosts.filter(p => p.id !== featuredPost.id)
    : initialPosts;

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Udawalawe Wild — Stories from the Wild',
    description: 'A community journal for curious travelers, devoted naturalists, and everyone who feels at home under an open sky.',
    url: 'https://udawalawe-wild-blog.vercel.app/'
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <section className="hero">
        <div>
          <p className="eyebrow"><span className="eyebrow-line"/> Field notes from Sri Lanka</p>
          <h1>Stories from<br/><i>the wild.</i></h1>
          <p className="hero-copy">A community journal for curious travelers, devoted naturalists, and everyone who feels most at home under an open sky.</p>
          <a href="#stories" className="outline-button">Explore the stories <ArrowRight size={16}/></a>
        </div>
        <div className="hero-image">
          <img src="/blog/home-hero.png" alt="Elephant in Udawalawe"/>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <StatsBar 
          stories={totalApprovedCount} 
          contributors={uniqueContributors} 
          categories={uniqueCategories} 
        />
      </div>

      <section className="listing" id="stories">
        {featuredPost && (
          <div className="mb-16">
            <FeaturedPostCard post={featuredPost} />
          </div>
        )}
        <FilteredPostListing
          initialPosts={restPosts}
          currentSort={sort}
          headerLeft={
            <div>
              <p className="eyebrow"><span className="eyebrow-line"/> Community stories</p>
              <h2>From the <i>field.</i></h2>
            </div>
          }
          emptyStateNoPosts={
            <div className="col-span-full py-20 text-center">
              <p className="text-[#768078] font-serif text-lg">No stories yet. Be the first to share!</p>
              <Link href="/new" className="dark-button !inline-flex mt-6">
                Share a story <Camera size={15}/>
              </Link>
            </div>
          }
        />
      </section>

      <section className="join-banner">
        <div>
          <p className="eyebrow"><span className="eyebrow-line"/> Become a contributor</p>
          <h2>Have a story<br/><i>to tell?</i></h2>
        </div>
        <p>Share what you saw. Your field notes help others plan mindful visits and deepen their connection with this extraordinary place.</p>
        <Link href="/new" className="pill-button !inline-flex items-center gap-2">
          Share a story <ArrowRight size={15}/>
        </Link>
      </section>
    </>
  )
}
