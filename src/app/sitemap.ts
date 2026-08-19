import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { VENDOR_SLUGS } from '@/lib/vendor-catalog';
import { COMPARISON_SLUGS } from '@/lib/comparison-data';
import { CONCEPT_SLUGS } from '@/lib/concepts-data';
import { blogPosts } from '@/lib/blog-data';

type Entry = MetadataRoute.Sitemap[number];

const now = new Date();

function entry(
  path: string,
  changeFrequency: Entry['changeFrequency'],
  priority: number,
  lastModified: Date = now,
): Entry {
  return { url: `${SITE_URL}${path}`, lastModified, changeFrequency, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: Entry[] = [
    entry('/', 'daily', 1.0),
    entry('/pricing', 'weekly', 0.9),
    entry('/tools/sla-credit-calculator', 'weekly', 0.9),
    entry('/compare', 'weekly', 0.8),
    entry('/track', 'hourly', 0.8),
    entry('/status', 'hourly', 0.7),
    entry('/docs/concepts', 'weekly', 0.8),
    entry('/blog', 'weekly', 0.7),
    entry('/changelog', 'weekly', 0.6),
    entry('/about', 'monthly', 0.5),
    entry('/community', 'monthly', 0.4),
    entry('/investors', 'monthly', 0.4),
    entry('/contact', 'monthly', 0.5),
    entry('/partner', 'monthly', 0.5),
    entry('/privacy', 'yearly', 0.3),
    entry('/terms', 'yearly', 0.3),
    entry('/guarantee', 'yearly', 0.3),
  ];

  const comparePages: Entry[] = COMPARISON_SLUGS.map((slug) =>
    entry(`/compare/${slug}`, 'weekly', 0.8),
  );

  const vendorPages: Entry[] = VENDOR_SLUGS.map((slug) =>
    entry(`/track/${slug}`, 'hourly', 0.7),
  );

  const conceptPages: Entry[] = CONCEPT_SLUGS.map((slug) =>
    entry(`/docs/concepts/${slug}`, 'monthly', 0.7),
  );

  const blogPages: Entry[] = blogPosts.map((post) =>
    entry(`/blog/${post.slug}`, 'monthly', 0.6, new Date(post.date)),
  );

  return [...staticPages, ...comparePages, ...vendorPages, ...conceptPages, ...blogPages];
}
