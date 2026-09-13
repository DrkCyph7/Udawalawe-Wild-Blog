import Link from 'next/link';
import { Check, X, Eye, Image as ImageIcon } from 'lucide-react';

export default function AdminBlogQueuePage() {
  const MOCK_QUEUE = [
    {
      id: 'sub_1',
      title: 'A morning with the elephants',
      author: 'Jane Doe',
      type: 'Blog Post',
      rating: null,
      thumbnail: 'https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&q=80&w=150',
      date: 'Oct 13, 2026',
    },
    {
      id: 'sub_2',
      title: 'Excellent Guide and Experience',
      author: 'Michael T.',
      type: 'Review',
      rating: 5,
      thumbnail: null,
      date: 'Oct 13, 2026',
    },
    {
      id: 'sub_3',
      title: 'Too many jeeps, but saw peacocks',
      author: 'Angry Tourist',
      type: 'Review',
      rating: 2,
      thumbnail: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=150',
      date: 'Oct 12, 2026',
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white py-8 px-6 sm:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-stone-400 text-sm mt-1">Manage incoming stories and reviews</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
              {MOCK_QUEUE.length} Pending
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-12 lg:px-24 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-stone-800">Moderation Queue</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4">Submission</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {MOCK_QUEUE.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-4">
                      {item.thumbnail ? (
                        <img 
                          src={item.thumbnail} 
                          alt="Thumbnail" 
                          className="w-12 h-12 rounded object-cover border border-stone-200" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-stone-100 flex items-center justify-center border border-stone-200 text-stone-400">
                          <ImageIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-stone-900 text-base">{item.title}</p>
                        {item.type === 'Review' && (
                          <p className="text-xs text-amber-500 font-medium mt-1">
                            {item.rating} / 5 Stars
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{item.author}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.type === 'Review' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{item.date}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button className="inline-flex items-center p-2 text-stone-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center p-2 text-emerald-600 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded transition-colors" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center p-2 text-red-600 hover:text-white hover:bg-red-600 bg-red-50 rounded transition-colors" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {MOCK_QUEUE.length === 0 && (
            <div className="py-12 text-center text-stone-500">
              No pending submissions in the queue.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
