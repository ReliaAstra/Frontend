import { PartnerCommissionPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'RELIASTRA Partner Commission — How Earnings Work',
  description:
    'Transparent commission structure for RELIASTRA partners across referrals, implementations, introductions, and deeper partner models.',
  path: '/commission',
});

export default function Page() {
  return <PartnerCommissionPage />;
}
