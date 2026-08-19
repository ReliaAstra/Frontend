import { PartnerApplyPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'Apply to the RELIASTRA Partner Network',
  description:
    'Submit a short public partner application and tell RELIASTRA how you already reach qualified infrastructure teams.',
  path: '/apply',
});

export default function Page() {
  return <PartnerApplyPage />;
}
