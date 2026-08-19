import { Metadata } from 'next';
import { ArrowUpRight, Calculator } from 'lucide-react';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';

const title = 'Free Tools for Vendor Reliability';
const description =
  'Free, no-signup tools from Reliastra for working with vendor SLAs — starting with the SLA credit calculator.';

const url = absoluteUrl('/tools');

export const metadata: Metadata = {
  title: 'Tools',
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: SITE_NAME, type: 'website' },
  twitter: { card: 'summary_large_image', title, description },
};

const TOOLS = [
  {
    href: '/tools/sla-credit-calculator',
    icon: Calculator,
    name: 'SLA Credit Calculator',
    body: 'Enter your monthly spend and observed downtime to estimate the service credit owed under a provider\u2019s published schedule.',
    tag: 'Calculator',
  },
];

export default function ToolsPage() {
  const jsonLd = graph({
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    hasPart: TOOLS.map((t) => ({
      '@type': 'WebApplication',
      name: t.name,
      url: absoluteUrl(t.href),
      applicationCategory: 'FinanceApplication',
      isAccessibleForFree: true,
    })),
  });

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="tools-jsonld" />

      <section className="px-6 pb-16 pt-20 md:px-12 md:pt-28">
        <div className="mx-auto max-w-[1000px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
            Tools
          </p>
          <h1 className="max-w-3xl text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#09090B] sm:text-[52px]">
            Free tools for vendor reliability.
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-[#52525B]">
            No signup, no email gate. Built because we needed them ourselves.
          </p>
        </div>
      </section>

      <section className="px-6 pb-28 md:px-12">
        <div className="mx-auto grid max-w-[1000px] grid-cols-1 gap-5 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              className="group rounded-[20px] border border-[#E4E4E7] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#0891B2]/30 hover:shadow-[0_10px_32px_rgba(8,145,178,0.08)]"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#0891B2]/15 bg-[#0891B2]/8">
                  <tool.icon className="h-5 w-5 text-[#0891B2]" aria-hidden="true" />
                </span>
                <ArrowUpRight className="h-5 w-5 text-[#D4D4D8] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0891B2]" />
              </div>
              <span className="mt-6 inline-block rounded-full bg-[#F4F4F5] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                {tool.tag}
              </span>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-[#09090B]">
                {tool.name}
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-[#52525B]">{tool.body}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
