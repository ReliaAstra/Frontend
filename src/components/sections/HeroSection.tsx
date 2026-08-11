'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { BrowserMockup } from '@/components/BrowserMockup';
import { LiveVendorChart } from '@/components/LiveVendorChart';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

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
          {/* Left Column */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease }}
            >
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

            {/* Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.08] tracking-tight font-[500] text-[#09090B]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
            >
              Know it&apos;s your vendor&apos;s fault.{' '}
              <span className="text-[#0891B2] font-[800]">Prove it.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg text-[#52525B] leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2, ease }}
            >
              Reliastra monitors your critical third-party APIs from independent
              locations. When a vendor causes your outage, it generates the
              evidence to claim SLA credits and prove fault.
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
            >
              <a
                href="/signup"
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
                href="/status"
                className="group inline-flex items-center justify-center gap-2 bg-white border border-[#E4E4E7] text-[#09090B] px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:border-[#09090B] hover:bg-[#F8F9FA] transition-all duration-200"
              >
                <Activity className="w-4 h-4" />
                See Live Vendor Data
              </a>
            </motion.div>

            {/* Trust line */}
            <motion.div
              className="flex items-center gap-2 text-sm text-[#A1A1AA]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.4, ease }}
            >
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
              <span>No credit card required · Free vendor tracking forever</span>
            </motion.div>
          </div>

          {/* Right Column - Browser Mockup */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <BrowserMockup className="min-h-[400px]" aria-label="Live vendor monitoring dashboard">
              <div className="p-4 min-h-[400px]">
                <LiveVendorChart />
              </div>
            </BrowserMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
