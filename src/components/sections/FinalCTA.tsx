'use client';
import { motion } from 'framer-motion';
import { StatusDot } from '@/components/StatusDot';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const DEMO_VENDORS = [
  { name: 'Stripe', latency: '124ms', status: 'up' as const, color: '#635BFF' },
  { name: 'Auth0', latency: '342ms', status: 'degraded' as const, color: '#EB5424' },
  { name: 'Vercel', latency: '48ms', status: 'up' as const, color: '#FFFFFF' },
];

export function FinalCTA() {
  return (
    <section className="bg-[#0A0A0F] py-32 relative overflow-hidden">
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

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            Stop guessing. Start proving.
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            The next time a vendor takes down your service, you&apos;ll have the
            evidence to claim your credits.
          </p>
        </motion.div>

        {/* Mini Demo */}
        <motion.div
          className="max-w-lg mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <div className="rounded-2xl border border-white/10 bg-[#131318] overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-[10px] h-[10px] rounded-full bg-white/10" />
                <div className="w-[10px] h-[10px] rounded-full bg-white/10" />
                <div className="w-[10px] h-[10px] rounded-full bg-white/10" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs text-white/30 font-mono">reliastra.com/dashboard</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-0">
              {DEMO_VENDORS.map((vendor) => (
                <div
                  key={vendor.name}
                  className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: vendor.color === '#FFFFFF' ? '#0891B2' : vendor.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-white">{vendor.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white/60">{vendor.latency}</span>
                    <StatusDot status={vendor.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4, ease }}
        >
          <a
            href="/register"
            className="inline-block bg-white text-[#0A0A0F] px-8 py-4 rounded-[10px] font-semibold text-base hover:bg-white/90 transition-colors"
          >
            Start Free Today
          </a>
          <p className="text-white/40 text-xs mt-4">
            Free for up to 5 vendors · No credit card required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
