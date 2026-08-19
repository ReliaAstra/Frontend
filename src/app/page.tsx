'use client'

import { Navigation } from '@/components/reliastra/navigation'
import { HeroSection } from '@/components/reliastra/hero-section'
import { WarRoomSection } from '@/components/reliastra/war-room-section'
import { TrackCorrelateProveSection } from '@/components/reliastra/track-correlate-prove-section'
import { EvidenceReportSection } from '@/components/reliastra/evidence-report-section'
import { VendorIntelligenceSection } from '@/components/reliastra/vendor-intelligence-section'
import { CorrelationEngineSection } from '@/components/reliastra/correlation-engine-section'
import { DependencySurfaceSection } from '@/components/reliastra/dependency-surface-section'
import { EvidenceGapSection } from '@/components/reliastra/evidence-gap-section'
import { UseCasesSection } from '@/components/reliastra/use-cases-section'
import { PricingSection } from '@/components/reliastra/pricing-section'
import { TrustSection } from '@/components/reliastra/trust-section'
import { FinalCtaSection } from '@/components/reliastra/final-cta-section'
import { Footer } from '@/components/reliastra/footer'

export default function Home() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-white text-slate-900">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <WarRoomSection />
        <TrackCorrelateProveSection />
        <CorrelationEngineSection />
        <EvidenceReportSection />
        <VendorIntelligenceSection />
        <DependencySurfaceSection />
        <EvidenceGapSection />
        <UseCasesSection />
        <PricingSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  )
}
