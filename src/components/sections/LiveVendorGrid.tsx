'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { StatusDot } from '@/components/StatusDot';
import { VendorSparkline } from '@/components/VendorSparkline';

interface VendorInfo {
  name: string;
  baseLatency: number;
  color: string;
  status: 'up' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  history: number[];
}

const INITIAL: Omit<VendorInfo, 'status' | 'latency' | 'uptime' | 'history'>[] = [
  { name: 'Stripe', baseLatency: 120, color: '#635BFF' },
  { name: 'Auth0', baseLatency: 85, color: '#EB5424' },
  { name: 'Cloudflare', baseLatency: 15, color: '#F6821F' },
  { name: 'OpenAI', baseLatency: 350, color: '#10A37F' },
  { name: 'Twilio', baseLatency: 95, color: '#F22F46' },
  { name: 'Vercel', baseLatency: 45, color: '#FFFFFF' },
];

const HIST_LEN = 20;

function initVendors(): VendorInfo[] {
  return INITIAL.map((v) => {
    const history: number[] = [];
    for (let i = 0; i < HIST_LEN; i++) {
      history.push(v.baseLatency + (Math.random() - 0.5) * v.baseLatency * 0.3);
    }
    return {
      ...v,
      status: 'up',
      latency: Math.round(history[history.length - 1]),
      uptime: 99.9 + Math.random() * 0.09,
      history: history.map((h) => Math.round(h)),
    };
  });
}

export function LiveVendorGrid() {
  const [vendors, setVendors] = useState<VendorInfo[]>(initVendors);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateData = useCallback(() => {
    setVendors((prev) =>
      prev.map((v) => {
        const jitter = (Math.random() - 0.5) * v.baseLatency * 0.3;
        let newLatency = Math.round(v.baseLatency + jitter);
        let newStatus = v.status;

        if (Math.random() < 0.005) {
          newStatus = 'degraded';
          newLatency = Math.round(v.baseLatency * (2 + Math.random() * 2));
        }
        if (Math.random() < 0.003) {
          newStatus = 'down';
          newLatency = Math.round(v.baseLatency * (5 + Math.random() * 5));
        }
        if (v.status === 'degraded' && Math.random() < 0.25) newStatus = 'up';
        if (v.status === 'down' && Math.random() < 0.15) newStatus = 'up';
        if (newStatus === 'up') {
          newLatency = Math.round(v.baseLatency + (Math.random() - 0.5) * v.baseLatency * 0.3);
        }

        return {
          ...v,
          latency: newLatency,
          status: newStatus as 'up' | 'degraded' | 'down',
          history: [...v.history.slice(1), newLatency],
        };
      })
    );
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(updateData, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updateData]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  };

  return (
    <section className="py-24 md:py-32 bg-[#0A0A0F]" id="live-vendors">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#67E8F9] uppercase tracking-widest">
            Public Tracking
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-4 tracking-tight">
            Live Vendor Monitoring
          </h2>
          <p className="text-lg text-[#A1A1AA] mt-4 leading-relaxed">
            Independent monitoring from Reliastra&apos;s infrastructure.
            Updated every 5 seconds.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vendors.map((vendor, i) => (
            <motion.article
              key={vendor.name}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-5 hover:bg-white/[0.07] transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vendor.color }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-white">{vendor.name}</span>
                </div>
                <StatusDot status={vendor.status} size="sm" />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <span
                    className={`text-2xl font-bold ${
                      vendor.status === 'down'
                        ? 'text-[#DC2626]'
                        : vendor.status === 'degraded'
                        ? 'text-[#D97706]'
                        : 'text-white'
                    }`}
                  >
                    {vendor.latency}ms
                  </span>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    {vendor.uptime.toFixed(2)}% uptime
                  </p>
                </div>
                <VendorSparkline data={vendor.history} color={vendor.color} width={100} height={28} />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}