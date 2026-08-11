'use client';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, MessageCircle } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#solution' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Status', href: '/status' },
      { label: 'Public Tracking', href: '/status' },
      { label: 'API Docs', href: '/blog' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Community', href: '/community' },
      { label: 'Investors', href: '/investors' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Guarantee', href: '/guarantee' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Github, href: 'https://github.com/reliastre', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com/reliastre', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/reliastre', label: 'LinkedIn' },
  { icon: MessageCircle, href: 'https://discord.gg/reliastre', label: 'Discord' },
];

export function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-white/10 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {/* Brand Column */}
          <motion.div
            className="col-span-2 md:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="text-white font-bold text-lg">
              reliastra<span className="text-[#0891B2]">.</span>
            </span>
            <p className="text-white/40 text-sm mt-4 max-w-xs leading-relaxed">
              External Dependency Intelligence. Monitor, correlate, and prove vendor SLA breaches.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {FOOTER_LINKS.map((col, i) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: (i + 1) * 0.08, ease }}
            >
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
            </motion.div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © 2025 Reliastra, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]" />
            </span>
            <span className="text-xs text-[#16A34A]">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
