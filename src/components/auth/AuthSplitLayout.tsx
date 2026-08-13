'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface AuthSplitLayoutProps {
  children: ReactNode;
  /** Content rendered below the vendor grid on the left panel (login-specific or register-specific) */
  leftPanelExtra?: ReactNode;
}

export function AuthSplitLayout({ children, leftPanelExtra }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT PANEL: Product Demo ────────────────────────── */}
      <motion.div
        className="hidden lg:flex relative w-full lg:w-[45%] bg-[#0A0A0F] grid-pattern flex-col justify-between overflow-hidden"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
        style={{
          boxShadow: 'inset -20px 0 40px rgba(0,0,0,0.3)',
        }}
      >
        {/* Wordmark */}
        <div className="px-8 pt-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0 group" aria-label="Reliastra home">
            <span className="text-white font-bold text-[20px] tracking-[-0.02em]">
              reliastra
            </span>
            <span className="text-[#0891B2] font-bold text-[20px]">.</span>
          </Link>
        </div>

        {/* Center content: Vendor grid + extras */}
        <div className="flex-1 flex flex-col justify-center px-8 py-0">
          <div className="max-w-sm mx-auto w-full">
            {leftPanelExtra}
          </div>
        </div>

        {/* Bottom: Trust signal */}
        <div className="px-8 pb-8">
          <div className="max-w-sm mx-auto">
            <p className="text-[11px] text-white/30 mb-3">
              Independent monitoring from 12 global locations
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 bg-white/5 rounded-full px-2.5 py-1">
                US East
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 bg-white/5 rounded-full px-2.5 py-1">
                EU West
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 bg-white/5 rounded-full px-2.5 py-1">
                APAC
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── MOBILE PRODUCT DEMO STRIP ──────────────────────── */}
      <div className="lg:hidden w-full bg-[#0A0A0F] grid-pattern overflow-hidden shrink-0">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-0" aria-label="Reliastra home">
            <span className="text-white font-bold text-[18px] tracking-[-0.02em]">reliastra</span>
            <span className="text-[#0891B2] font-bold text-[18px]">.</span>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 pb-4" style={{ height: '200px' }}>
          {leftPanelExtra}
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ──────────────────────────────── */}
      <motion.div
        className="flex-1 bg-white flex flex-col min-h-0 lg:min-h-screen"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease }}
      >
        {/* Need help link (desktop only) */}
        <div className="hidden lg:flex justify-end px-12 pt-8">
          <Link
            href="/contact"
            className="text-sm text-[#A1A1AA] hover:text-[#09090B] transition-colors duration-150"
          >
            Need help?
          </Link>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12 lg:py-0">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
