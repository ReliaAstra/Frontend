'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

const entries = [
  {
    version: 'v0.3.0',
    date: 'Aug 2025',
    title: 'Initial public beta',
    description: 'Live vendor tracking for 6 major providers. Open signups, free tier, and core monitoring dashboard.',
    type: 'major' as const,
  },
  {
    version: 'v0.2.0',
    date: 'Jul 2025',
    title: 'Incident correlation engine',
    description: 'Added automated incident correlation across vendors and SLA evidence report generation with PDF export.',
    type: 'major' as const,
  },
  {
    version: 'v0.1.1',
    date: 'Jul 2025',
    title: 'Monitoring improvements',
    description: 'Improved monitoring intervals to 30 seconds. Added Slack notification support and alerting rules.',
    type: 'minor' as const,
  },
  {
    version: 'v0.1.0-beta',
    date: 'Jun 2025',
    title: 'Private beta launch',
    description: 'First 10 founding customers onboarded. Core monitoring infrastructure deployed with manual alerting.',
    type: 'major' as const,
  },
  {
    version: 'v0.0.1',
    date: 'May 2025',
    title: 'Internal alpha',
    description: 'Core monitoring infrastructure deployed. Internal testing with synthetic vendor endpoints.',
    type: 'minor' as const,
  },
];

const typeStyles = {
  major: 'bg-[#0891B2] text-white',
  minor: 'bg-slate-100 text-[#52525B]',
};

export function ChangelogContent() {
  return (
    <>
      {/* Header */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">Changelog</h1>
            <p className="mt-4 text-lg text-[#52525B] max-w-2xl mx-auto">
              Every update to Reliastra, documented.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="pb-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-2 bottom-2 w-px bg-[#E4E4E7]" />

            <div className="space-y-10">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry.version}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative pl-14 md:pl-20"
                >
                  {/* Dot on timeline */}
                  <div className="absolute left-2.5 md:left-4.5 top-1.5 h-3 w-3 rounded-full border-2 border-[#0891B2] bg-white z-10" style={{ left: '13px' }} />

                  <div className="rounded-xl border border-[#E4E4E7] p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={typeStyles[entry.type]} variant="secondary">
                        {entry.version}
                      </Badge>
                      <span className="text-xs text-[#A1A1AA]">{entry.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[#09090B]">{entry.title}</h3>
                    <p className="mt-2 text-sm text-[#52525B] leading-relaxed">{entry.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
