import { Metadata } from 'next';
import { TrackVendorContent } from './track-vendor-content';

const vendors = ['stripe', 'auth0', 'cloudflare', 'openai', 'twilio', 'vercel'] as const;

type Vendor = (typeof vendors)[number];

const vendorLabels: Record<Vendor, string> = {
  stripe: 'Stripe',
  auth0: 'Auth0',
  cloudflare: 'Cloudflare',
  openai: 'OpenAI',
  twilio: 'Twilio',
  vercel: 'Vercel',
};

export async function generateStaticParams() {
  return vendors.map((v) => ({ vendor: v }));
}

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }): Promise<Metadata> {
  const { vendor } = await params;
  const label = vendorLabels[vendor as Vendor] ?? vendor;
  return {
    title: `${label} API Status — Independent Monitoring | Reliastra`,
    description: `Independent, real-time monitoring of ${label}'s API. See latency, uptime, and incident history from Reliastra's third-party perspective.`,
  };
}

export default async function TrackVendorPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const label = vendorLabels[vendor as Vendor] ?? vendor;
  return (
    <main className="min-h-screen bg-white">
      <TrackVendorContent vendor={vendor as Vendor} vendorLabel={label} />
    </main>
  );
}
