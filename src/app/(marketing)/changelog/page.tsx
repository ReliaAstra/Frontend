import { Metadata } from 'next';
import { ChangelogContent } from './changelog-content';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { changelogEntries } from '@/lib/changelog-data';

const title = 'Changelog — Every Reliastra Release, Documented';
const description =
  "Release notes for Reliastra: monitoring intervals, incident correlation, evidence report generation and everything else we've shipped. Subscribe via Atom feed.";

export const metadata: Metadata = {
  title: `${title} | ${SITE_NAME}`,
  description,
  alternates: {
    canonical: absoluteUrl('/changelog'),
    types: { 'application/atom+xml': [{ url: absoluteUrl('/changelog/feed.xml'), title: `${SITE_NAME} Changelog` }] },
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/changelog'),
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ChangelogPage() {
  const jsonLd = graph({
    '@type': 'WebPage',
    '@id': `${SITE_URL}/changelog#webpage`,
    url: absoluteUrl('/changelog'),
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: changelogEntries.slice(0, 20).map((entry, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: `${entry.version} — ${entry.title}`,
          datePublished: entry.date,
          abstract: entry.description,
        },
      })),
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <JsonLd data={jsonLd} id="changelog-jsonld" />
      <ChangelogContent />
    </main>
  );
}
