import { PartnerResourcesPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'RELIASTRA Partner Resources',
  description:
    'Public product, sales, technical, and brand resources for future RELIASTRA partners.',
  path: '/resources',
});

export default function Page() {
  return <PartnerResourcesPage />;
}
