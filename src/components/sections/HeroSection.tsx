'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { BrowserMockup } from '@/components/BrowserMockup';
import { IncidentCorrelationCard } from '@/components/IncidentCorrelationCard';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

/* Stagger container for child animations */
const stagger = {
  animate: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function HeroSection() {
  return (
    <section
      className={cn(
        'min-h-[calc(100dvh-72px)] pt-[80px] pb-20 relative overflow-hidden',
        'bg-white'
      )}
      style={{
        background: 'radial-gradient(ellipse 60% 50% at 70% 40%, rgba(8,145,178,0.05) 0%, transparent 100%)',
      }}
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column — use animate (not whileInView) for above-the-fold */}
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="initial"
            animate="animate"
          >
            {/* Badge */}
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2.5 bg-[#F8F9FA] border border-[#F0F0F0] rounded-full px-4 py-2">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#16A34A]" />
                </span>
                <span className="text-xs font-semibold text-[#52525B]">
                  External Dependency Intelligence
                </span>
              </div>
            </motion.div>

            {/* Headline — 3-line structure */}
            <motion.h1
              className="text-[40px] sm:text-[48px] lg:text-[64px] leading-[1.1] tracking-[-0.03em] text-[#09090B]"
              variants={fadeUp}
            >
              <span className="font-[800]">Your site went down.</span>
              <br />
              <span className="font-[600]">Was it you, or</span>{' '}
              <span className="font-[800] text-[#0891B2]">your vendors?</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg text-[#52525B] leading-relaxed max-w-lg mt-2"
              variants={fadeUp}
            >
              Reliastra monitors the external services your infrastructure depends on,
              correlates their failures with your incidents, and produces independent
              evidence of what happened.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeUp}
            >
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-2 bg-[#0A0A0F] text-white px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:shadow-xl transition-all duration-200"
                style={{ transitionProperty: 'transform, box-shadow' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Start Free
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="/track"
                className="group inline-flex items-center justify-center gap-2 bg-white border border-[#E4E4E7] text-[#09090B] px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:border-[#09090B] hover:bg-[#F8F9FA] transition-all duration-200"
              >
                <Activity className="w-4 h-4" />
                See Live Vendor Data
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              className="flex items-center gap-2 text-sm text-[#A1A1AA]"
              variants={fadeUp}
            >
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>No credit card required · Free vendor tracking forever</span>
            </motion.div>
          </motion.div>

          {/* Right Column — Incident Correlation Card in Browser Mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease }}
          >
            <BrowserMockup url="reliastra.com/incidents/1842" aria-label="Live incident correlation card showing checkout degradation traced to Stripe EU outage">
              <div className="flex justify-center py-6 px-4 md:px-8">
                <IncidentCorrelationCard />
              </div>
            </BrowserMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
