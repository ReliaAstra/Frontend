import { Metadata } from 'next';
import { InvestorsContent } from './investors-content';

export const metadata: Metadata = {
  title: 'Investors | Reliastra',
  description: 'Reliastra is building the future of external dependency intelligence. Learn about our vision, traction, and investment opportunity.',
};

export default function InvestorsPage() {
  return (
    <main className="min-h-screen bg-white">
      <InvestorsContent />
    </main>
  );
}
