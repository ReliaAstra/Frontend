import { PartnerHowItWorksPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'How the RELIASTRA Partner Network Works',
  description:
    'See the RELIASTRA partner lifecycle from attribution and qualification to recurring partner revenue.',
  path: '/how-it-works',
});

export default function Page() {
  return <PartnerHowItWorksPage />;
}
