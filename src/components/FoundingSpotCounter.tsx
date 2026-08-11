'use client';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface SpotData {
  total: number;
  remaining: number;
  claimed: number;
}

export function FoundingSpotCounter() {
  const [data, setData] = useState<SpotData | null>(null);
  // Start from 25 (total) and count DOWN to remaining
  const count = useMotionValue(25);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(25);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    fetch('/api/founding-spots')
      .then((res) => res.json())
      .then((json: SpotData) => {
        setData(json);
        // Count DOWN from 25 (total) to remaining with spring physics
        animate(count, json.remaining, {
          type: 'spring',
          stiffness: 100,
          damping: 15,
        });
      })
      .catch(() => {
        const fallback: SpotData = { total: 25, remaining: 17, claimed: 8 };
        setData(fallback);
        animate(count, fallback.remaining, {
          type: 'spring',
          stiffness: 100,
          damping: 15,
        });
      });
  }, [count]);

  if (!data) {
    return (
      <div className="flex items-center justify-center gap-4 py-6">
        <div className="w-6 h-6 border-2 border-[#0891B2]/30 border-t-[#0891B2] rounded-full animate-spin" />
        <span className="text-sm text-[#A1A1AA]">Loading founding program…</span>
      </div>
    );
  }

  const segments = data.total;
  const filled = data.claimed;

  return (
    <div className="space-y-4">
      {/* Counter number */}
      <div className="text-center">
        <span className="text-7xl font-bold text-white" aria-label={`${displayValue} spots remaining`}>
          {displayValue}
        </span>
        <span className="text-lg text-[#A1A1AA] ml-1">of {data.total} spots remaining</span>
      </div>

      {/* Dot progress - 25 dots, 10px each */}
      <div className="flex justify-center gap-1.5 flex-wrap" aria-label={`${data.claimed} of ${data.total} spots claimed`}>
        {Array.from({ length: segments }, (_, i) => (
          <motion.div
            key={i}
            className="w-[10px] h-[10px] rounded-full"
            style={{
              backgroundColor: i < filled ? '#0891B2' : 'rgba(255,255,255,0.1)',
            }}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          />
        ))}
      </div>

      <p className="text-center text-sm text-[#A1A1AA]">
        {data.claimed} founding customers already onboarded
      </p>
    </div>
  );
}
