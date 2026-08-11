import { Metadata } from 'next';
import { AboutContent } from './about-content';

export const metadata: Metadata = {
  title: 'About | Reliastra',
  description: 'Learn about Reliastra — the team, mission, and values behind external dependency intelligence.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <AboutContent />
    </main>
  );
}
