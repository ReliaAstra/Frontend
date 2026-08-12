'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Search, Home } from 'lucide-react';
import { Navbar } from '@/components/sections/Navbar';
import Link from 'next/link';

/* ── Animated counter for the 404 number ── */
function AnimatedCounter({ target }: { target: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [text, setText] = useState('0');

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setText(String(v)));
    return unsub;
  }, [rounded]);

  useEffect(() => {
    const ctrl = animate(count, target, {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
    });
    return () => ctrl.stop();
  }, [target, count]);

  return <span>{text}</span>;
}

/* ── Floating "lost packet" particles ── */
function LostPackets() {
  const packets = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    duration: 6 + Math.random() * 8,
    delay: Math.random() * 4,
    drift: -20 + Math.random() * 40,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {packets.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.15, 0.3, 0.15, 0],
            y: [0, -30 + p.drift, 0],
            x: [0, p.drift * 0.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, rgba(8,145,178,0.6) 0%, rgba(8,145,178,0) 70%)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* ── Radar scan animation ── */
function RadarScan() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Expanding rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#0891B2]/20"
          style={{ width: 200 + i * 80, height: 200 + i * 80 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [0.8, 1.2],
          }}
          transition={{
            duration: 3,
            delay: i * 1,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Rotating sweep line */}
      <motion.div
        className="absolute"
        style={{ width: 1, height: 180 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="w-full h-full origin-bottom"
          style={{
            background: 'linear-gradient(to top, rgba(8,145,178,0.3), transparent)',
          }}
        />
      </motion.div>
    </div>
  );
}

/* ── Glitch text effect on "404" ── */
function GlitchText() {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 200);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.span
      className="relative inline-block"
      animate={
        glitching
          ? {
              x: [0, -2, 3, -1, 0],
              textShadow: [
                '0 0 transparent',
                '2px 0 #DC2626, -2px 0 #0891B2',
                '-2px 0 #DC2626, 2px 0 #0891B2',
                '1px 0 #DC2626, -1px 0 #0891B2',
                '0 0 transparent',
              ],
            }
          : { x: 0, textShadow: '0 0 transparent' }
      }
      transition={{ duration: 0.2 }}
    >
      <AnimatedCounter target={404} />
    </motion.span>
  );
}

/* ── Status bar that "searches" for the page ── */
function StatusBar() {
  const messages = [
    'Scanning dependency graph...',
    'Checking vendor endpoints...',
    'Tracing route to destination...',
    'Page not found in any region.',
  ];
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgTimer = setInterval(() => {
      setMsgIndex((prev) => {
        const next = prev + 1;
        return next >= messages.length ? 0 : next;
      });
    }, 2000);
    return () => clearInterval(msgTimer);
  }, [messages.length]);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 2));
    }, 40);
    return () => clearInterval(progTimer);
  }, []);

  return (
    <motion.div
      className="bg-[#0A0A0F] rounded-xl border border-[#1E1E2A] p-4 max-w-md w-full mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        <span className="ml-2 text-[11px] text-[#A1A1AA] font-mono">reliastra — diagnostics</span>
      </div>

      {/* Message line */}
      <motion.p
        key={msgIndex}
        className="text-[13px] font-mono text-[#0891B2] mb-2 h-5"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[#A1A1AA]">$</span> {messages[msgIndex]}
      </motion.p>

      {/* Progress bar */}
      <div className="h-1 bg-[#1E1E2A] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#0891B2] rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.08, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

/* ── Main 404 Page ── */
export default function NotFound() {
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const variants = prefersReduced
    ? {
        container: { opacity: 1 },
        heading: { opacity: 1, y: 0 },
        sub: { opacity: 1, y: 0 },
        actions: { opacity: 1, y: 0 },
      }
    : {
        container: {},
        heading: { opacity: 0, y: 40 },
        sub: { opacity: 0, y: 30 },
        actions: { opacity: 0, y: 20 },
      };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center relative">
        {/* Background effects */}
        {!prefersReduced && (
          <>
            <LostPackets />
            <RadarScan />
            {/* Subtle radial gradient */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(8,145,178,0.06) 0%, transparent 100%)',
              }}
            />
          </>
        )}

        <div className="relative z-10 text-center px-6 max-w-lg mx-auto">
          {/* Big 404 */}
          <motion.div
            className="mb-6"
            initial={variants.heading}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="text-[120px] sm:text-[160px] lg:text-[200px] font-[800] leading-none tracking-[-0.04em] text-[#09090B] select-none">
              <GlitchText />
            </p>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-xl sm:text-2xl font-bold text-[#09090B] mb-2"
            initial={variants.sub}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Page not found
          </motion.p>

          <motion.p
            className="text-[15px] text-[#52525B] leading-relaxed mb-8 max-w-sm mx-auto"
            initial={variants.sub}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            This route doesn't exist in our dependency graph.
            We checked your vendors — this one's on us.
          </motion.p>

          {/* Terminal-style status bar */}
          <StatusBar />

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10"
            initial={variants.actions}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link
              href="/"
              className="group inline-flex items-center gap-2 bg-[#0A0A0F] text-white px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:shadow-xl transition-all duration-200"
              style={{ transitionProperty: 'transform, box-shadow' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
            >
              <Home className="w-4 h-4" />
              Back to Dashboard
            </Link>

            <Link
              href="/track"
              className="group inline-flex items-center gap-2 bg-white border border-[#E4E4E7] text-[#09090B] px-7 py-3.5 rounded-[10px] font-semibold text-sm hover:border-[#09090B] hover:bg-[#F8F9FA] transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Check Vendor Status
            </Link>
          </motion.div>

          {/* Subtle bottom hint */}
          <motion.p
            className="text-xs text-[#A1A1AA] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            Error code: <span className="font-mono text-[#52525B]">NOT_FOUND_404</span>
          </motion.p>
        </div>
      </main>
    </div>
  );
}
