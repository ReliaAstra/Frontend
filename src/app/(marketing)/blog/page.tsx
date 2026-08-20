import { Metadata } from 'next';
import { blogPosts } from '@/lib/blog-data';
import { BlogContent } from './blog-content';

export const metadata: Metadata = {
  title: 'Blog | Reliastra',
  description: 'Engineering insights, reliability guides, and independent vendor analysis from the Reliastra team.',
};

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-white">
      <BlogContent posts={blogPosts} />
    </main>
  );
}
