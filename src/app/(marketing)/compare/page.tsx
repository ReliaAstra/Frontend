import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { COMPARISONS } from '@/lib/comparison-data';

const title = 'Compare Reliastra to Monitoring and Status Tools';
const description =
  'Honest, side-by-side comparisons of Reliastra against Datadog, Statuspage, UptimeRobot and Pingdom — including where each competitor is genuinely stronger.';

const url = absoluteUrl('/compare');

export const metadata: Metadata = {
  title: 'Compare',
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

export default function ComparePage() {
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
        itemListElement: COMPARISONS.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: `Reliastra vs ${c.competitor}`,
          url: absoluteUrl(`/compare/${c.slug}`),
        })),
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="compare-index-jsonld" />

      <section
        className="px-6 pb-14 pt-20 md:px-12 md:pt-28"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(8,145,178,0.05) 0%, transparent 100%)',
        }}
      >
        <div className="mx-auto max-w-[1000px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
            Compare
          </p>
          <h1 className="max-w-3xl text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#09090B] sm:text-[54px]">
            How Reliastra compares.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-[#52525B]">
            Each comparison starts with what the other product does better. Reliastra is a narrow
            tool — independent vendor measurement and SLA evidence — and it does not replace a
            full observability platform or a status page.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-5 sm:grid-cols-2">
          {COMPARISONS.map((c) => (
            <Link
              key={c.slug}
              href={`/compare/${c.slug}`}
              className="group flex flex-col rounded-[20px] border border-[#E4E4E7] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#0891B2]/30 hover:shadow-[0_10px_32px_rgba(8,145,178,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight text-[#09090B]">
                  Reliastra <span className="font-normal text-[#A1A1AA]">vs</span>{' '}
                  <span className="text-[#0891B2]">{c.competitor}</span>
                </h2>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-[#D4D4D8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">
                {c.competitorCategory}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-[#52525B]">{c.positioning}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
