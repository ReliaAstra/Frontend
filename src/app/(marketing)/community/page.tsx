import { Metadata } from 'next';
import { CommunityContent } from './community-content';

export const metadata: Metadata = {
  title: 'Community | Reliastra',
  description: 'Join 800+ engineers tracking vendor reliability. Connect on Discord, GitHub, and more.',
};

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-white">
      <CommunityContent />
    </main>
  );
}
