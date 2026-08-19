'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { usePartnerHref, useProductHref } from './usePartnerHref';
import { trackEvent } from '@/lib/analytics';

export function PartnerNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const partnerHref = usePartnerHref();
  const productHref = useProductHref();
  const applyHref = partnerHref('/apply');
  const returnTo = encodeURIComponent(applyHref);

  const navLinks = [
    { label: 'How It Works', href: partnerHref('/how-it-works') },
    { label: 'Earn', href: partnerHref('/earn') },
    { label: 'Commission', href: partnerHref('/commission') },
    { label: 'Resources', href: partnerHref('/resources') },
    { label: 'FAQ', href: partnerHref('/faq') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-[72px] transition-all duration-300',
        'bg-white/82 backdrop-blur-xl border-b border-transparent',
        scrolled && 'border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.03)]',
      )}
    >
      <nav className="mx-auto flex h-full w-full max-w-[1240px] items-center justify-between px-6 md:px-12">
        <a href={productHref('/')} className="flex min-w-0 items-center gap-3" aria-label="RELIASTRA product home">
          <span className="text-2xl font-bold tracking-[-0.02em] text-[#09090B]">
            reliastra<span className="inline-block -translate-y-[1px] text-[#0891B2]">.</span>
          </span>
          <span className="hidden h-4 w-px bg-[#E4E4E7] sm:block" aria-hidden="true" />
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2] sm:block">
            Partner Network
          </span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  active ? 'text-[#09090B]' : 'text-[#52525B] hover:text-[#09090B]',
                )}
              >
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={productHref('/')}
            className="text-sm font-medium text-[#52525B] transition-colors hover:text-[#09090B]"
          >
            Explore RELIASTRA
          </a>
          {isAuthenticated ? (
            <a
              href={partnerHref('/dashboard')}
              className="text-sm font-medium text-[#52525B] transition-colors hover:text-[#09090B]"
            >
              Dashboard
            </a>
          ) : (
            <a
              href={`/login?returnTo=${returnTo}`}
              className="text-sm font-medium text-[#52525B] transition-colors hover:text-[#09090B]"
            >
              Sign In
            </a>
          )}
          <motion.a
            href={applyHref}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => trackEvent('partner_cta_clicked', { location: 'navbar', target: 'apply' })}
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#0A0A0F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#111116]"
          >
            Become a Partner
            <ArrowRight className="h-4 w-4" />
          </motion.a>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="rounded-lg p-2 text-[#09090B] transition-colors hover:bg-[#F8F9FA]"
                aria-label="Open partner navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] border-l-[#E4E4E7] bg-white p-6">
              <SheetTitle className="sr-only">Partner navigation</SheetTitle>
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xl font-bold tracking-[-0.02em] text-[#09090B]">
                  reliastra<span className="text-[#0891B2]">.</span>
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
                  Partner Network
                </span>
              </div>

              <div className="mt-8 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={cn(
                      'block rounded-xl px-3 py-3 text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-[#F8F9FA] text-[#09090B]'
                        : 'text-[#52525B] hover:bg-[#F8F9FA] hover:text-[#09090B]',
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>

              <div className="mt-6 border-t border-[#E4E4E7] pt-6">
                <a
                  href={productHref('/')}
                  className="block rounded-xl px-3 py-3 text-sm font-medium text-[#52525B] transition-colors hover:bg-[#F8F9FA] hover:text-[#09090B]"
                >
                  Explore RELIASTRA
                </a>
                {isAuthenticated ? (
                  <a
                    href={partnerHref('/dashboard')}
                    className="mt-1 block rounded-xl px-3 py-3 text-sm font-medium text-[#52525B] transition-colors hover:bg-[#F8F9FA] hover:text-[#09090B]"
                  >
                    Dashboard
                  </a>
                ) : (
                  <a
                    href={`/login?returnTo=${returnTo}`}
                    className="mt-1 block rounded-xl px-3 py-3 text-sm font-medium text-[#52525B] transition-colors hover:bg-[#F8F9FA] hover:text-[#09090B]"
                  >
                    Sign In
                  </a>
                )}
                <a
                  href={applyHref}
                  onClick={() => trackEvent('partner_cta_clicked', { location: 'mobile_nav', target: 'apply' })}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#0A0A0F] px-5 py-3 text-sm font-semibold text-white"
                >
                  Become a Partner
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
