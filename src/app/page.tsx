import { Navbar } from '@/components/sections/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { EvidenceSection } from '@/components/sections/EvidenceSection';
import { LiveVendorGrid } from '@/components/sections/LiveVendorGrid';
import { ComparisonTable } from '@/components/sections/ComparisonTable';
import { UseCasesSection } from '@/components/sections/UseCasesSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FounderSection } from '@/components/sections/FounderSection';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';
import { JsonLd, graph } from '@/components/JsonLd';
import {
  ORGANIZATION_JSONLD,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  WEBSITE_JSONLD,
  absoluteUrl,
} from '@/lib/site';

const HOMEPAGE_FAQS = [
  {
    q: 'How is Reliastra different from regular uptime monitoring?',
    a: 'Regular uptime monitors check your own infrastructure. Reliastra checks the third-party APIs you depend on from independent regions, keeps a timestamped history of every observation, and attaches that history to your incidents so you can show what was observed from outside your stack.',
  },
  {
    q: 'What counts as an independent verification?',
    a: "Reliastra runs checks from multiple cloud regions on infrastructure separate from yours and from the vendor's. Each check is timestamped and logged with full metadata, so the record does not depend on the vendor's own status page.",
  },
  {
    q: 'Which vendors can Reliastra monitor?',
    a: 'Any HTTP endpoint. If a vendor exposes a URL that returns a status code, Reliastra can observe it — payments, auth, CDN, AI inference, messaging, cloud infrastructure and more.',
  },
  {
    q: 'Will this help me get SLA credits?',
    a: 'Structured, independent, timestamped evidence is the basis of an SLA credit claim. Reliastra produces that record. Whether a credit is granted is always the vendor\u2019s decision under their published SLA terms.',
  },
];

const softwareApplication = {
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/#software`,
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Monitoring & Observability',
  operatingSystem: 'Web-based',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  publisher: { '@id': `${SITE_URL}/#organization` },
  featureList: [
    'Independent multi-region monitoring of third-party vendor APIs',
    'Vendor-to-incident correlation',
    'Timestamped SLA evidence report generation',
    'Public vendor reliability tracking pages',
    'SLA credit estimation',
  ],
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free tier with public vendor tracking. Paid plans add correlation and evidence reports.',
    url: absoluteUrl('/pricing'),
  },
};

export default function Home() {
  const jsonLd = graph(
    ORGANIZATION_JSONLD,
    WEBSITE_JSONLD,
    softwareApplication,
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: 'Reliastra: External Dependency Intelligence',
      description: SITE_DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: HOMEPAGE_FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  );

  return (
    <main className="min-h-screen">
      <JsonLd data={jsonLd} id="homepage-jsonld" />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <EvidenceSection />
      <LiveVendorGrid />
      <ComparisonTable />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <FounderSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
