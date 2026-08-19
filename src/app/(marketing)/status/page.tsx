import { Metadata } from 'next';
import { StatusContent } from './status-content';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

const title = 'System Status';
const description =
  'Live status of Reliastra monitoring infrastructure, with 90-day observed availability for every public component and a full incident history.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl('/status') },
  openGraph: {
    title: `${title} — ${SITE_NAME}`,
    description,
    url: absoluteUrl('/status'),
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} — ${SITE_NAME}`,
    description,
  },
};

export default function StatusPage() {
  const jsonLd = graph(
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/status#webpage`,
      url: absoluteUrl('/status'),
      name: `${title} — ${SITE_NAME}`,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      primaryImageOfPage: { '@id': `${SITE_URL}/status#og` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Status', item: absoluteUrl('/status') },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="status-jsonld" />
      <StatusContent />
    </main>
  );
}
