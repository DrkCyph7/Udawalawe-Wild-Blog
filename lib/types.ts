export type BlogPost = {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  body: string;
  images: string[];
  type: 'Blog Post' | 'Review';
  rating?: number;
  status: 'pending' | 'approved';
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
};
