'use client';

import { cn } from '@/lib/utils';
import { ReliastraLogo } from '../shared/reliastra-logo';
import { usePartnerStore } from '@/stores/partner-store';
import type { PartnerPage } from '@/types/partner';

const footerSections = [
  {
    heading: 'Program',
    links: [
      { label: 'Overview', page: 'home' as PartnerPage },
      { label: 'How It Works', page: 'how-it-works' as PartnerPage },
      { label: 'Commission', page: 'commission' as PartnerPage },
      { label: 'Earn', page: 'earn' as PartnerPage },
      { label: 'Resources', page: 'resources' as PartnerPage },
      { label: 'FAQ', page: 'faq' as PartnerPage },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Apply', page: 'apply' as PartnerPage },
      { label: 'Log in', page: 'login' as PartnerPage },
      { label: 'Sign up', page: 'signup' as PartnerPage },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', page: 'home' as PartnerPage },
      { label: 'Terms', page: 'home' as PartnerPage },
    ],
  },
];

export function PartnerFooter() {
  const navigate = usePartnerStore((s) => s.navigate);

  const handleLinkClick = (page: PartnerPage) => {
    navigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => handleLinkClick('home')}
              className="mb-4 flex items-center transition-opacity hover:opacity-70"
            >
              <ReliastraLogo size="sm" />
            </button>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A premium partnership program for consultants, agencies, and
              technology advisors. Turn your infrastructure expertise into
              recurring revenue with RELIASTRA.
            </p>
            <button
              onClick={() => handleLinkClick('resources')}
              className="mt-4 inline-block text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              Resources →
            </button>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={`${section.heading}-${link.label}`}>
                    <button
                      onClick={() => handleLinkClick(link.page)}
                      className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Thin separator */}
        <div className="my-8 h-px w-full bg-border/40" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RELIASTRA. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40">
              v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
