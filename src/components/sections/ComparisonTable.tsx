'use client';
import { motion } from 'framer-motion';
import { Check, X, CircleDot } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

type CellValue = 'check' | 'x' | 'partial';

interface Row {
  feature: string;
  statusPages: CellValue;
  internalMonitoring: CellValue;
  basicUptime: CellValue;
  reliastra: CellValue;
}

const ROWS: Row[] = [
  { feature: 'Independent Vendor Monitoring', statusPages: 'x', internalMonitoring: 'x', basicUptime: 'x', reliastra: 'check' },
  { feature: 'Multi-Region Verification', statusPages: 'x', internalMonitoring: 'partial', basicUptime: 'x', reliastra: 'check' },
  { feature: 'Vendor-Causal Correlation', statusPages: 'x', internalMonitoring: 'x', basicUptime: 'x', reliastra: 'check' },
  { feature: 'SLA Evidence Report Generation', statusPages: 'x', internalMonitoring: 'x', basicUptime: 'x', reliastra: 'check' },
  { feature: 'Timestamp Chain of Custody', statusPages: 'x', internalMonitoring: 'x', basicUptime: 'x', reliastra: 'check' },
  { feature: 'Real-Time Vendor Dashboard', statusPages: 'partial', internalMonitoring: 'check', basicUptime: 'check', reliastra: 'check' },
];

const HEADERS = ['Feature', 'Status Pages', 'Internal Monitoring', 'Basic Uptime', 'Reliastra'];

function CellIcon({ value }: { value: CellValue }) {
  if (value === 'check') {
    return <Check className="w-[18px] h-[18px] text-[#16A34A]" aria-label="Yes" />;
  }
  if (value === 'x') {
    return <X className="w-[18px] h-[18px] text-[#DC2626]" style={{ opacity: 0.5 }} aria-label="No" />;
  }
  return <CircleDot className="w-[18px] h-[18px] text-[#D97706]" aria-label="Partial" />;
}

export function ComparisonTable() {
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
            WHY RELIASTRA
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B] mb-6">
            The evidence gap.
          </h2>
          <p className="text-[#52525B] leading-relaxed">
            Existing monitoring tools can tell you something is wrong. Only Reliastra
            can prove it was your vendor: and give you the evidence to claim your SLA
            credits.
          </p>
        </motion.div>

        {/* Table */}
        <motion.div
          className="max-w-4xl mx-auto overflow-x-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease }}
        >
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-[#F8F9FA]">
                {HEADERS.map((header, i) => (
                  <th
                    key={header}
                    className={cn(
                      'font-semibold text-sm text-[#09090B] py-4 px-4 text-left',
                      i === 0 && 'w-[40%]',
                      i === HEADERS.length - 1 && 'bg-[#0891B2]/5 border-l-2 border-[#0891B2]'
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  className="border-b border-[#F0F0F0] hover:bg-[#F8F9FA]/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease }}
                >
                  <td className="py-4 px-4 text-[#52525B]">{row.feature}</td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center"><CellIcon value={row.statusPages} /></div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center"><CellIcon value={row.internalMonitoring} /></div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex justify-center"><CellIcon value={row.basicUptime} /></div>
                  </td>
                  <td className="py-4 px-4 text-center bg-[#0891B2]/5 border-l-2 border-[#0891B2]">
                    <div className="flex justify-center"><CellIcon value={row.reliastra} /></div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
