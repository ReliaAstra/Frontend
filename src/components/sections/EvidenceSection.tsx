'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EvidenceReportPreview } from '@/components/EvidenceReportPreview';

const BULLETS = [
  'Multi-region independent verification timestamps',
  'Correlated vendor degradation with your service metrics',
  'Court-ready format accepted by major cloud vendors',
  'One-click generation and sharing with vendor support',
];

export function EvidenceSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
              SLA Evidence
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
              Reports That Get You Paid
            </h2>
            <p className="text-lg text-[#52525B] mt-4 leading-relaxed">
              When a vendor breaches SLA, you need more than screenshots.
              Reliastra generates evidence reports that vendors actually accept.
            </p>
            <ul className="mt-8 space-y-4">
              {BULLETS.map((bullet, i) => (
                <motion.li
                  key={bullet}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="w-5 h-5 rounded-full bg-[#ECFEFF] flex items-center justify-center mt-0.5 shrink-0">
                    <Check className="w-3 h-3 text-[#0891B2]" />
                  </div>
                  <span className="text-[#52525B] text-sm leading-relaxed">{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right: Report preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex justify-center"
          >
            <EvidenceReportPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}