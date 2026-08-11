'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Twitter, Linkedin, Link2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/lib/blog-data';
import { toast } from 'sonner';

const categoryColors: Record<string, string> = {
  Engineering: 'bg-cyan-50 text-cyan-700',
  Insight: 'bg-violet-50 text-violet-700',
  Guide: 'bg-amber-50 text-amber-700',
};

export function BlogPostContent({ post, relatedPosts }: { post: BlogPost; relatedPosts: BlogPost[] }) {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[#52525B] hover:text-[#0891B2] transition-colors mb-6">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
            <Badge variant="secondary" className={categoryColors[post.category] ?? ''}>
              {post.category}
            </Badge>
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-4 text-lg text-[#52525B]">{post.excerpt}</p>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-[#0891B2] text-white flex items-center justify-center text-sm font-semibold">
                {post.author.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#09090B]">{post.author.name}</p>
                <p className="text-xs text-[#52525B]">{post.author.title} · {post.date}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="prose prose-slate max-w-none">
            {post.content.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-[#09090B] text-base leading-relaxed mb-6"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Share Buttons */}
          <div className="mt-10 pt-8 border-t border-[#E4E4E7] flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[#52525B] mr-2">Share:</span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2"
              onClick={() => toast.info('Twitter sharing coming soon.')}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2"
              onClick={() => toast.info('LinkedIn sharing coming soon.')}
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg gap-2"
              onClick={handleCopyLink}
            >
              <Link2 className="h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-2xl font-bold text-[#09090B] mb-8">Related Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedPosts.map((rp) => (
              <Link key={rp.slug} href={`/blog/${rp.slug}`} className="group block">
                <article className="rounded-xl border border-[#E4E4E7] overflow-hidden hover:shadow-md transition-shadow flex flex-col sm:flex-row">
                  <div className={`h-32 sm:h-auto sm:w-48 shrink-0 bg-gradient-to-br ${rp.gradient}`} />
                  <div className="p-5 flex flex-col justify-center">
                    <Badge variant="secondary" className={`w-fit mb-2 text-xs ${categoryColors[rp.category] ?? ''}`}>
                      {rp.category}
                    </Badge>
                    <h3 className="text-base font-semibold text-[#09090B] group-hover:text-[#0891B2] transition-colors line-clamp-2">
                      {rp.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-[#A1A1AA]">
                      <span>{rp.date}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {rp.readTime}
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
