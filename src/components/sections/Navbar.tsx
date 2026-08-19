'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Features', href: '/#solution' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Partners', href: '/partner' },
  { label: 'Blog', href: '/blog' },
  { label: 'Vendor Intelligence', href: '/track' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const checkPath = () => setIsDark(window.location.pathname.startsWith('/track'));
    window.addEventListener('scroll', handleScroll, { passive: true });
    checkPath();
    // Re-check on navigation
    const observer = new MutationObserver(checkPath);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const dark = isDark;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300',
        dark
          ? 'bg-[rgba(10,10,15,0.8)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.05)]'
          : 'bg-white/80 backdrop-blur-xl',
        scrolled && dark && 'shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
        scrolled && !dark && 'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]'
      )}
    >
      <nav className="max-w-[1200px] mx-auto px-6 md:px-12 w-full flex items-center justify-between">
        {/* Wordmark */}
        <a href="/" className="flex items-center gap-0" aria-label="Reliastra home">
          <span className={cn(
            'text-2xl font-bold tracking-[-0.02em]',
            dark ? 'text-[#FAFAFA]' : 'text-[#09090B]'
          )}>
            reliastra<span className="text-[#0891B2] translate-y-[-2px] inline-block">.</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                dark
                  ? 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                  : 'text-[#52525B] hover:text-[#09090B]'
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-5">
          <a
            href="/status"
            className={cn(
              'text-sm font-medium transition-colors',
              dark ? 'text-[#A1A1AA] hover:text-[#FAFAFA]' : 'text-[#52525B] hover:text-[#09090B]'
            )}
          >
            Status
          </a>

          <a
            href="/login"
            className={cn(
              'text-sm font-medium transition-colors',
              dark
                ? 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                : 'text-[#52525B] hover:text-[#09090B]'
            )}
          >
            Sign In
          </a>

          <motion.a
            href="/register"
            className={cn(
              'px-5 py-2.5 rounded-[10px] font-semibold text-sm inline-block',
              dark
                ? 'bg-[#FAFAFA] text-[#0A0A0F] hover:bg-white hover:shadow-lg'
                : 'bg-[#0A0A0F] text-white'
            )}
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
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  dark ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[#F8F9FA]'
                )}
                aria-label="Open menu"
              >
                <Menu className={cn('w-5 h-5', dark ? 'text-[#FAFAFA]' : 'text-[#09090B]')} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className={cn('w-[300px] p-6', dark ? 'bg-[#0A0A0F] border-[rgba(255,255,255,0.08)]' : 'bg-white')}>
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'block px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                      dark
                        ? 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]'
                        : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA]'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className={cn('mt-6 pt-6 space-y-3', dark ? 'border-t border-[rgba(255,255,255,0.08)]' : 'border-t border-[#E4E4E7]')}>
                <a
                  href="/status"
                  className={cn(
                    'block px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                    dark
                      ? 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]'
                      : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA]'
                  )}
                >
                  Status
                </a>
                <a
                  href="/login"
                  className={cn(
                    'block px-3 py-3 text-sm font-medium rounded-lg transition-colors',
                    dark
                      ? 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]'
                      : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA]'
                  )}
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className={cn(
                    'block px-5 py-3 rounded-[10px] font-semibold text-sm text-center',
                    dark
                      ? 'bg-[#FAFAFA] text-[#0A0A0F]'
                      : 'bg-[#0A0A0F] text-white'
                  )}
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
