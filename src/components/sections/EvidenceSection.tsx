'use client';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { EvidenceReportPreview } from '@/components/EvidenceReportPreview';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const FEATURES = [
  'Multi-region independent verification timestamps',
  'Correlated vendor degradation with your service metrics',
  'Court-ready format accepted by major cloud vendors',
  'One-click generation and sharing with vendor support',
];

export function EvidenceSection() {
  return (
    <section className="bg-white py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-4">
              SLA EVIDENCE
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B] mb-6">
              SLA evidence reports.
            </h2>
            <p className="text-[#52525B] leading-relaxed mb-8">
              Screenshots and Slack messages don&apos;t cut it. Reliastra keeps
              independent, timestamped observations of the endpoints you depend on.
              Credit decisions still sit with the vendor; the record is yours.
            </p>
            <ul className="space-y-4">
              {FEATURES.map((feature, i) => (
                <motion.li
                  key={feature}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease }}
                >
                  <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-sm text-[#52525B] leading-relaxed">{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column - Report Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
          >
            <EvidenceReportPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
