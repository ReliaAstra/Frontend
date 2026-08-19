'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Rss } from 'lucide-react';
import { changelogEntries as entries } from '@/lib/changelog-data';


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
            <a
              href="/changelog/feed.xml"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white px-4 py-2 text-sm font-medium text-[#52525B] transition-colors hover:border-[#0891B2] hover:text-[#0891B2]"
            >
              <Rss className="h-4 w-4" aria-hidden="true" />
              Subscribe via RSS
            </a>
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
                  <div className="absolute left-2.5 md:left-4.5 top-1.5 h-3 w-3 rounded-full border-2 border-[#0891B2] bg-white z-10" />

                  <div className="rounded-xl border border-[#E4E4E7] p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={typeStyles[entry.type]} variant="secondary">
                        {entry.version}
                      </Badge>
                      <span className="text-xs text-[#A1A1AA]">{entry.dateLabel}</span>
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
