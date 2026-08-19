import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og';
import { CONCEPTS, getConcept } from '@/lib/concepts-data';

export const alt = 'Reliastra concept documentation';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const concept = getConcept(slug);

  return renderOgImage({
    eyebrow: 'Concepts',
    title: concept?.title ?? 'Reliastra Concepts',
    subtitle: concept?.tldr,
    chips: concept ? [concept.readTime, 'Reference'] : ['Reference'],
  });
}
