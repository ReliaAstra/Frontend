'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/lib/blog-data';

export function BlogContent({ posts }: { posts: BlogPost[] }) {
  const categoryColors: Record<string, string> = {
    Engineering: 'bg-cyan-50 text-cyan-700',
    Insight: 'bg-violet-50 text-violet-700',
    Guide: 'bg-amber-50 text-amber-700',
  };

  return (
    <>
      {/* Header */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" variant="secondary">Blog</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">
              Reliastra Blog
            </h1>
            <p className="mt-4 text-lg text-[#52525B] max-w-2xl mx-auto">
              Engineering insights, reliability guides, and independent vendor analysis.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link href={`/blog/${post.slug}`} className="group block">
                  <article className="rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Gradient placeholder image */}
                    <div className={`h-48 bg-gradient-to-br ${post.gradient}`} />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className={categoryColors[post.category] ?? ''}
                        >
                          {post.category}
                        </Badge>
                      </div>
                      <h2 className="text-lg font-semibold text-[#09090B] group-hover:text-[#0891B2] transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-[#52525B] line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-[#A1A1AA]">
                        <span>{post.date}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readTime}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
