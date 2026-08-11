'use client';
import { motion } from 'framer-motion';

export function CorrelationTimeline() {
  return (
    <div className="relative w-full max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Track labels */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-28 text-right text-xs font-medium text-[#A1A1AA]">Your Service</div>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-28 text-right text-xs font-medium text-[#A1A1AA]">Stripe API</div>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Timeline bars */}
        <div className="space-y-8">
          {/* Your Service track */}
          <div className="flex items-center gap-4">
            <div className="w-28 text-right text-xs text-[#67E8F9] font-mono">14:32:08</div>
            <div className="flex-1 relative h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-[30%] w-[25%] bg-[#DC2626]/20 border border-[#DC2626]/40 rounded"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-[10px] text-[#A1A1AA] font-mono">API Error Rate: 12.4%</span>
              </div>
            </div>
          </div>

          {/* Stripe API track */}
          <div className="flex items-center gap-4">
            <div className="w-28 text-right text-xs text-[#67E8F9] font-mono">14:32:06</div>
            <div className="flex-1 relative h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-[28%] w-[28%] bg-[#DC2626]/20 border border-[#DC2626]/40 rounded"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-[10px] text-[#A1A1AA] font-mono">5xx Errors Detected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Correlation arrow + confidence */}
        <motion.div
          className="flex items-center justify-center mt-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 bg-[#0891B2]/10 border border-[#0891B2]/30 rounded-full px-5 py-2.5">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 14C4 14 6 6 10 6C14 6 16 14 16 14" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M14 12L16 14L18 12" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm font-semibold text-[#67E8F9]">Correlated</span>
            <span className="text-sm text-[#A1A1AA]">with</span>
            <span className="text-sm font-bold text-white bg-[#0891B2]/20 px-2.5 py-0.5 rounded-full">98.7% confidence</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
