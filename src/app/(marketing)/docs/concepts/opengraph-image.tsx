import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Reliastra concept documentation';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Concepts',
    title: 'Vendor Reliability, Explained',
    subtitle:
      'Reference material on measuring dependencies, claiming SLA credits, and correlating outages across regions.',
    chips: ['SLA tracking', 'Credit claims', 'Correlation'],
  });
}
