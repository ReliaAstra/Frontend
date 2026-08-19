import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Reliastra system status';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Status',
    title: 'Reliastra System Status',
    subtitle:
      '90-day observed availability for every public component, with full incident history.',
    chips: ['Live monitoring', 'Incident history', '90-day window'],
  });
}
