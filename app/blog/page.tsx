import Link from 'next/link';
import { Star, Calendar, User } from 'lucide-react';

const MOCK_POSTS = [
  {
    id: '1',
    title: 'The Majestic Elephants of Udawalawe',
    author: 'Sarah Jenkins',
    type: 'Blog Post',
    excerpt: 'An unforgettable encounter with a herd of wild elephants during our morning safari...',
    date: 'Oct 12, 2026',
    image: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '2',
    title: 'Incredible Safari Experience!',
    author: 'Mark T.',
    type: 'Review',
    rating: 5,
    excerpt: 'The guide was incredibly knowledgeable and we saw so many animals. Highly recommend booking a private tour.',
    date: 'Oct 10, 2026',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '3',
    title: 'Best Time to Visit the Park',
    author: 'Udawalawe Guide',
    type: 'Blog Post',
    excerpt: 'Planning your trip? Here is everything you need to know about the seasons in Udawalawe National Park.',
    date: 'Sep 28, 2026',
    image: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: '4',
    title: 'A beautiful morning out',
    author: 'Emma R.',
    type: 'Review',
    rating: 4,
    excerpt: 'We loved the scenery and the peacocks were beautiful. Wish we saw a leopard, but still a great time!',
    date: 'Sep 15, 2026',
    image: 'https://images.unsplash.com/photo-1534143058866-231a4f00bb29?auto=format&fit=crop&q=80&w=800',
  }
];

export default function BlogListingPage() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Header section */}
      <div className="bg-emerald-900 text-stone-50 py-16 px-6 sm:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Stories & Reviews</h1>
            <p className="text-emerald-100 text-lg max-w-xl">
              Discover tales of the wild and read experiences from fellow adventurers who have explored Udawalawe with us.
            </p>
          </div>
          <div>
            <Link 
              href="/blog/new" 
              className="inline-flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold px-6 py-3 rounded-md transition-colors shadow-sm"
            >
              Write a Review
            </Link>
          </div>
        </div>
      </div>

      {/* Grid section */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
          {MOCK_POSTS.map((post) => (
            <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-200 flex flex-col">
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  {post.type}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/blog/${post.id}`} className="block mb-2 group">
                  <h2 className="text-2xl font-serif font-bold text-stone-800 group-hover:text-emerald-700 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                {post.type === 'Review' && post.rating && (
                  <div className="flex items-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < post.rating! ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} 
                      />
                    ))}
                  </div>
                )}

                <p className="text-stone-600 mb-6 flex-grow">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between text-sm text-stone-500 border-t border-stone-100 pt-4 mt-auto">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
