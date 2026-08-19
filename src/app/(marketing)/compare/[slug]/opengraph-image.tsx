import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';
import { COMPARISONS, getComparison } from '@/lib/comparison-data';

export const alt = 'Reliastra product comparison';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getComparison(slug);

  return renderOgImage({
    eyebrow: 'Comparison',
    title: `Reliastra vs ${data?.competitor ?? 'Alternatives'}`,
    subtitle: data?.positioning,
    chips: ['Honest comparison', 'Where each wins', 'Best for'],
  });
}
