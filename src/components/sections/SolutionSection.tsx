'use client';
import { motion } from 'framer-motion';
import { Satellite, GitCompare, FileText } from 'lucide-react';
import { CorrelationTimeline } from '@/components/CorrelationTimeline';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const BENTO_CARDS = [
  {
    icon: Satellite,
    sublabel: 'INDEPENDENT VENDOR MONITORING',
    title: 'Track Every Critical Vendor',
    body: 'Deploy lightweight checks from independent regions that monitor your vendors’ APIs directly. Monitoring runs on infrastructure completely separate from yours. Detect vendor failures before they affect your users.',
  },
  {
    icon: GitCompare,
    sublabel: 'CROSS-REFERENCE YOUR STACK',
    body: 'Automatically correlate vendor degradation events with your own service metrics. When your error rates spike, Reliastra evaluates whether a vendor is a likely contributor.',
    title: 'Cross-Reference Your Stack',
  },
  {
    icon: FileText,
    sublabel: 'TIMESTAMPED SLA EVIDENCE',
    title: 'Generate SLA Evidence Reports',
    body: 'One click generates a court-ready report with multi-region verification, timestamped logs, and correlated impact analysis. Accepted by major cloud vendors for SLA credit claims.',
  },
];

export function SolutionSection() {
  return (
    <section className="bg-[#F8F9FA] py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B]">
            Track. Correlate. Prove.
          </h2>
        </motion.div>

        {/* Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {BENTO_CARDS.map((card, i) => (
            <motion.div
              key={card.sublabel}
              className="bg-white rounded-2xl p-8 border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#0891B2]/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#0891B2]/10 flex items-center justify-center mb-6">
                <card.icon className="w-6 h-6 text-[#0891B2]" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-3">
                {card.sublabel}
              </p>
              <h3 className="text-lg font-semibold text-[#09090B] mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Correlation Demo */}
        <motion.div
          className="bg-[#0A0A0F] rounded-3xl p-10 md:p-16 text-white overflow-hidden relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-semibold text-white mb-3">
                Live Correlation Engine
              </h3>
              <p className="text-white/50 text-sm">
                See how Reliastra correlates vendor degradation with your service impact in real-time.
              </p>
            </div>
            <CorrelationTimeline />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
