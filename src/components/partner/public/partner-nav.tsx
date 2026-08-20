'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePartnerStore } from '@/stores/partner-store';
import type { PartnerPage } from '@/types/partner';
import { ReliastraLogo } from '../shared/reliastra-logo';

const navLinks: { label: string; page: PartnerPage }[] = [
  { label: 'Overview', page: 'home' },
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center transition-opacity hover:opacity-70"
        >
          <ReliastraLogo size="lg" />
        </button>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = currentPage === link.page;
            return (
              <motion.button
                key={link.page}
                onClick={() => handleNav(link.page)}
                className={cn(
                  'relative px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                whileTap={{ scale: 0.97 }}
              >
                <motion.span
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                  transition={{ duration: 0.2 }}
                >
                  {link.label}
                </motion.span>
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-1 -bottom-[9px] h-px bg-foreground"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
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
            className="overflow-hidden border-t border-border/60 bg-background/80 backdrop-blur-md md:hidden"
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
