import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';
import { VENDOR_CATALOG, getVendor, vendorLabel } from '@/lib/vendor-catalog';

export const alt = 'Vendor reliability profile on Reliastra';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return VENDOR_CATALOG.map((v) => ({ vendor: v.slug }));
}

export default async function Image({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const catalog = getVendor(vendor);
  const name = vendorLabel(vendor);

  return renderOgImage({
    eyebrow: 'Vendor intelligence',
    title: `${name} Status & Incident History`,
    subtitle:
      catalog?.summary ??
      'Independent reliability observations measured from regions outside the vendor\u2019s infrastructure.',
    accent: catalog?.color ?? '#0891B2',
    chips: ['90-day uptime', 'Latency', 'Incident history'],
  });
}
