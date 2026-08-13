'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MiniSparkline } from './MiniSparkline';

const ease = [0.25, 0.1, 0.25, 1] as const;

type VendorStatus = 'up' | 'degraded' | 'down';

interface Vendor {
  name: string;
  baseLatency: number;
  displayLatency: string;
  status: VendorStatus;
  history: number[];
  color: string;
  unit: string;
}

const INITIAL_VENDORS: Vendor[] = [
  {
    name: 'Stripe',
    baseLatency: 142,
    displayLatency: '142ms',
    status: 'up',
    history: generateHistory(120, 165, 20),
    color: '#0891B2',
    unit: 'ms',
  },
  {
    name: 'Auth0',
    baseLatency: 287,
    displayLatency: '287ms',
    status: 'degraded',
    history: generateHistory(250, 320, 20),
    color: '#D97706',
    unit: 'ms',
  },
  {
    name: 'Cloudflare',
    baseLatency: 89,
    displayLatency: '89ms',
    status: 'up',
    history: generateHistory(70, 110, 20),
    color: '#0891B2',
    unit: 'ms',
  },
  {
    name: 'OpenAI',
    baseLatency: 4200,
    displayLatency: '4.2s',
    status: 'down',
    history: generateHistory(3500, 5000, 20),
    color: '#DC2626',
    unit: 's',
  },
];

function generateHistory(min: number, max: number, count: number): number[] {
  return Array.from({ length: count }, () =>
    Math.round(min + Math.random() * (max - min))
  );
}

const statusColors: Record<VendorStatus, string> = {
  up: '#16A34A',
  degraded: '#D97706',
  down: '#DC2626',
};

function tickLatency(vendor: Vendor): Vendor {
  const variance = vendor.baseLatency * 0.08;
  const newLatency = Math.round(vendor.baseLatency + (Math.random() - 0.5) * 2 * variance);
  const newHistory = [...vendor.history.slice(1), newLatency];

  let displayLatency: string;
  if (vendor.unit === 's') {
    displayLatency = (newLatency / 1000).toFixed(1) + 's';
  } else {
    displayLatency = newLatency + 'ms';
  }

  return { ...vendor, displayLatency, history: newHistory };
}

function maybeChangeStatus(vendor: Vendor): Vendor {
  const roll = Math.random();
  if (roll < 0.05) {
    // 5% chance to go down
    return { ...vendor, status: 'down', color: '#DC2626' };
  } else if (roll < 0.15) {
    // 10% chance to go degraded
    return { ...vendor, status: 'degraded', color: '#D97706' };
  } else if (roll < 0.85) {
    // 70% chance to recover to up
    if (vendor.name === 'OpenAI') {
      // OpenAI stays volatile
      return { ...vendor, status: roll < 0.5 ? 'down' : 'degraded', color: roll < 0.5 ? '#DC2626' : '#D97706' };
    }
    return { ...vendor, status: 'up', color: '#0891B2' };
  }
  return vendor;
}

export function AuthVendorGrid() {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const frameRef = useRef<number>();

  // Tick latencies every 3 seconds
  const tick = useCallback(() => {
    setVendors((prev) => prev.map(tickLatency));
  }, []);

  // Status changes every 5-10 seconds
  const statusTick = useCallback(() => {
    setVendors((prev) => prev.map(maybeChangeStatus));
  }, []);

  useEffect(() => {
    const latencyInterval = setInterval(tick, 3000);
    const statusInterval = setInterval(statusTick, 7000);
    return () => {
      clearInterval(latencyInterval);
      clearInterval(statusInterval);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [tick, statusTick]);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-5">
        Live vendor monitoring
      </p>
      <div className="grid grid-cols-2 gap-3">
        {vendors.map((vendor, i) => {
          const dotColor = statusColors[vendor.status];
          const isDegraded = vendor.status === 'degraded';
          const isDown = vendor.status === 'down';

          return (
            <motion.div
              key={vendor.name}
              className="bg-[#131318] rounded-xl p-3.5 border border-white/5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1, ease }}
            >
              {/* Vendor name + status dot */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-[13px] font-medium text-white/80">
                  {vendor.name}
                </span>
              </div>

              {/* Latency value */}
              <div className="flex items-baseline gap-1 mb-2">
                <span
                  className="font-mono text-[15px] font-medium text-white tabular-nums"
                  style={{ color: isDown ? '#DC2626' : isDegraded ? '#D97706' : '#FFFFFF' }}
                >
                  {vendor.displayLatency}
                </span>
              </div>

              {/* Sparkline */}
              <MiniSparkline
                data={vendor.history}
                color={vendor.color}
                width={80}
                height={28}
                isDegraded={isDegraded || isDown}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Incident Card (shared) ───────────────────────────────── */

export function AuthIncidentCard() {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="incident"
        className="bg-[#131318] rounded-xl p-4 border border-[#0891B2]/20 mt-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
            Incident detected
          </span>
        </div>
        <p className="text-[13px] text-white/60 leading-snug">
          Stripe EU — latency spike
        </p>
        <div className="flex items-center justify-between mt-2.5">
          <span className="font-mono text-[11px] text-white/30">
            14:02 UTC
          </span>
          <span className="text-[11px] font-medium text-[#0891B2]">
            Confidence: 94%
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
