import { Metadata } from 'next';
import { ChangelogContent } from './changelog-content';

export const metadata: Metadata = {
  title: 'Changelog | Reliastra',
  description: 'See what\'s new in Reliastra. Release notes, feature updates, and improvements.',
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-white">
      <ChangelogContent />
    </main>
  );
}
