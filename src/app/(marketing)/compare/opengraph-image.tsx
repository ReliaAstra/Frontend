import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';

export const alt = 'Compare Reliastra to monitoring and status tools';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({
    eyebrow: 'Compare',
    title: 'How Reliastra Compares',
    subtitle:
      'Honest, side-by-side comparisons — each one starts with what the other product does better.',
    chips: ['Datadog', 'Statuspage', 'UptimeRobot', 'Pingdom'],
  });
}
