'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, UploadCloud, Star, ArrowLeft } from 'lucide-react';

export default function NewPostPage() {
  const [postType, setPostType] = useState<'Blog Post' | 'Review'>('Blog Post');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-6 sm:px-12 lg:px-24 font-sans text-stone-900">
      <div className="max-w-3xl mx-auto">
        <Link href="/blog" className="inline-flex items-center text-stone-500 hover:text-stone-900 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Stories
        </Link>
        
        <h1 className="text-4xl font-serif font-bold mb-8">Share Your Experience</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8">
          <form className="space-y-8" action="#" method="POST" onSubmit={(e) => e.preventDefault()}>
            
            {/* Post Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Type of Post</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setPostType('Blog Post')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors font-medium ${
                    postType === 'Blog Post' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800' 
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  Blog Post
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('Review')}
                  className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors font-medium ${
                    postType === 'Review' 
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800' 
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                  }`}
                >
                  Review
                </button>
              </div>
            </div>

            {/* Rating (Conditional) */}
            {postType === 'Review' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-medium text-stone-700 mb-3">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star 
                        className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-100'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Give your story a catchy title"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-stone-900"
              />
            </div>

            {/* Rich Text Editor Placeholder */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Story
              </label>
              <div className="border border-stone-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
                {/* Toolbar */}
                <div className="bg-stone-50 border-b border-stone-300 px-4 py-2 flex items-center gap-2">
                  <button type="button" className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                  <button type="button" className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                  <div className="w-px h-5 bg-stone-300 mx-1"></div>
                  <button type="button" className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"><List className="w-4 h-4" /></button>
                  <button type="button" className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"><LinkIcon className="w-4 h-4" /></button>
                  <div className="w-px h-5 bg-stone-300 mx-1"></div>
                  <button type="button" className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded transition-colors"><ImageIcon className="w-4 h-4" /></button>
                </div>
                {/* Text Area */}
                <textarea
                  rows={8}
                  placeholder="Share your experience..."
                  className="w-full px-4 py-3 resize-y focus:outline-none text-stone-900 border-none"
                />
              </div>
            </div>

            {/* Image Upload Dropzone */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Add Photos (up to 5)
              </label>
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-10 flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 hover:border-emerald-400 transition-colors cursor-pointer bg-white">
                <UploadCloud className="w-10 h-10 mb-3 text-stone-400" />
                <p className="font-medium text-stone-700">Click to upload or drag and drop</p>
                <p className="text-sm mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-stone-200 flex justify-end gap-4">
              <Link
                href="/blog"
                className="px-6 py-3 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-6 py-3 rounded-lg bg-emerald-800 text-white hover:bg-emerald-900 font-medium transition-colors shadow-sm"
              >
                Submit for Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
