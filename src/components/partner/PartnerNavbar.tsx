'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, ArrowRight } from 'lucide-react';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';

const NAV_LINKS = [
  { label: 'Program', href: '#how-it-works' },
  { label: 'Commission', href: '#commission' },
  { label: 'FAQ', href: '#faq' },
];

export function PartnerNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[64px] flex items-center transition-all duration-300 bg-white/80 backdrop-blur-xl ${
        scrolled
          ? 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]'
          : ''
      }`}
    >
      <nav className="max-w-[1200px] mx-auto px-6 md:px-12 w-full flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-[-0.02em] text-[#09090B]">
            reliastra<span className="text-[#0891B2]">.</span>
          </span>
          <span className="hidden sm:inline-flex text-[11px] font-semibold tracking-wide uppercase text-[#0891B2] bg-[#0891B2]/8 border border-[#0891B2]/15 px-2.5 py-[3px] rounded-full">
            Partners
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <motion.a
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[10px] font-semibold text-sm bg-[#09090B] text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </motion.a>
          ) : (
            <>
              <a
                href="/login?returnTo=%2F"
                className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
              >
                Sign In
              </a>
              <motion.a
                href="/register?returnTo=%2F"
                className="px-5 py-2 rounded-[10px] font-semibold text-sm bg-[#09090B] text-white inline-block"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                Join Now
              </motion.a>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 text-[#09090B]" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-6 bg-white">
              <SheetTitle className="sr-only">Partner Navigation</SheetTitle>
              <div className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="block px-3 py-3 text-sm font-medium text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-6 pt-6 space-y-3 border-t border-[#E4E4E7]">
                {isAuthenticated ? (
                  <a
                    href="/dashboard"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-[10px] font-semibold text-sm bg-[#09090B] text-white"
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <>
                    <a
                      href="/login?returnTo=%2F"
                      className="block px-3 py-3 text-sm font-medium text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                    >
                      Sign In
                    </a>
                    <a
                      href="/register?returnTo=%2F"
                      className="block px-5 py-3 rounded-[10px] font-semibold text-sm text-center bg-[#09090B] text-white"
                    >
                      Join Now
                    </a>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
