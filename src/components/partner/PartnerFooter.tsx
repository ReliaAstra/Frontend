'use client';

import { Github } from 'lucide-react';
import { usePartnerHref, useProductHref } from './usePartnerHref';
import { trackEvent } from '@/lib/analytics';

export function PartnerFooter() {
  const partnerHref = usePartnerHref();
  const productHref = useProductHref();

  const links = [
    {
      title: 'Partner',
      links: [
        { label: 'How It Works', href: partnerHref('/how-it-works') },
        { label: 'Earn', href: partnerHref('/earn') },
        { label: 'Commission', href: partnerHref('/commission') },
        { label: 'Resources', href: partnerHref('/resources') },
        { label: 'FAQ', href: partnerHref('/faq') },
        { label: 'Become a Partner', href: partnerHref('/apply') },
      ],
    },
    {
      title: 'Product',
      links: [
        { label: 'Features', href: productHref('/#solution') },
        { label: 'Pricing', href: productHref('/pricing') },
        { label: 'Vendor Intelligence', href: productHref('/track') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: productHref('/about') },
        { label: 'Contact', href: productHref('/contact') },
        { label: 'Blog', href: productHref('/blog') },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms', href: productHref('/terms') },
        { label: 'Privacy', href: productHref('/privacy') },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/10 bg-[#0A0A0F] pt-20 pb-10">
      <div className="mx-auto max-w-[1240px] px-6 md:px-12">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
          <div>
            <a href={productHref('/')} className="inline-block text-lg font-bold text-white">
              reliastra<span className="text-[#0891B2]">.</span>
            </a>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#67E8F9]">
              Partner Network
            </p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/45">
              A public distribution layer for people who already know the teams RELIASTRA serves.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://github.com/ReliaAstra"
                target="_blank"
                rel="noreferrer"
                aria-label="RELIASTRA on GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {links.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-semibold text-white">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={() => {
                        if (group.title === 'Partner') {
                          trackEvent('partner_cta_clicked', {
                            location: 'footer',
                            target: link.label.toLowerCase().replace(/\s+/g, '_'),
                          });
                        }
                      }}
                      className="text-sm text-white/45 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/30 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Reliastra, Inc. All rights reserved.</p>
          <a href={productHref('/status')} className="transition-colors hover:text-white/60">
            System status
          </a>
        </div>
      </div>
    </footer>
  );
}
