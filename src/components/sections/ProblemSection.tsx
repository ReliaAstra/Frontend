'use client';
import { motion } from 'framer-motion';
import { Eye, GitCompare, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const PAIN_CARDS = [
  {
    icon: Eye,
    title: 'Blind to Vendor Failures',
    body: 'Your monitoring only sees your own stack. When a vendor API starts returning 5xx errors, your dashboards show healthy: because from your infrastructure’s perspective, everything is fine. You’re the last to know.',
  },
  {
    icon: GitCompare,
    title: 'No Causal Evidence',
    body: 'Vendors say “everything looks fine on our end.” Without independent, timestamped verification from outside your infrastructure, you have nothing to counter their claim. Your word against theirs.',
  },
  {
    icon: FileCheck,
    title: 'Credits Left on the Table',
    body: 'SLA credits require evidence: downtime duration, affected endpoints, independent verification. Without automated evidence collection, claiming credits is manual, tedious, and usually abandoned.',
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-32">
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
            THE 2 AM WAR ROOM
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B] mb-6">
            You know the conversation. &lsquo;Is it us or them?&rsquo;
          </h2>
          <p className="text-[#52525B] leading-relaxed">
            Your pager goes off. Your site is down. Your team jumps on a call. Someone
            checks Stripe’s status page :  green. Someone checks
            AWS :  green. Forty-five minutes later, you find the root
            cause buried in a vendor’s API latency spike. Your customers don’t
            care whose fault it was. But your CFO will when you can’t prove it for
            the SLA claim.
          </p>
        </motion.div>

        {/* Pain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              className="bg-[#F8F9FA] rounded-2xl p-8 border border-[#F0F0F0] transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:border-[#0891B2]/20"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease }}
            >
              <div className="w-12 h-12 rounded-xl bg-[#0891B2]/10 flex items-center justify-center mb-6">
                <card.icon className="w-6 h-6 text-[#0891B2]" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-[#09090B] mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-[#52525B] leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
