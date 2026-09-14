export type PostType = 'Blog Post' | 'Review';
export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  title: string;
  body: string; // Rich text or markdown content
  images: string[]; // Array of image URLs
  type: PostType;
  rating?: number; // Only for reviews (1-5 stars)
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  lastPostAt?: Date;
}
