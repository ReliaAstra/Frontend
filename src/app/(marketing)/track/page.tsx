import { Metadata } from 'next';
import { TrackPageContent } from './track-page-content';

export const metadata: Metadata = {
  title: 'Vendor Intelligence — All Monitored Vendors | Reliastra',
  description: 'Real-time reliability intelligence for all monitored vendors. Independent API latency, uptime, and incident tracking.',
};

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-white pt-[72px]">
      <TrackPageContent />
    </main>
  );
}
