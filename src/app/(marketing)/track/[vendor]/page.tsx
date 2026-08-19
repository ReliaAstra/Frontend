import { Metadata } from 'next';
import { VendorProfile } from './vendor-profile';
import { JsonLd, graph } from '@/components/JsonLd';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/site';
import { VENDOR_CATALOG, getVendor, vendorLabel } from '@/lib/vendor-catalog';

/** Pre-render the known vendor catalogue; unknown slugs render on demand. */
export async function generateStaticParams() {
  return VENDOR_CATALOG.map((v) => ({ vendor: v.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vendor: string }>;
}): Promise<Metadata> {
  const { vendor } = await params;
  const catalog = getVendor(vendor);
  const name = vendorLabel(vendor);
  const url = absoluteUrl(`/track/${vendor}`);

  const title = `${name} API Status & Incident History`;
  const description = catalog
    ? `Independent reliability tracking for ${name}: ${catalog.summary} See 90-day observed uptime, response latency and incident history, measured by Reliastra from regions outside ${name}'s infrastructure.`
    : `Independent reliability tracking for ${name}. 90-day observed uptime, response latency and incident history, measured continuously by Reliastra from outside ${name}'s infrastructure.`;

  return {
    title,
    description,
    keywords: [
      `${name} status`,
      `${name} API status`,
      `${name} uptime`,
      `${name} outage history`,
      `is ${name} down`,
      `${name} incident history`,
    ],
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  };
}

export default async function TrackVendorPage({
  params,
}: {
  params: Promise<{ vendor: string }>;
}) {
  const { vendor } = await params;
  const catalog = getVendor(vendor);
  const name = vendorLabel(vendor);
  const url = absoluteUrl(`/track/${vendor}`);

  const jsonLd = graph(
    {
      '@type': 'Organization',
      '@id': `${url}#vendor`,
      name,
      ...(catalog?.url ? { url: catalog.url } : {}),
      ...(catalog?.summary ? { description: catalog.summary } : {}),
      ...(catalog?.statusPage ? { subjectOf: { '@type': 'WebPage', url: catalog.statusPage } } : {}),
    },
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `${name} API Status & Incident History — ${SITE_NAME}`,
      description: `Independent 90-day uptime, latency and incident history for ${name}, measured by Reliastra.`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${url}#vendor` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      significantLink: [absoluteUrl('/track'), absoluteUrl('/tools/sla-credit-calculator')],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Vendor Intelligence', item: absoluteUrl('/track') },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
  );

  return (
    <main className="min-h-screen bg-[#0A0A0F] pt-[72px]">
      <JsonLd data={jsonLd} id="vendor-jsonld" />
      <VendorProfile vendorSlug={vendor} catalog={catalog} fallbackName={name} />
    </main>
  );
}
