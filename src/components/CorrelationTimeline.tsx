'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CYCLE_MS = 6000;

export function CorrelationTimeline() {
  const [phase, setPhase] = useState(0);
  // phase 0: idle/reset (brief fade-out)
  // phase 1: Your Service red block slides in (0-600ms)
  // phase 2: Stripe API red block slides in (600-1200ms)
  // phase 3: Arrow draws (1200-2400ms)
  // phase 4: Confidence badge bounces in (2400-3000ms)
  // phase 5: Hold (3000-6000ms)

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const clearAll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    // Also clear the orphaned timeouts from the interval callback
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  }, [timeoutsRef]);

  const schedulePhases = useCallback(() => {
    clearAll();
    timeoutsRef.current.push(
      setTimeout(() => setPhase(1), 50),
      setTimeout(() => setPhase(2), 600),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(() => setPhase(4), 2400),
      setTimeout(() => setPhase(5), 3000),
    );
  }, [clearAll, timeoutsRef]);

  const scheduleCycle = useCallback(() => {
    setPhase(0);
    timerRef.current = setTimeout(schedulePhases, 150);
  }, [schedulePhases]);

  const scheduleNextCycle = useCallback(() => {
    timerRef.current = setTimeout(scheduleCycle, CYCLE_MS);
  }, [scheduleCycle]);

  useEffect(() => {
    schedulePhases();
    timerRef.current = setTimeout(scheduleNextCycle, CYCLE_MS);
    return () => clearAll();
  }, [schedulePhases, scheduleNextCycle, clearAll]);

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
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-[10px] text-[#A1A1AA] font-mono">API Error Rate: 12.4%</span>
              </div>
              <AnimatePresence>
                {(phase >= 1 && phase <= 5) && (
                  <motion.div
                    key="your-service-block"
                    className="absolute inset-y-0 left-[30%] w-24 bg-[#DC2626]/80 rounded-full"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stripe API track */}
          <div className="flex items-center gap-4">
            <div className="w-28 text-right text-xs text-[#67E8F9] font-mono">14:32:06</div>
            <div className="flex-1 relative h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-[10px] text-[#A1A1AA] font-mono">5xx Errors Detected</span>
              </div>
              <AnimatePresence>
                {(phase >= 2 && phase <= 5) && (
                  <motion.div
                    key="stripe-api-block"
                    className="absolute inset-y-0 left-[28%] w-24 bg-[#DC2626]/80 rounded-full"
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* SVG curved arrow that draws itself */}
        <div className="flex justify-center -mt-2">
          <AnimatePresence>
            {(phase >= 3 && phase <= 5) && (
              <motion.svg
                key="correlation-arrow"
                width="120"
                height="60"
                viewBox="0 0 120 60"
                fill="none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.path
                  d="M 20 10 C 50 -10, 90 20, 100 45"
                  stroke="#0891B2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                />
                <motion.path
                  d="M 94 40 L 100 46 L 106 38"
                  stroke="#0891B2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>

        {/* Correlation confidence badge */}
        <div className="flex items-center justify-center mt-2">
          <AnimatePresence>
            {(phase >= 4 && phase <= 5) && (
              <motion.div
                key="confidence-badge"
                className="flex items-center gap-3 bg-[#0891B2]/20 border border-[#0891B2]/30 rounded-full px-4 py-2"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 14C4 14 6 6 10 6C14 6 16 14 16 14" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M14 12L16 14L18 12" stroke="#0891B2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-semibold text-[#67E8F9]">Correlated</span>
                <span className="text-sm text-[#A1A1AA]">with</span>
                <span className="text-sm font-bold text-white">94% confidence</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
