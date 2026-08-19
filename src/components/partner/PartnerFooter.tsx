'use client';

import { Github } from 'lucide-react';

const LINKS = [
  {
    title: 'Program',
    links: [
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Commission', href: '#commission' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Dashboard', href: '/dashboard' },
    ],
  },
  {
    title: 'Reliastra',
    links: [
      { label: 'Features', href: 'https://frontend.zevcloud.app/#solution' },
      { label: 'Pricing', href: 'https://frontend.zevcloud.app/pricing' },
      { label: 'Status', href: 'https://frontend.zevcloud.app/status' },
      { label: 'Blog', href: 'https://frontend.zevcloud.app/blog' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: 'https://frontend.zevcloud.app/privacy' },
      { label: 'Terms of Service', href: 'https://frontend.zevcloud.app/terms' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/ReliaAstra', label: 'GitHub' },
];

export function PartnerFooter() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-white font-bold text-lg">
              reliastra<span className="text-[#0891B2]">.</span>
            </span>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              Partner with RELIASTRA and earn recurring revenue by introducing
              External Dependency Intelligence to your network.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {LINKS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Reliastra, Inc. All rights reserved.
          </p>
          <a
            href="https://frontend.zevcloud.app/status"
            className="text-xs text-white/40 hover:text-white transition-colors"
          >
            System status
          </a>
        </div>
      </div>
    </footer>
  );
}
