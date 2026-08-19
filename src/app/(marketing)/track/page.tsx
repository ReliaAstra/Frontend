import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { TrackPageContent } from './track-page-content';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { VENDOR_CATALOG } from '@/lib/vendor-catalog';

const title = 'Vendor Intelligence: Independent Reliability Tracking';
const description =
  'Independent reliability tracking for the third-party APIs your infrastructure depends on. Observed uptime, response latency and incident history for every monitored vendor.';

const url = absoluteUrl('/track');

export const metadata: Metadata = {
  title: 'Vendor Intelligence',
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function TrackPage() {
  const jsonLd = graph(
    {
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      mainEntity: {
        '@type': 'ItemList',
        name: 'Monitored vendors',
        itemListElement: VENDOR_CATALOG.map((v, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: v.name,
          url: absoluteUrl(`/track/${v.slug}`),
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Vendor Intelligence', item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-[#0A0A0F] pt-[72px]">
      <JsonLd data={jsonLd} id="track-jsonld" />
      <TrackPageContent />

      {/* Server-rendered directory: every vendor profile is crawlable without JS */}
      <section
        className="border-t border-[rgba(255,255,255,0.06)] px-5 py-16 sm:px-6 lg:px-8"
        aria-labelledby="vendor-directory-heading"
      >
        <div className="mx-auto max-w-[1120px]">
          <h2
            id="vendor-directory-heading"
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]"
          >
            Vendor directory
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#71717A]">
            Every tracked vendor has a public reliability profile with 90-day observed availability,
            latency history and recorded incidents.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {VENDOR_CATALOG.map((vendor) => (
              <li key={vendor.slug}>
                <Link
                  href={`/track/${vendor.slug}`}
                  className="group flex items-center gap-3 rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[#0F0F14] p-4 transition-all duration-200 hover:border-[rgba(8,145,178,0.35)] hover:bg-[#131318]"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-xs font-bold"
                    style={{
                      backgroundColor: `${vendor.color}1F`,
                      color: vendor.color,
                      border: `1px solid ${vendor.color}33`,
                    }}
                  >
                    {vendor.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#FAFAFA]">
                      {vendor.name}
                    </span>
                    <span className="block truncate text-xs capitalize text-[#52525B]">
                      {vendor.category}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[#3F3F46] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
