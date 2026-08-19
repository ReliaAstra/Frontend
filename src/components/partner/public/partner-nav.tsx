'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePartnerStore } from '@/stores/partner-store';
import type { PartnerPage } from '@/types/partner';

const navLinks: { label: string; page: PartnerPage }[] = [
  { label: 'Program', page: 'home' },
  { label: 'How It Works', page: 'how-it-works' },
  { label: 'Commission', page: 'commission' },
  { label: 'Earn', page: 'earn' },
  { label: 'FAQ', page: 'faq' },
];

export function PartnerNav() {
  const navigate = usePartnerStore((s) => s.navigate);
  const currentPage = usePartnerStore((s) => s.currentPage);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PartnerPage) => {
    navigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-mono text-sm font-semibold tracking-widest uppercase text-foreground">
            RELIASTRA
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              className={cn(
                'relative px-3 py-2 text-sm font-medium transition-colors',
                currentPage === link.page
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
              {currentPage === link.page && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute inset-x-1 -bottom-[9px] h-px bg-foreground"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleNav('login')}
            className="text-sm"
          >
            Log in
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => handleNav('apply')}
            className="text-sm"
          >
            Apply now
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border/60 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => handleNav(link.page)}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    currentPage === link.page
                      ? 'bg-accent text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNav('login')}
                  className="w-full"
                >
                  Log in
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleNav('apply')}
                  className="w-full"
                >
                  Apply now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
