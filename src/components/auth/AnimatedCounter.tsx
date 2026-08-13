'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Parses a formatted number string like "12,847" into a numeric value.
 */
function parseFormattedValue(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
}

/**
 * Formats a number back to the original display format (commas).
 */
function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

/** Spring easing function — overshoots then settles. */
function springEase(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
      ? 1
      : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(parseFormattedValue(value));
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplay(formatNumber(targetRef.current));
      return;
    }

    const target = targetRef.current;
    const duration = 2000; // 2s
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = springEase(progress);
      const current = target * eased;
      setDisplay(formatNumber(current));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(formatNumber(target));
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return (
    <span className={className} aria-label={value}>
      {display}
    </span>
  );
}
