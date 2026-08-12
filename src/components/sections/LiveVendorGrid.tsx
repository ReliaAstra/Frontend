'use client';
import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { VendorSparkline } from '@/components/VendorSparkline';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface Vendor {
  name: string;
  color: string;
  baseLatency: number;
  status: 'up' | 'degraded' | 'down';
  latency: number;
  history: number[];
  uptime: number;
  statusWeights: { up: number; amber: number; red: number };
}

const HISTORY_LENGTH = 20;

const INITIAL_VENDORS: Omit<Vendor, 'status' | 'latency' | 'history' | 'uptime'>[] = [
  { name: 'Auth0', color: '#EB5424', baseLatency: 85, statusWeights: { up: 80, amber: 15, red: 5 } },
  { name: 'Twilio', color: '#F22F46', baseLatency: 95, statusWeights: { up: 85, amber: 10, red: 5 } },
  { name: 'Stripe', color: '#635BFF', baseLatency: 120, statusWeights: { up: 95, amber: 4, red: 1 } },
  { name: 'Cloudflare', color: '#F6821F', baseLatency: 15, statusWeights: { up: 97, amber: 2.5, red: 0.5 } },
  { name: 'OpenAI', color: '#10A37F', baseLatency: 350, statusWeights: { up: 96, amber: 3, red: 1 } },
  { name: 'Vercel', color: '#FFFFFF', baseLatency: 45, statusWeights: { up: 97, amber: 2.5, red: 0.5 } },
];

function initVendors(): Vendor[] {
  return INITIAL_VENDORS.map((v) => {
    const history: number[] = [];
    for (let i = 0; i < HISTORY_LENGTH; i++) {
      history.push(v.baseLatency + (Math.random() - 0.5) * v.baseLatency * 0.3);
    }
    const latency = Math.round(history[history.length - 1]);
    return {
      ...v,
      status: 'up',
      latency,
      history: history.map((h) => Math.round(h)),
      uptime: 99.9 + Math.random() * 0.09,
    };
  });
}

function pickStatus(weights: { up: number; amber: number; red: number }): Vendor['status'] {
  const rand = Math.random() * 100;
  if (rand < weights.red) return 'down';
  if (rand < weights.red + weights.amber) return 'degraded';
  return 'up';
}

export function LiveVendorGrid() {
  const [vendors, setVendors] = useState<Vendor[]>(initVendors);

  const tickLatency = useCallback(() => {
    setVendors((prev) =>
      prev.map((v) => {
        const jitter = (Math.random() - 0.5) * v.baseLatency * 0.3;
        const newLatency = Math.round(v.baseLatency + jitter);
        const newHistory = [...v.history.slice(1), newLatency];
        return {
          ...v,
          latency: newLatency,
          history: newHistory,
        };
      })
    );
  }, []);

  const tickStatus = useCallback(() => {
    setVendors((prev) =>
      prev.map((v) => ({
        ...v,
        status: pickStatus(v.statusWeights),
      }))
    );
  }, []);

  // Tick latency every 3 seconds
  useEffect(() => {
    const id = setInterval(tickLatency, 3000);
    return () => clearInterval(id);
  }, [tickLatency]);

  // Tick status every 5 seconds
  useEffect(() => {
    const id = setInterval(tickStatus, 5000);
    return () => clearInterval(id);
  }, [tickStatus]);

  return (
    <section className="bg-[#0A0A0F] py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-4">
            LIVE PUBLIC TRACKING
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
            What&apos;s actually happening right now.
          </h2>
          <p className="text-white/50 max-w-xl mx-auto">
            Independent monitoring from Reliastra&apos;s infrastructure. Updated every 5 seconds.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor, i) => {
            const statusColor =
              vendor.status === 'up'
                ? 'bg-[#16A34A]'
                : vendor.status === 'degraded'
                ? 'bg-[#D97706]'
                : 'bg-[#DC2626]';

            return (
              <motion.a
                key={vendor.name}
                href={`/track/${vendor.name.toLowerCase()}`}
                className="block bg-[#131318] rounded-2xl p-6 border border-white/5 transition-all duration-300 hover:-translate-y-4 hover:border-[#0891B2]/20 hover:shadow-[0_0_0_1px_#0891B2,0_0_60px_rgba(8,145,178,0.12)]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
                aria-label={`${vendor.name} status: ${vendor.status}, ${vendor.latency}ms latency`}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: vendor.color }}
                      aria-hidden="true"
                    />
                    <span className="font-semibold text-sm text-white">
                      {vendor.name}
                    </span>
                  </div>
                  <span className="relative flex h-2 w-2">
                    {vendor.status === 'up' && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                    )}
                    <span
                      className={cn(
                        'relative inline-flex rounded-full h-2 w-2',
                        statusColor
                      )}
                    />
                  </span>
                </div>

                {/* Latency */}
                <div className="mb-4">
                  <span className="font-mono text-3xl font-bold text-white">
                    {vendor.latency}
                  </span>
                  <span className="text-white/40 text-sm ml-1">ms</span>
                </div>

                {/* Sparkline */}
                <div className="mb-4">
                  <VendorSparkline
                    data={vendor.history}
                    color={vendor.color === '#FFFFFF' ? '#0891B2' : vendor.color}
                    width={240}
                    height={40}
                  />
                </div>

                {/* Uptime */}
                <p className="text-white/40 text-xs">
                  24h Uptime: {vendor.uptime.toFixed(2)}%
                </p>
              </motion.a>
            );
          })}
        </div>

        {/* Bottom */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
        >
          <span className="font-mono text-xs text-white/30">
            Last updated: just now · Refreshes automatically
          </span>
          <a
            href="/track"
            className="border border-white/20 text-white px-6 py-2.5 rounded-[10px] font-medium text-sm hover:bg-white/5 transition-colors"
          >
            Explore Public Tracking
          </a>
        </motion.div>
      </div>
    </section>
  );
}
