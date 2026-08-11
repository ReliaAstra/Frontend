'use client';

import { motion } from 'framer-motion';
import { Satellite, GitCompare, FileText } from 'lucide-react';
import { CorrelationTimeline } from '@/components/CorrelationTimeline';

const BENTO_CARDS = [
  {
    icon: Satellite,
    title: 'Track',
    subtitle: 'Independent Vendor Monitoring',
    description:
      'Monitor every third-party API from your own infrastructure. Real-time latency, uptime, and error tracking — no more relying on vendor status pages.',
  },
  {
    icon: GitCompare,
    title: 'Correlate',
    subtitle: 'Cross-Reference Your Stack',
    description:
      'Automatically correlate vendor degradation with your own service metrics. See the causal chain from API failure to customer impact.',
  },
  {
    icon: FileText,
    title: 'Prove',
    subtitle: 'Timestamped SLA Evidence',
    description:
      'Generate court-ready evidence reports with independent verification, multi-region timestamps, and confidence scoring. Claim the credits you deserve.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function SolutionSection() {
  return (
    <section className="py-24 md:py-32 bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Heading */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
            The Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            Track. Correlate. Prove.
          </h2>
          <p className="text-lg text-[#52525B] mt-4 leading-relaxed">
            Three pillars that turn vendor failures from finger-pointing into
            evidence-backed credit claims.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {BENTO_CARDS.map((card) => (
            <motion.article
              key={card.title}
              variants={cardVariants}
              className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-elevated hover:border-[#0891B2]/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[#ECFEFF] flex items-center justify-center mb-4">
                <card.icon className="w-5 h-5 text-[#0891B2]" />
              </div>
              <h3 className="text-xl font-bold text-[#09090B]">{card.title}</h3>
              <p className="text-xs font-semibold text-[#0891B2] mt-1 uppercase tracking-wider">
                {card.subtitle}
              </p>
              <p className="text-sm text-[#52525B] mt-3 leading-relaxed">{card.description}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* Live correlation demo */}
        <motion.div
          className="mt-12 rounded-xl bg-[#0A0A0F] border border-white/10 p-8 grid-pattern"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-white">Live Correlation Demo</h3>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Real-time correlation between your service and vendor API
            </p>
          </div>
          <CorrelationTimeline />
        </motion.div>
      </div>
    </section>
  );
}