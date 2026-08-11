'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BrowserMockup } from '@/components/BrowserMockup';
import { LiveVendorChart } from '@/components/LiveVendorChart';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#ECFEFF]/40 via-white to-white" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Badge variant="outline" className="gap-2 px-3 py-1.5 border-[#0891B2]/20 bg-[#ECFEFF] text-[#0891B2] text-xs font-medium rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                </span>
                External Dependency Intelligence
              </Badge>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-display text-[#09090B] mt-6"
            >
              Know it&apos;s your vendor&apos;s fault.{' '}
              <span className="text-[#0891B2]">Prove it.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-[#52525B] mt-6 max-w-lg leading-relaxed"
            >
              Monitor third-party APIs independently. When vendors fail, generate
              timestamped SLA evidence reports to claim credits and prove fault.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mt-8">
              <Button
                size="lg"
                className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-lg font-semibold border-[#E4E4E7] text-[#09090B] hover:bg-[#F8F9FA] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => {
                  document.getElementById('live-vendors')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Activity className="mr-2 w-4 h-4" />
                See Live Vendor Data
              </Button>
            </motion.div>

            <motion.p variants={itemVariants} className="mt-6 text-xs text-[#A1A1AA]">
              No credit card required · 14-day free trial · Cancel anytime
            </motion.p>
          </motion.div>

          {/* Right: Browser Mockup with LiveVendorChart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <BrowserMockup url="reliastra.com/dashboard" className="shadow-elevated">
              <div className="p-4" style={{ minHeight: 320 }}>
                <LiveVendorChart />
              </div>
            </BrowserMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}