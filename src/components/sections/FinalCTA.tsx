'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32 bg-[#0A0A0F] relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 grid-pattern" aria-hidden="true" />

      <div className="relative max-w-3xl mx-auto px-4 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Stop Guessing. Start Proving.
          </h2>
          <p className="text-lg text-[#A1A1AA] mt-4 leading-relaxed max-w-lg mx-auto">
            The next time a vendor takes down your service, you&apos;ll have the
            evidence to claim your credits.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button
              size="lg"
              className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Today
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-[#A1A1AA]">
            Free for up to 5 vendors · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
