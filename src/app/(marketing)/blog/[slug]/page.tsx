import { Metadata } from 'next';
import { blogPosts } from '@/lib/blog-data';
import { BlogPostContent } from './blog-post-content';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post Not Found | Reliastra' };
  return {
    title: `${post.title} | Reliastra Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug);

  return (
    <main className="min-h-screen bg-white">
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
    </main>
  );
}
