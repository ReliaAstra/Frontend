'use client';

import { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Status', href: '#live-vendors' },
  { label: 'Blog', href: '#blog' },
  { label: 'Community', href: '#community' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 20);
  });

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-16 flex items-center transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#F0F0F0] shadow-card'
          : 'bg-transparent'
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <nav className="max-w-6xl mx-auto w-full px-4 md:px-8 flex items-center justify-between" aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className="flex items-center gap-0.5 text-xl font-extrabold text-[#09090B] tracking-tight">
          reliastra<span className="text-[#0891B2]">.</span>
        </a>

        {/* Desktop nav links */}
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

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/sign-in"
            className="text-sm font-medium text-[#52525B] hover:text-[#09090B] transition-colors px-3 py-2"
          >
            Sign In
          </a>
          <Button
            size="sm"
            className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Free
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#F8F9FA] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-[#09090B]" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4E7]">
                <span className="text-lg font-extrabold text-[#09090B] tracking-tight">
                  reliastra<span className="text-[#0891B2]">.</span>
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#F8F9FA]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex flex-col p-6 gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA] rounded-lg px-3 py-2.5 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="p-6 border-t border-[#E4E4E7] space-y-3">
                <a
                  href="/sign-in"
                  className="block text-center text-sm font-medium text-[#52525B] hover:text-[#09090B] px-3 py-2.5 rounded-lg border border-[#E4E4E7] transition-colors"
                >
                  Sign In
                </a>
                <Button className="w-full bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-semibold">
                  Start Free
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.header>
  );
}