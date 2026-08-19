import { Metadata } from 'next';
import { CalculatorContent } from './calculator-content';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { SLA_VENDORS } from '@/lib/vendor-catalog';

const title = 'SLA Credit Calculator — Estimate What Your Provider Owes';
const description =
  'Free SLA credit calculator. Enter your monthly spend and observed downtime to estimate the service credit owed under AWS, Google Cloud, Azure and Twilio published credit schedules.';

const url = absoluteUrl('/tools/sla-credit-calculator');

export const metadata: Metadata = {
  title: 'SLA Credit Calculator',
  description,
  keywords: [
    'SLA credit calculator',
    'service credit calculator',
    'uptime SLA calculator',
    'AWS SLA credit',
    'cloud downtime credit',
    'SLA breach compensation',
  ],
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title, description },
};

const FAQS = [
  {
    q: 'How is an SLA credit calculated?',
    a: 'Convert your observed downtime into a monthly uptime percentage — total minutes in the month minus downtime minutes, divided by total minutes. Compare that figure against the provider\u2019s commitment and read the matching row of their published credit schedule. The credit is that percentage of what you paid for the affected service in that month.',
  },
  {
    q: 'Are SLA credits paid automatically?',
    a: 'Almost never. Nearly every major provider requires you to file a claim with per-interval evidence, usually within 30 days of the end of the affected billing period. If you do not claim, no credit is issued.',
  },
  {
    q: 'How much downtime does 99.9% uptime allow?',
    a: 'A 99.9% monthly commitment allows about 43 minutes 12 seconds of downtime in a 30-day month. 99.95% allows about 21 minutes 36 seconds, and 99.99% allows about 4 minutes 19 seconds.',
  },
  {
    q: 'Does an SLA credit cover my lost revenue?',
    a: 'No. A service credit refunds a percentage of what you paid the provider for the affected service. It does not compensate for lost revenue, support costs or customer churn, and most SLAs state explicitly that the credit is your sole remedy.',
  },
  {
    q: 'Why does my downtime figure differ from the provider\u2019s?',
    a: 'Published SLAs define availability precisely — often averaged across five-minute intervals, per region and per service — and exclude scheduled maintenance, client-side faults and network issues outside the provider\u2019s control. Your measurement is a starting position for the claim, not the provider\u2019s official calculation.',
  },
];

export default function SlaCreditCalculatorPage() {
  const jsonLd = graph(
    {
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: 'SLA Credit Calculator',
      url,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'SLA credit estimation',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript',
      description,
      isAccessibleForFree: true,
      publisher: { '@id': `${SITE_URL}/#organization` },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Monthly uptime percentage calculation from observed downtime',
        'Credit tier matching against published provider schedules',
        'Estimated credit amount from monthly spend',
        'Downtime allowance comparison per commitment level',
      ],
      about: SLA_VENDORS.map((v) => ({
        '@type': 'Thing',
        name: `${v.name} service level agreement`,
        url: v.sla?.documentUrl,
      })),
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: { '@id': `${url}#app` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: absoluteUrl('/tools') },
        { '@type': 'ListItem', position: 3, name: 'SLA Credit Calculator', item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <JsonLd data={jsonLd} id="sla-calculator-jsonld" />
      <CalculatorContent />

      {/* Server-rendered FAQ — indexable without JS, matches the FAQPage schema */}
      <section className="border-t border-[#F0F0F0] px-6 pb-28 pt-20 md:px-12">
        <div className="mx-auto max-w-[760px]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
            Questions
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#09090B]">
            About SLA credits.
          </h2>
          <dl className="mt-10 divide-y divide-[#F0F0F0]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-7 first:pt-0">
                <dt className="text-[17px] font-semibold leading-snug text-[#09090B]">{faq.q}</dt>
                <dd className="mt-3 leading-relaxed text-[#52525B]">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
