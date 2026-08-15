'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

const ease = [0.25, 0.1, 0.25, 1] as const;

/* Animated number counter: waits for `start` signal */
function AnimatedNumber({ target, suffix = '', start = false }: { target: number; suffix?: string; start?: boolean }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => Math.round(v));
  const [text, setText] = useState('0');

  useEffect(() => {
    const unsub = display.on('change', (v) => setText(String(v)));
    return unsub;
  }, [display]);

  useEffect(() => {
    if (!start) return;
    const ctrl = animate(count, target, {
      duration: 0.8,
      type: 'spring',
      stiffness: 120,
      damping: 18,
    });
    return () => ctrl.stop();
  }, [start, target, count]);

  return <span>{text}{suffix}</span>;
}

/* ── Phase enum for the animation loop ── */
type Phase = 'init' | 'header' | 'service' | 'deps' | 'stripe-flash' | 'verdict' | 'button-glow';

const PHASE_ORDER: Phase[] = ['init', 'header', 'service', 'deps', 'stripe-flash', 'verdict', 'button-glow'];

const PHASE_MS: Record<Phase, number> = {
  init: 300,
  header: 300,
  service: 300,
  deps: 300,
  'stripe-flash': 300,
  verdict: 300,
  'button-glow': 3900,
};

function phaseIndex(ph: Phase) {
  return PHASE_ORDER.indexOf(ph);
}

