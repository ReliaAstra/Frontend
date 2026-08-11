'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  label: string;
  statusPages: boolean | string;
  internal: boolean | string;
  basicUptime: boolean | string;
  relias: boolean | string;
}

const FEATURES: Feature[] = [
  { label: 'Independent Vendor Monitoring', statusPages: false, internal: false, basicUptime: false, relias: true },
  { label: 'Multi-Region Verification', statusPages: false, internal: 'Partial', basicUptime: false, relias: true },
  { label: 'Vendor-Causal Correlation', statusPages: false, internal: false, basicUptime: false, relias: true },
  { label: 'SLA Evidence Report Generation', statusPages: false, internal: false, basicUptime: false, relias: true },
  { label: 'Timestamp Chain of Custody', statusPages: false, internal: false, basicUptime: false, relias: true },
  { label: 'Real-Time Vendor Dashboard', statusPages: true, internal: true, basicUptime: true, relias: true },
  { label: 'Vendor-Agnostic', statusPages: true, internal: false, basicUptime: true, relias: true },
  { label: 'Credit Recovery Assistance', statusPages: false, internal: false, basicUptime: false, relias: true },
];

const COLUMNS = [
  { key: 'statusPages' as const, label: 'Vendor Status Pages' },
  { key: 'internal' as const, label: 'Internal Monitoring' },
  { key: 'basicUptime' as const, label: 'Basic Uptime Tools' },
  { key: 'relias' as const, label: 'Reliastra', highlight: true },
];

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span className="text-xs text-[#A1A1AA]">{value}</span>;
  }
  if (value) {
    return <Check className="w-4 h-4 text-[#16A34A]" />;
  }
  return <X className="w-4 h-4 text-[#E4E4E7]" />;
}

export function ComparisonTable() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
            Why Reliastra
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            The Evidence Gap
          </h2>
          <p className="text-lg text-[#52525B] mt-4 leading-relaxed">
            Existing tools tell you something is wrong. Reliastra tells you
            who to blame — and gives you the proof.
          </p>
        </motion.div>

        <motion.div
          className="overflow-x-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <table className="w-full min-w-[640px]" role="table">
            <thead>
              <tr>
                <th className="text-left text-sm font-semibold text-[#52525B] py-3 pr-4 w-56" />
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'text-center text-sm font-semibold py-3 px-4 w-36',
                      col.highlight ? 'text-[#0891B2]' : 'text-[#A1A1AA]'
                    )}
                  >
                    <span className={col.highlight ? 'block' : ''}>
                      {col.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, i) => (
                <tr
                  key={feature.label}
                  className={cn(
                    'border-t border-[#F0F0F0]',
                    i === FEATURES.length - 1 && 'border-b border-[#E4E4E7]'
                  )}
                >
                  <td className="py-4 pr-4 text-sm text-[#09090B] font-medium">
                    {feature.label}
                  </td>
                  {COLUMNS.map((col) => {
                    const isHighlighted = col.highlight;
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'text-center py-4 px-4',
                          isHighlighted && 'bg-[#ECFEFF]/50'
                        )}
                      >
                        <div className="flex justify-center">
                          <CellValue value={feature[col.key]} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}