'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Incident {
  title: string;
  detail: string;
  time: string;
  confidence: number;
}

const INCIDENTS: Incident[] = [
  {
    title: 'Stripe API latency spike detected',
    detail: 'Payment checkout latency exceeded 800ms threshold across 3 regions.',
    time: '2 min ago',
    confidence: 94,
  },
  {
    title: 'Auth0 token endpoint degraded',
    detail: 'IDP token issuance time increased 340% correlating with US-East-1 issues.',
    time: '8 min ago',
    confidence: 87,
  },
  {
    title: 'OpenAI API returning 5xx errors',
    detail: 'GPT-4 completions endpoint returning intermittent 502/503 errors.',
    time: '14 min ago',
    confidence: 91,
  },
];

export function IncidentCardLoop() {
  const [index, setIndex] = useState(0);
  const incident = INCIDENTS[index];

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % INCIDENTS.length);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#131318] rounded-xl p-4 border border-white/5 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            {/* Red pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-red-400">
              Incident detected
            </span>
          </div>
          <h3 className="text-sm font-semibold text-white mb-1 leading-snug">
            {incident.title}
          </h3>
          <p className="text-xs text-white/50 leading-relaxed mb-3">
            {incident.detail}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-white/30 font-mono">{incident.time}</span>
            <span className="text-[11px] text-white/50">
              <span className="text-[#0891B2] font-semibold">{incident.confidence}%</span> confidence
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
