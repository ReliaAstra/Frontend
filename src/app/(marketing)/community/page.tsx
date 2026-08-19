import { Metadata } from 'next';
import { CommunityContent } from './community-content';

export const metadata: Metadata = {
  title: 'Community | Reliastra',
  description: 'Documentation, GitHub, and vendor reliability resources from Reliastra.',
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white">
      <CommunityContent />
    </main>
  );
}
