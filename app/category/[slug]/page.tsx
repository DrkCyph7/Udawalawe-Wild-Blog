import { Camera } from 'lucide-react'
import { BlogCard } from '@/components/BlogCard'
import Link from 'next/link'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { BlogPost } from '@/lib/types'
import { FilteredPostListing } from '@/components/FilteredPostListing'
import { AVAILABLE_TAGS } from '@/lib/constants/categories'
import { redirect } from 'next/navigation'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const dynamic = 'force-dynamic'

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const searchParams = await props.searchParams
  const params = await props.params
  
  const { slug } = params
  const { sort = 'newest' } = searchParams

  const category = AVAILABLE_TAGS.find(t => t.slug === slug)
  if (!category) {
    redirect('/')
  }

  let initialPosts: BlogPost[] = []
  try {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'approved'),
      where('visibility', '==', 'public'),
      where('tags', 'array-contains', slug)
    )

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
    console.error(`Error fetching posts for category ${slug}:`, error)
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://udawalawe-wild-blog.vercel.app/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://udawalawe-wild-blog.vercel.app/' },
      { '@type': 'ListItem', position: 3, name: category.label, item: `https://udawalawe-wild-blog.vercel.app/category/${slug}` }
    ]
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-8">
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
            <BreadcrumbItem>
              <BreadcrumbPage>{category.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <section className="listing pt-8 lg:pt-12" id="stories">
        <FilteredPostListing
          initialPosts={initialPosts}
          currentSort={sort}
          headerLeft={
            <div>
              <p className="eyebrow"><span className="eyebrow-line"/> Category</p>
              <h2>{category.label} <i>({initialPosts.length})</i></h2>
            </div>
          }
          emptyStateNoPosts={
            <div className="col-span-full py-20 text-center flex flex-col items-center">
              <p className="text-[#768078] font-serif text-lg mb-2">No stories tagged <strong>{category.label}</strong> yet — be the first to share one!</p>
              <Link href="/new" className="dark-button !inline-flex mt-6 items-center gap-2">
                Share a story <Camera size={15}/>
              </Link>
            </div>
          }
        />
      </section>
    </main>
  )
}
