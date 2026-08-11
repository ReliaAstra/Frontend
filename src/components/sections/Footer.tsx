'use client';

import { Github, Twitter, Linkedin } from 'lucide-react';
import { StatusDot } from '@/components/StatusDot';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#product' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Live Status', href: '#live-vendors' },
    { label: 'Changelog', href: '#blog' },
    { label: 'Documentation', href: '#blog' },
  ],
  Company: [
    { label: 'About', href: '#community' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#community' },
    { label: 'Contact', href: '#community' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'DPA', href: '#' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <a href="/" className="text-xl font-extrabold text-white tracking-tight">
              reliastra<span className="text-[#0891B2]">.</span>
            </a>
            <p className="text-sm text-[#A1A1AA] mt-3 max-w-xs leading-relaxed">
              External Dependency Intelligence. Monitor, correlate, and prove vendor
              SLA breaches.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#community"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#community"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#community"
                className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#A1A1AA] hover:text-white hover:bg-white/10 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#A1A1AA] hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A1A1AA]">
            © {new Date().getFullYear()} Reliastra. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <StatusDot status="up" size="sm" />
            <span className="text-xs text-[#A1A1AA]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
