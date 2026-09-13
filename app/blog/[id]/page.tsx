import Link from 'next/link';
import { Star, Calendar, User, ArrowLeft } from 'lucide-react';

export default function PostDetailPage() {
  // Mock data representing a single post fetch based on the [id]
  const post = {
    id: '1',
    title: 'The Majestic Elephants of Udawalawe',
    author: 'Sarah Jenkins',
    type: 'Review',
    rating: 5,
    date: 'Oct 12, 2026',
    coverImage: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80&w=1200',
    gallery: [
      'https://images.unsplash.com/photo-1534143058866-231a4f00bb29?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?auto=format&fit=crop&q=80&w=600'
    ]
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24">
      {/* Cover Image Header */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-stone-900">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-6 left-6 md:left-12">
          <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Stories
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full px-6 md:px-12 pb-12">
          <div className="max-w-4xl mx-auto text-white">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-amber-500 text-amber-950 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {post.type}
              </span>
              {post.type === 'Review' && post.rating && (
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < post.rating! ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} 
                    />
                  ))}
                </div>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-stone-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium text-stone-100">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-stone prose-lg md:prose-xl max-w-none mb-16">
          <p>
            Visiting Udawalawe National Park was an absolute dream. From the moment we entered the park gates in our open-top safari jeep, the raw beauty of the Sri Lankan wilderness took my breath away. Our guide, an expert tracker who seemed to know every rustle in the bushes, made the experience unforgettable.
          </p>
          <p>
            We hadn't been driving for more than twenty minutes when we encountered our first herd of elephants. They were peacefully grazing by the reservoir, completely undisturbed by our presence. Watching a mother elephant protectively guide her calf through the tall grass is a memory I will cherish forever.
          </p>
          <h3 className="text-3xl font-serif font-bold mt-10 mb-6 text-stone-800">The Birdlife and Landscape</h3>
          <p>
            While the elephants are undoubtedly the main attraction, the birdlife in Udawalawe is equally spectacular. We spotted painted storks, majestic crested serpent eagles, and the vibrant flash of a kingfisher diving for its morning meal. The landscape itself, with its dead trees rising eerily from the reservoir against the backdrop of the misty mountains, felt almost prehistoric.
          </p>
          <p>
            If you are planning a trip to Sri Lanka, booking a private safari at Udawalawe is a must. The peace, the conservation efforts, and the sheer volume of wildlife make it a world-class destination for any nature lover.
          </p>
        </div>

        {/* Gallery */}
        <h3 className="text-2xl font-serif font-bold mb-6 text-stone-800 border-b border-stone-200 pb-4">Gallery from the Trip</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {post.gallery.map((img, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-lg bg-stone-200">
              <img 
                src={img} 
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
