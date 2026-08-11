'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '/#solution' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Docs', href: '/blog' },
  { label: 'Status', href: '/status' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-shadow duration-300',
        'bg-white/80 backdrop-blur-xl',
        scrolled && 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]'
      )}
    >
      <nav className="max-w-[1200px] mx-auto px-6 md:px-12 w-full flex items-center justify-between">
        {/* Wordmark */}
        <a href="/" className="flex items-center gap-0" aria-label="Reliastra home">
          <span className="text-2xl font-bold tracking-[-0.02em] text-[#09090B]">
            reliastra<span className="text-[#0891B2] translate-y-[-2px] inline-block">.</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="link-underline text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-5">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="text-xs font-medium text-[#16A34A]">All systems up</span>
          </div>

          <a
            href="/pricing"
            className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors"
          >
            Sign In
          </a>

          <motion.a
            href="/pricing"
            className="bg-[#0A0A0F] text-white px-5 py-2.5 rounded-[10px] font-semibold text-sm inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            Start Free
          </motion.a>
        </div>

        {/* Mobile Menu */}
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
            <SheetContent side="right" className="bg-white w-[300px] p-6">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
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
              <div className="mt-6 pt-6 border-t border-[#E4E4E7] space-y-3">
                <div className="flex items-center gap-2 px-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
                  </span>
                  <span className="text-xs font-medium text-[#16A34A]">All systems up</span>
                </div>
                <a
                  href="/signin"
                  className="block px-3 py-3 text-sm font-medium text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA] rounded-lg transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="block bg-[#0A0A0F] text-white px-5 py-3 rounded-[10px] font-semibold text-sm text-center"
                >
                  Start Free
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
