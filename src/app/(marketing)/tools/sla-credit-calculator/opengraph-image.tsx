import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Reliastra SLA Credit Calculator';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Free tool',
    title: 'SLA Credit Calculator',
    subtitle:
      'Estimate what a provider owes you when they miss their uptime commitment — using their own published credit schedule.',
    stat: { value: '99.9%', label: '43m 12s / month' },
    chips: ['AWS', 'Google Cloud', 'Azure', 'Twilio'],
  });
}
