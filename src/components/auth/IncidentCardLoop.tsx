'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface Incident {
  title: string;
  detail: string;
  time: string;
  confidence: string;
}

const INCIDENTS: Incident[] = [
  {
    title: 'Stripe EU — latency spike',
    detail: 'Payment API response times elevated 340% above baseline.',
    time: '14:02 UTC',
    confidence: '94%',
  },
  {
    title: 'Auth0 — intermittent 502s',
    detail: 'Identity provider returning gateway errors for token endpoints.',
    time: '13:47 UTC',
    confidence: '97%',
  },
  {
    title: 'OpenAI — elevated error rate',
    detail: 'Chat completions API returning 429 rate-limit errors.',
    time: '13:31 UTC',
    confidence: '91%',
  },
];

export function IncidentCardLoop() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show each incident for 3s, then fade out, switch, fade in
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % INCIDENTS.length);
        setVisible(true);
      }, 400);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const incident = INCIDENTS[currentIndex];

  return (
    <div className="bg-[#131318] rounded-xl p-4 border border-[#0891B2]/20 mt-4 min-h-[108px]">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              <span className="text-xs font-semibold text-white/90 uppercase tracking-wide">
                Incident detected
              </span>
            </div>
            <p className="text-[13px] text-white/80 leading-snug font-medium">
              {incident.title}
            </p>
            <p className="text-[12px] text-white/50 leading-snug mt-1">
              {incident.detail}
            </p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="font-mono text-[11px] text-white/30">
                {incident.time}
              </span>
              <span className="text-[11px] font-medium text-[#0891B2]">
                Confidence: {incident.confidence}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
