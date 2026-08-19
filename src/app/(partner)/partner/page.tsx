import { PartnerOverviewPage } from '@/components/partner/PartnerPages';
import { buildPartnerMetadata } from '@/lib/partner-metadata';

export const metadata = buildPartnerMetadata({
  title: 'RELIASTRA Partner Network — Earn by Bringing Infrastructure Teams to RELIASTRA',
  description:
    'Turn your network into recurring revenue. Join the RELIASTRA Partner Network and bring qualified infrastructure teams to external dependency intelligence.',
  path: '/',
});

export default function Page() {
  return <PartnerOverviewPage />;
}
