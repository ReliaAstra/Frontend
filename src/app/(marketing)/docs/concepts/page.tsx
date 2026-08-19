import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Clock } from 'lucide-react';
import { JsonLd, graph } from '@/components/JsonLd';
import { ConceptSidebar } from '@/components/docs/ConceptSidebar';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { CONCEPTS_ORDERED } from '@/lib/concepts-data';

const title = 'Concepts: Vendor SLA Tracking, Credits and Correlation';
const description =
  'Reference documentation on vendor reliability: what SLA tracking measures, how to claim service credits, and how multi-region outage correlation separates a vendor failure from a local fault.';

const url = absoluteUrl('/docs/concepts');

export const metadata: Metadata = {
  title: 'Concepts',
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ConceptsIndexPage() {
  const jsonLd = graph(
    {
      '@type': 'CollectionPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      hasPart: CONCEPTS_ORDERED.map((c) => ({
        '@type': 'TechArticle',
        headline: c.title,
        url: absoluteUrl(`/docs/concepts/${c.slug}`),
        description: c.description,
        datePublished: c.datePublished,
        dateModified: c.dateModified,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="concepts-index-jsonld" />

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
          <aside>
            <ConceptSidebar />
          </aside>

          <div className="min-w-0 max-w-[760px]">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              Concepts
            </p>
            <h1 className="text-[36px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#09090B] sm:text-[46px]">
              Vendor reliability, explained.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#52525B]">
              Reference material on measuring third-party dependencies, claiming what a broken
              commitment entitles you to, and telling a real outage apart from a local fault.
              Written to be useful whether or not you use Reliastra.
            </p>

            <ul className="mt-12 space-y-4">
              {CONCEPTS_ORDERED.map((concept) => (
                <li key={concept.slug}>
                  <Link
                    href={`/docs/concepts/${concept.slug}`}
                    className="group block rounded-[18px] border border-[#E4E4E7] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#0891B2]/30 hover:shadow-[0_10px_32px_rgba(8,145,178,0.08)] sm:p-7"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-semibold tracking-tight text-[#09090B]">
                        {concept.title}
                      </h2>
                      <ArrowUpRight
                        className="h-5 w-5 shrink-0 text-[#D4D4D8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#52525B]">
                      {concept.tldr}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-[#A1A1AA]">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {concept.readTime}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
