'use client';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const TOTAL = 25;
const REMAINING = 17;
const CLAIMED = 8;

export function FoundingSpotCounter() {
  // Count DOWN from 25 (total) to remaining with spring physics
  const count = useMotionValue(TOTAL);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(TOTAL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [rounded]);

  useEffect(() => {
    // Small delay for dramatic effect
    const timer = setTimeout(() => {
      setMounted(true);
      animate(count, REMAINING, {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [count]);

  return (
    <div className="space-y-4">
      {/* Counter number */}
      <div className="text-center">
        <span className="text-7xl font-bold text-white" aria-label={`${displayValue} spots remaining`}>
          {displayValue}
        </span>
        <span className="text-lg text-[#A1A1AA] ml-1">of {TOTAL} spots remaining</span>
      </div>

      {/* Dot progress - 25 dots, 10px each. Claimed dots have pulse animation. */}
      <div className="flex justify-center gap-1.5 flex-wrap" aria-label={`${CLAIMED} of ${TOTAL} spots claimed`}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <motion.div
            key={i}
            className={i < CLAIMED ? 'relative' : ''}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: mounted ? 0.1 + i * 0.04 : 0, duration: 0.3 }}
          >
            <motion.div
              className="w-[10px] h-[10px] rounded-full"
              style={{
                backgroundColor: i < CLAIMED ? '#0891B2' : 'rgba(255,255,255,0.1)',
              }}
              animate={i < CLAIMED && mounted ? {
                boxShadow: [
                  '0 0 0 0 rgba(8,145,178,0.4)',
                  '0 0 0 4px rgba(8,145,178,0)',
                ],
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
                delay: i * 0.15,
              }}
            />
          </motion.div>
        ))}
      </div>

      <p className="text-center text-sm text-[#A1A1AA]">
        {CLAIMED} founding customers already onboarded
      </p>
    </div>
  );
}
