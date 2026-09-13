'use client';

import { useState } from 'react';
import { BlogPost } from '@/lib/types';
import { BlogCard } from './BlogCard';
import { collection, query, where, orderBy, startAfter, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  initialLastDate: string | null;
}

export function LoadMore({ initialLastDate }: LoadMoreProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [lastDate, setLastDate] = useState<string | null>(initialLastDate);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(!!initialLastDate);

  const loadMorePosts = async () => {
    if (!lastDate || loading || !hasMore) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        startAfter(Timestamp.fromDate(new Date(lastDate))),
        limit(6)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        return;
      }

      const newPosts: BlogPost[] = querySnapshot.docs.map(doc => {
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

      setPosts(prev => [...prev, ...newPosts]);
      
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1].data().createdAt;
      if (lastVisible) {
        setLastDate(lastVisible.toDate().toISOString());
      }
      
      if (querySnapshot.docs.length < 6) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMore && posts.length === 0) return null;

  return (
    <>
      {posts.map(post => (
        <BlogCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div className="col-span-full flex justify-center mt-8">
          <button 
            onClick={loadMorePosts}
            disabled={loading}
            className="outline-button flex items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : null}
            {loading ? 'Loading...' : 'Load older stories'}
          </button>
        </div>
      )}
    </>
  );
}
