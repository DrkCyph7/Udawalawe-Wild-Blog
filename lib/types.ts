export type BlogPost = {
  id: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  isAnonymous: boolean;
  visibility: 'public' | 'private';
  title: string;
  body: string;
  images: string[];
  tags: string[];
  featured?: boolean;
  type: 'Blog Post' | 'Review';
  rating?: number;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  likes: number;
  likedBy: string[];
  reportCount: number;
  reportedBy: string[];
  pendingEdit?: {
    title: string;
    body: string;
    images: string[];
    submittedAt: string;
  } | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  email?: string;
  bio: string;
  photoURL: string | null;
  postCount: number;
  postsToday?: number;
  lastPostDate?: string;
  createdAt?: string;
};