export function IncidentCorrelationCard() {
  const [phase, setPhase] = useState<Phase>('init');
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const [skipAnimation] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Derived visibility booleans
  const headerVisible = useMemo(() => skipAnimation || phaseIndex(phase) >= phaseIndex('header'), [phase, skipAnimation]);
  const serviceVisible = useMemo(() => skipAnimation || phaseIndex(phase) >= phaseIndex('service'), [phase, skipAnimation]);
  const depsVisible = useMemo(() => skipAnimation || phaseIndex(phase) >= phaseIndex('deps'), [phase, skipAnimation]);
  const stripeFlashVisible = useMemo(() => skipAnimation || phaseIndex(phase) >= phaseIndex('stripe-flash'), [phase, skipAnimation]);
  const verdictVisible = useMemo(() => skipAnimation || phaseIndex(phase) >= phaseIndex('verdict'), [phase, skipAnimation]);
  const buttonGlowActive = phase === 'button-glow';
  const stripeFlashActive = phase === 'stripe-flash';

  const advance = useCallback((ph: Phase) => {
    const ms = skipAnimation ? 0 : PHASE_MS[ph];
    timerRef.current = setTimeout(() => {
      const idx = phaseIndex(ph);
      if (idx >= 0 && idx < PHASE_ORDER.length - 1) {
        setPhase(PHASE_ORDER[idx + 1]);
      } else if (ph === 'button-glow') {
        timerRef.current = setTimeout(() => {
          setPhase('init');
          setCycle((c) => c + 1);
        }, 1500);
      }
    }, ms);
  }, [skipAnimation]);

  useEffect(() => {
    if (phase === 'init') {
      timerRef.current = setTimeout(() => setPhase('header'), skipAnimation ? 0 : 300);
      return () => clearTimeout(timerRef.current);
    }
    advance(phase);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [phase, cycle, advance]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cycle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-[#E4E4E7] shadow-[0_4px_24px_rgba(0,0,0,0.06)] w-full max-w-[440px] mx-auto md:mx-0"
        style={{ padding: 'clamp(20px, 4vw, 32px)' }}
      >
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={headerVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">
            Reliastra Incident #1842
          </p>
          <h3 className="text-[18px] font-bold text-[#09090B] mt-1 leading-tight">
            Checkout degradation
          </h3>
          <p className="text-[13px] font-medium text-[#A1A1AA] mt-1" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            14:02 UTC to 14:25 UTC
          </p>
        </motion.div>

        <hr className="border-0 h-px bg-[#E4E4E7] my-4" />

        {/* ── Your Service ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={serviceVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0891B2] mb-2">
            Your Service
          </p>
          <p className="text-[14px] font-medium text-[#09090B]">checkout.example.com</p>
          <p className="text-[13px] mt-1" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
            <span className="text-[#A1A1AA]">Error rate&nbsp;</span>
            <span className="text-[#A1A1AA]">0.4%</span>
            <span className="text-[#D97706]">&nbsp;→&nbsp;</span>
            <span className="text-[#DC2626]">18.7%</span>
          </p>
        </motion.div>

        <hr className="border-0 h-px bg-[#E4E4E7] my-4" />

        {/* ── Dependencies ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={depsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.3, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA] mb-3">
            Dependencies
          </p>

          {/* Stripe / EU */}
          <motion.div
            className="rounded-lg transition-colors duration-500 -mx-1 px-1 py-1"
            animate={stripeFlashActive ? { backgroundColor: 'rgba(220,38,38,0.05)' } : { backgroundColor: 'rgba(220,38,38,0)' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[14px] font-medium text-[#09090B]">Stripe / EU</p>
            <p className="text-[13px] mt-1" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Latency&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-[#A1A1AA]">420ms</span>
              <span className="text-[#D97706]">&nbsp;→&nbsp;</span>
              <span className="text-[#DC2626]">8.4s</span>
            </p>
            <p className="text-[13px] mt-0.5" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Errors&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-[#A1A1AA]">0.3%</span>
              <span className="text-[#D97706]">&nbsp;→&nbsp;</span>
              <span className="text-[#DC2626]">17.1%</span>
            </p>
          </motion.div>

          {/* Cloudflare */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={depsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 0.1, ease }}
            className="mt-3"
          >
            <p className="text-[14px] font-medium text-[#09090B]">Cloudflare</p>
            <p className="text-[13px] mt-1" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-[#16A34A]">Normal</span>
            </p>
          </motion.div>

          {/* Database */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={depsVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.3, delay: 0.2, ease }}
            className="mt-3"
          >
            <p className="text-[14px] font-medium text-[#09090B]">Database</p>
            <p className="text-[13px] mt-1" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Status&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <span className="text-[#16A34A]">Normal</span>
            </p>
          </motion.div>
        </motion.div>

        <hr className="border-0 h-px bg-[#E4E4E7] my-4" />

        {/* ── Likely Contributing Dependency ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={verdictVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0891B2] mb-2">
            Likely Contributing Dependency
          </p>
          <p className="text-[16px] font-bold text-[#09090B]">Stripe / EU</p>

          <div className="mt-3 space-y-1">
            <p className="text-[13px] flex justify-between" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Confidence</span>
              <span className="text-[#16A34A] font-semibold">HIGH</span>
            </p>
            <p className="text-[13px] flex justify-between" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Temporal correlation</span>
              <span className="text-[#09090B]">
                <AnimatedNumber target={94} suffix="%" start={verdictVisible} />
              </span>
            </p>
            <p className="text-[13px] flex justify-between" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
              <span className="text-[#A1A1AA]">Regional correlation</span>
              <span className="text-[#09090B]">
                <AnimatedNumber target={91} suffix="%" start={verdictVisible} />
              </span>
            </p>
          </div>
        </motion.div>

        {/* ── CTA Button ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={verdictVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          className="mt-5"
        >
          <motion.button
            className="w-full bg-[#0891B2] text-white py-3 rounded-[10px] font-semibold text-[14px] text-center cursor-pointer hover:bg-[#0E7490] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0891B2] focus-visible:ring-offset-2"
            animate={buttonGlowActive
              ? {
                  boxShadow: [
                    '0 0 20px rgba(8,145,178,0.3)',
                    '0 0 40px rgba(8,145,178,0.15)',
                    '0 0 20px rgba(8,145,178,0.3)',
                  ],
                }
              : { boxShadow: '0 0 0px rgba(8,145,178,0)' }
            }
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            aria-label="Generate Evidence Report for incident #1842"
          >
            Generate Evidence Report
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
