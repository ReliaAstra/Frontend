'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface AuthSplitLayoutProps {
  leftPanel: ReactNode;
  children: ReactNode;
}

export function AuthSplitLayout({ leftPanel, children }: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Desktop left panel — 45% */}
      <motion.div
        className="hidden lg:flex lg:w-[45%] relative bg-[#0A0A0F] grid-pattern overflow-hidden"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        {/* Inner shadow from right edge */}
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10" />
        <div className="flex flex-col justify-center p-10 xl:p-14 w-full">
          {leftPanel}
        </div>
      </motion.div>

      {/* Mobile dark strip — 200px, horizontal scroll */}
      <motion.div
        className="lg:hidden h-[200px] bg-[#0A0A0F] grid-pattern overflow-x-auto scrollbar-hide relative shrink-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        <div className="min-w-max h-full flex items-center px-6">
          {leftPanel}
        </div>
      </motion.div>

      {/* Right panel — white form area */}
      <motion.div
        className="flex-1 flex items-center justify-center bg-white px-6 py-10 lg:py-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease }}
      >
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
