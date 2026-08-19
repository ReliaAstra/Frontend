import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import { JsonLd, graph } from '@/components/JsonLd';
import { ConceptSidebar } from '@/components/docs/ConceptSidebar';
import { ConceptBlocks } from '@/components/docs/ConceptBlocks';
import { FeedbackWidget } from '@/components/docs/FeedbackWidget';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { CONCEPTS, getConcept } from '@/lib/concepts-data';

export async function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return { title: 'Concept Not Found' };

  const url = absoluteUrl(`/docs/concepts/${slug}`);

  return {
    title: concept.title,
    description: concept.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${concept.title} — ${SITE_NAME} Docs`,
      description: concept.description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: concept.datePublished,
      modifiedTime: concept.dateModified,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${concept.title} — ${SITE_NAME} Docs`,
      description: concept.description,
    },
  };
}

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();

  const url = absoluteUrl(`/docs/concepts/${slug}`);

  // Pull FAQ items out of the block list so the schema stays in sync with the page.
  const faqBlock = concept.blocks.find((b) => b.type === 'faq');
  const faqItems = faqBlock && faqBlock.type === 'faq' ? faqBlock.items : [];

  const related = concept.related
    .map((s) => getConcept(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  const nodes: Record<string, unknown>[] = [
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: concept.title,
      description: concept.description,
      url,
      datePublished: concept.datePublished,
      dateModified: concept.dateModified,
      inLanguage: 'en',
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntityOfPage: url,
      articleSection: 'Concepts',
      abstract: concept.tldr,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Docs', item: absoluteUrl('/docs/concepts') },
        { '@type': 'ListItem', position: 3, name: concept.navLabel, item: url },
      ],
    },
  ];

  if (faqItems.length > 0) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={graph(...nodes)} id="concept-jsonld" />

      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-16">
          {/* Sidebar */}
          <aside>
            <ConceptSidebar />
          </aside>

          {/* Article */}
          <article className="min-w-0 max-w-[720px]">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-7">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-[#A1A1AA]">
                <li>
                  <Link href="/docs/concepts" className="transition-colors hover:text-[#09090B]">
                    Docs
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-[#52525B]">{concept.navLabel}</li>
              </ol>
            </nav>

            {/* Header */}
            <header>
              <h1 className="text-[36px] font-extrabold leading-[1.08] tracking-[-0.03em] text-[#09090B] sm:text-[46px]">
                {concept.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-[#A1A1AA]">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {concept.readTime}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Updated{' '}
                  <time dateTime={concept.dateModified}>
                    {new Date(`${concept.dateModified}T12:00:00Z`).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </time>
                </span>
              </div>
            </header>

            {/* TLDR */}
            <div className="mt-8 rounded-[14px] border border-[#0891B2]/20 bg-[#0891B2]/[0.045] p-5 sm:p-6">
              <div className="flex gap-3.5">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#0891B2]" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#0891B2]">
                    TLDR
                  </p>
                  <p className="mt-2 text-[16px] font-medium leading-relaxed text-[#09090B]">
                    {concept.tldr}
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="mt-12">
              <ConceptBlocks blocks={concept.blocks} />
            </div>

            <FeedbackWidget />

            {/* Related */}
            {related.length > 0 && (
              <section className="mt-14" aria-labelledby="related-heading">
                <h2
                  id="related-heading"
                  className="text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]"
                >
                  Continue reading
                </h2>
                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link
                        href={`/docs/concepts/${r.slug}`}
                        className="group flex h-full flex-col rounded-[14px] border border-[#E4E4E7] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0891B2]/30 hover:shadow-[0_6px_20px_rgba(8,145,178,0.07)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-[15px] font-semibold leading-snug text-[#09090B]">
                            {r.title}
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 shrink-0 text-[#D4D4D8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]"
                            aria-hidden="true"
                          />
                        </div>
                        <span className="mt-2 text-[13px] leading-relaxed text-[#71717A]">
                          {r.tldr}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTA */}
            <section className="relative mt-14 overflow-hidden rounded-[18px] bg-[#0A0A0F] p-8 sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 90% at 10% 0%, rgba(8,145,178,0.20) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <h2 className="text-xl font-semibold tracking-tight text-[#FAFAFA] sm:text-2xl">
                  Put this into practice.
                </h2>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#A1A1AA]">
                  Reliastra records independent, timestamped observations of your dependencies so
                  the evidence exists before you need it.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/register"
                    className="group inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#FAFAFA] px-6 text-sm font-semibold text-[#0A0A0F] transition-all duration-200 hover:shadow-lg"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/tools/sla-credit-calculator"
                    className="inline-flex h-11 items-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.14)] px-6 text-sm font-semibold text-[#FAFAFA] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    SLA credit calculator
                  </Link>
                </div>
              </div>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
