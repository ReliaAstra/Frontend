'use client';

import { Separator } from '@/components/ui/separator';
import { usePartnerStore } from '@/stores/partner-store';
import type { PartnerPage } from '@/types/partner';

const footerSections = [
  {
    heading: 'Program',
    links: [
      { label: 'Overview', page: 'home' as PartnerPage },
      { label: 'How It Works', page: 'how-it-works' as PartnerPage },
      { label: 'Commission', page: 'commission' as PartnerPage },
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
];

export function PartnerFooter() {
  const navigate = usePartnerStore((s) => s.navigate);

  return (
    <footer className="mt-auto border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2">
            <button
              onClick={() => navigate('home')}
              className="mb-4 flex items-center gap-2.5 transition-opacity hover:opacity-70"
            >
              <svg
                width="20"
                height="20"
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
              <span className="font-mono text-xs font-semibold tracking-widest uppercase text-foreground">
                RELIASTRA
              </span>
            </button>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A structured partnership program built for consultants, agencies,
              and technology advisors who recommend infrastructure to their
              clients.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.heading}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.page}>
                    <button
                      onClick={() => navigate(link.page)}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-border/60" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Reliastra. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
              Partner Network v1.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
