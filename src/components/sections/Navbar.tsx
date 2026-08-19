'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu } from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

interface NavLink {
  label: string;
  href: string;
  description?: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Product', href: '/#solution' },
  { label: 'Compare', href: '/compare' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Vendor Intelligence', href: '/track' },
];

const RESOURCE_LINKS: NavLink[] = [
  {
    label: 'SLA Credit Calculator',
    href: '/tools/sla-credit-calculator',
    description: 'Estimate what a provider owes you',
  },
  {
    label: 'Concepts',
    href: '/docs/concepts',
    description: 'SLA tracking, credits and correlation',
  },
  { label: 'Blog', href: '/blog', description: 'Notes from building Reliastra' },
  { label: 'Changelog', href: '/changelog', description: 'Every release, documented' },
  { label: 'Partners', href: '/partner', description: 'Agency and reseller program' },
];

/** Desktop dropdown for the resources group. */
function ResourcesMenu({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <div className="relative" onMouseEnter={openNow} onMouseLeave={closeSoon}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          'inline-flex items-center gap-1 text-sm font-medium transition-colors',
          dark ? 'text-[#A1A1AA] hover:text-[#FAFAFA]' : 'text-[#52525B] hover:text-[#09090B]',
        )}
      >
        Resources
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease }}
            className={cn(
              'absolute left-1/2 top-full z-50 mt-3 w-[300px] -translate-x-1/2 rounded-[14px] border p-2',
              dark
                ? 'border-[rgba(255,255,255,0.10)] bg-[#131318] shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
                : 'border-[#E4E4E7] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.10)]',
            )}
          >
            {RESOURCE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  'block rounded-[10px] px-3 py-2.5 transition-colors',
                  dark ? 'hover:bg-[rgba(255,255,255,0.05)]' : 'hover:bg-[#F8F9FA]',
                )}
              >
                <span
                  className={cn(
                    'block text-sm font-semibold',
                    dark ? 'text-[#FAFAFA]' : 'text-[#09090B]',
                  )}
                >
                  {link.label}
                </span>
                {link.description && (
                  <span
                    className={cn(
                      'mt-0.5 block text-xs',
                      dark ? 'text-[#71717A]' : 'text-[#A1A1AA]',
                    )}
                  >
                    {link.description}
                  </span>
                )}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Dark-console pages: vendor intelligence surfaces use the dark theme.
  const dark = pathname?.startsWith('/track') ?? false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((link) => {
            const active =
              link.href.startsWith('/') && !link.href.includes('#')
                ? pathname === link.href || pathname?.startsWith(`${link.href}/`)
                : false;
            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'text-sm font-medium transition-colors',
                  active
                    ? dark
                      ? 'text-[#FAFAFA]'
                      : 'text-[#09090B]'
                    : dark
                      ? 'text-[#A1A1AA] hover:text-[#FAFAFA]'
                      : 'text-[#52525B] hover:text-[#09090B]'
                )}
              >
                {link.label}
              </a>
            );
          })}
          <ResourcesMenu dark={dark} />
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex items-center gap-5">
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
        <div className="lg:hidden">
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
            <SheetContent
              side="right"
              className={cn(
                'w-[320px] overflow-y-auto p-6',
                dark ? 'bg-[#0A0A0F] border-[rgba(255,255,255,0.08)]' : 'bg-white'
              )}
            >
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              <div className="mt-8 space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'block rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                      dark
                        ? 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]'
                        : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA]'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div
                className={cn(
                  'mt-5 pt-5',
                  dark ? 'border-t border-[rgba(255,255,255,0.08)]' : 'border-t border-[#E4E4E7]'
                )}
              >
                <p
                  className={cn(
                    'mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest',
                    dark ? 'text-[#52525B]' : 'text-[#A1A1AA]'
                  )}
                >
                  Resources
                </p>
                <div className="space-y-1">
                  {RESOURCE_LINKS.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'block rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                        dark
                          ? 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)]'
                          : 'text-[#52525B] hover:text-[#09090B] hover:bg-[#F8F9FA]'
                      )}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className={cn('mt-5 pt-5 space-y-2', dark ? 'border-t border-[rgba(255,255,255,0.08)]' : 'border-t border-[#E4E4E7]')}>
                <a
                  href="/status"
                  className={cn(
                    'block rounded-lg px-3 py-3 text-sm font-medium transition-colors',
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
                    'block rounded-lg px-3 py-3 text-sm font-medium transition-colors',
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
                    'block rounded-[10px] px-5 py-3 text-center text-sm font-semibold',
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
