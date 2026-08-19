import { PartnerFaqPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'RELIASTRA Partner Network FAQ',
  description:
    'Answers to common questions about qualification, referrals, attribution, and partner economics at RELIASTRA.',
  path: '/faq',
});

export default function Page() {
  return <PartnerFaqPage />;
}
