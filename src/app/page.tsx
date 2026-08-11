import { Navbar } from '@/components/sections/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { SocialProofBar } from '@/components/sections/SocialProofBar';
import { ProblemSection } from '@/components/sections/ProblemSection';
import { SolutionSection } from '@/components/sections/SolutionSection';
import { EvidenceSection } from '@/components/sections/EvidenceSection';
import { LiveVendorGrid } from '@/components/sections/LiveVendorGrid';
import { ComparisonTable } from '@/components/sections/ComparisonTable';
import { UseCasesSection } from '@/components/sections/UseCasesSection';
import { PricingSection } from '@/components/sections/PricingSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { FounderSection } from '@/components/sections/FounderSection';
import { FinalCTA } from '@/components/sections/FinalCTA';
import { Footer } from '@/components/sections/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <SolutionSection />
      <EvidenceSection />
      <LiveVendorGrid />
      <ComparisonTable />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <FounderSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
