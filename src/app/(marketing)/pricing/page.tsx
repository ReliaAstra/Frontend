import { Metadata } from 'next';
import { PricingContent } from './pricing-content';

export const metadata: Metadata = {
  title: 'Pricing | Reliastra',
  description: 'Simple, transparent pricing for external dependency monitoring. Start free, scale as you grow.',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <PricingContent />
    </main>
  );
}
