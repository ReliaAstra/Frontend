import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ComparisonContent } from './comparison-content';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { COMPARISONS, getComparison } from '@/lib/comparison-data';

export async function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = getComparison(slug);
  if (!data) return { title: 'Comparison Not Found' };

  const url = absoluteUrl(`/compare/${slug}`);
  const title = `Reliastra vs ${data.competitor}: An Honest Comparison`;

  return {
    title: `Reliastra vs ${data.competitor}`,
    description: data.description,
    keywords: [
      `Reliastra vs ${data.competitor}`,
      `${data.competitor} alternative`,
      `${data.competitor} comparison`,
      'vendor SLA monitoring',
      'SLA evidence',
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: data.description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description: data.description },
  };
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getComparison(slug);
  if (!data) notFound();

  const url = absoluteUrl(`/compare/${slug}`);
  const title = `Reliastra vs ${data.competitor}: An Honest Comparison`;

  const others = COMPARISONS.filter((c) => c.slug !== slug);

  const jsonLd = graph(
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description: data.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en',
      about: [
        {
          '@type': 'SoftwareApplication',
          name: 'Reliastra',
          applicationCategory: 'BusinessApplication',
          url: SITE_URL,
          description:
            'Independent monitoring of third-party vendor APIs with timestamped SLA evidence generation.',
        },
        {
          '@type': 'SoftwareApplication',
          name: data.competitor,
          applicationCategory: 'BusinessApplication',
          url: data.competitorUrl,
          description: data.competitorCategory,
        },
      ],
      mentions: [
        { '@type': 'SoftwareApplication', name: 'Reliastra', url: SITE_URL },
        { '@type': 'SoftwareApplication', name: data.competitor, url: data.competitorUrl },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: data.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Compare', item: absoluteUrl('/compare') },
        { '@type': 'ListItem', position: 3, name: `Reliastra vs ${data.competitor}`, item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="comparison-jsonld" />
      <ComparisonContent data={data} />

      {/* Server-rendered FAQ, matching the FAQPage schema */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[760px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
            Questions
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#09090B]">
            Reliastra vs {data.competitor}, answered.
          </h2>
          <dl className="mt-10 divide-y divide-[#F0F0F0]">
            {data.faqs.map((faq) => (
              <div key={faq.q} className="py-7 first:pt-0">
                <dt className="text-[17px] font-semibold leading-snug text-[#09090B]">{faq.q}</dt>
                <dd className="mt-3 leading-relaxed text-[#52525B]">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Other comparisons */}
      <section className="border-t border-[#F0F0F0] px-6 pb-28 pt-16 md:px-12">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">
            Other comparisons
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/compare/${other.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-[14px] border border-[#E4E4E7] bg-white px-5 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0891B2]/30 hover:shadow-[0_6px_20px_rgba(8,145,178,0.07)]"
                >
                  <span className="text-sm font-semibold text-[#09090B]">
                    vs {other.competitor}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-[#D4D4D8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]"
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
