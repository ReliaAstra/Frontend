import { Metadata } from 'next';
import { TrackVendorContent } from './track-vendor-content';

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }): Promise<Metadata> {
  const { vendor } = await params;
  const label = vendor.charAt(0).toUpperCase() + vendor.slice(1).replace(/-/g, ' ');
  return {
    title: `${label} — Vendor Intelligence Profile | Reliastra`,
    description: `Independent reliability intelligence for ${label}. Real-time API latency, availability, incident history, and endpoint monitoring from Reliastra.`,
  };
}

export default async function TrackVendorPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <TrackVendorContent vendorSlug={vendor} />
    </main>
  );
}
