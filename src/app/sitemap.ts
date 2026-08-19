import type { MetadataRoute } from 'next';

const baseUrl = 'https://reliastra.com';
const partnerBaseUrl = 'https://partners.reliastra.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/track`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${partnerBaseUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${partnerBaseUrl}/earn`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${partnerBaseUrl}/how-it-works`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${partnerBaseUrl}/commission`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${partnerBaseUrl}/resources`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${partnerBaseUrl}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${partnerBaseUrl}/apply`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];
}
