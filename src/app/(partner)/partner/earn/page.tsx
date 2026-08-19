import { PartnerEarnPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'Earn with RELIASTRA — Join the Partner Network',
  description:
    'Earn by bringing RELIASTRA to the right businesses. Qualified access matters more than audience size.',
  path: '/earn',
});

export default function Page() {
  return <PartnerEarnPage />;
}
