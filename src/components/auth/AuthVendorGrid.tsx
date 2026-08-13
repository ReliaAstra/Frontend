'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MiniSparkline } from './MiniSparkline';

type VendorStatus = 'up' | 'degraded' | 'down';

interface VendorData {
  name: string;
  baseLatency: number;
  status: VendorStatus;
  color: string;
  history: number[];
}

const VENDOR_COLORS: Record<string, string> = {
  Stripe: '#635BFF',
  Auth0: '#EB5424',
  Cloudflare: '#F6821F',
  OpenAI: '#10A37F',
};

function generateHistory(base: number, variance: number): number[] {
  return Array.from({ length: 20 }, () =>
    Math.round(base + (Math.random() - 0.5) * variance)
  );
}

function initVendors(): VendorData[] {
  return [
    {
      name: 'Stripe',
      baseLatency: 142,
      status: 'up',
      color: VENDOR_COLORS.Stripe,
      history: generateHistory(142, 20),
    },
    {
      name: 'Auth0',
      baseLatency: 287,
      status: 'degraded',
      color: VENDOR_COLORS.Auth0,
      history: generateHistory(287, 80),
    },
    {
      name: 'Cloudflare',
      baseLatency: 89,
      status: 'up',
      color: VENDOR_COLORS.Cloudflare,
      history: generateHistory(89, 12),
    },
    {
      name: 'OpenAI',
      baseLatency: 4200,
      status: 'down',
      color: VENDOR_COLORS.OpenAI,
      history: generateHistory(4200, 1500),
    },
  ];
}

const STATUS_DOT: Record<VendorStatus, string> = {
  up: '#16A34A',
  degraded: '#D97706',
  down: '#DC2626',
};

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

export function AuthVendorGrid() {
  const [vendors, setVendors] = useState<VendorData[]>(initVendors);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusShiftRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Latency tick every 3s
  const tickLatency = useCallback(() => {
    setVendors((prev) =>
      prev.map((v) => {
        const variance = v.name === 'OpenAI' ? 1500 : v.status === 'degraded' ? 80 : 20;
        const newLatency = Math.max(1, v.baseLatency + (Math.random() - 0.5) * variance);
        const newHistory = [...v.history.slice(1), Math.round(newLatency)];
        return { ...v, history: newHistory };
      })
    );
  }, []);

  // Status shift every 7s (probability-based)
  const shiftStatus = useCallback(() => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.name === 'OpenAI') {
          // Volatile: stays red or amber
          const r = Math.random();
          return { ...v, status: r < 0.5 ? 'down' : 'degraded' };
        }
        if (v.name === 'Auth0') {
          // Mostly degraded, occasionally recovers
          const r = Math.random();
          if (r < 0.2) return { ...v, status: 'up' as VendorStatus };
          return { ...v, status: 'degraded' as VendorStatus };
        }
        // Stripe & Cloudflare: stable up with rare blip
        const r = Math.random();
        if (r < 0.05) return { ...v, status: 'degraded' as VendorStatus };
        return { ...v, status: 'up' as VendorStatus };
      })
    );
  }, []);

  useEffect(() => {
    tickRef.current = setInterval(tickLatency, 3000);
    statusShiftRef.current = setInterval(shiftStatus, 7000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
      if (statusShiftRef.current) clearInterval(statusShiftRef.current);
    };
  }, [tickLatency, shiftStatus]);

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 w-full"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {vendors.map((vendor) => {
        const dotColor = STATUS_DOT[vendor.status];
        const currentLatency = vendor.history[vendor.history.length - 1];

        return (
          <motion.div
            key={vendor.name}
            variants={staggerItem}
            className="bg-[#131318] rounded-xl p-3.5 border border-white/5 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: vendor.color }}
                />
                <span className="text-xs font-semibold text-white truncate">
                  {vendor.name}
                </span>
              </div>
              <span className="relative flex h-2 w-2">
                {vendor.status !== 'down' && (
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: dotColor }}
                />
              </span>
            </div>
            <span
              className="font-mono text-lg font-bold text-white"
              style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}
            >
              {formatLatency(currentLatency)}
            </span>
            <MiniSparkline
              data={vendor.history}
              color={vendor.color}
              width={120}
              height={28}
              isDegraded={vendor.status === 'degraded' || vendor.status === 'down'}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
