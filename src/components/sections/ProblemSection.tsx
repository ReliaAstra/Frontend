'use client';

import { motion } from 'framer-motion';
import { Eye, GitCompare, FileCheck } from 'lucide-react';

const PAIN_POINTS = [
  {
    icon: Eye,
    title: 'Blind to Vendor Failures',
    description:
      'Your monitoring only sees your own stack. When a third-party API degrades, you learn from angry customers — not your dashboards.',
  },
  {
    icon: GitCompare,
    title: 'No Causal Evidence',
    description:
      'Vendors say "everything looks fine on our end." You have nothing to prove the outage originated on their side.',
  },
  {
    icon: FileCheck,
    title: 'Credits Left on the Table',
    description:
      'SLA credits exist, but claiming them requires evidence you don\'t have. That\'s free money vendors are happy to keep.',
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

export function ProblemSection() {
  return (
    <section className="py-24 md:py-32" id="product">
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
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            The 2 AM War Room
          </h2>
          <p className="text-lg text-[#52525B] mt-4 leading-relaxed">
            Your service is on fire. Customers are screaming. The vendor says
            &ldquo;all systems operational.&rdquo; You know they&apos;re lying —
            but you can&apos;t prove it.
          </p>
        </motion.div>

        {/* Pain point cards */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {PAIN_POINTS.map((point) => (
            <motion.article
              key={point.title}
              variants={cardVariants}
              className="rounded-xl border border-[#E4E4E7] bg-white p-6 shadow-card hover:-translate-y-1 hover:shadow-elevated hover:border-[#0891B2]/30 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg bg-[#ECFEFF] flex items-center justify-center mb-4">
                <point.icon className="w-5 h-5 text-[#0891B2]" />
              </div>
              <h3 className="text-lg font-bold text-[#09090B] mb-2">{point.title}</h3>
              <p className="text-sm text-[#52525B] leading-relaxed">{point.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
