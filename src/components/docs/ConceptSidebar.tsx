'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONCEPTS_ORDERED } from '@/lib/concepts-data';

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="space-y-0.5">
      {CONCEPTS_ORDERED.map((concept) => {
        const href = `/docs/concepts/${concept.slug}`;
        const active = pathname === href;
        return (
          <li key={concept.slug}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13.5px] transition-all duration-150',
                active
                  ? 'bg-[#0891B2]/8 font-semibold text-[#0891B2]'
                  : 'text-[#52525B] hover:bg-[#F8F9FA] hover:text-[#09090B]',
              )}
            >
              <span
                className={cn(
                  'h-4 w-[2px] shrink-0 rounded-full transition-colors duration-150',
                  active ? 'bg-[#0891B2]' : 'bg-transparent group-hover:bg-[#D4D4D8]',
                )}
              />
              {concept.navLabel}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function ConceptSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile disclosure */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between rounded-[12px] border border-[#E4E4E7] bg-white px-4 py-3.5 text-sm font-semibold text-[#09090B]"
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#0891B2]" aria-hidden="true" />
            Concepts
          </span>
          <ChevronDown
            className={cn('h-4 w-4 text-[#A1A1AA] transition-transform duration-200', open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
        {open && (
          <nav aria-label="Concept pages" className="mt-2 rounded-[12px] border border-[#E4E4E7] bg-white p-2">
            <NavList onNavigate={() => setOpen(false)} />
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <nav
        aria-label="Concept pages"
        className="sticky top-[104px] hidden max-h-[calc(100vh-140px)] overflow-y-auto lg:block"
      >
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
          Concepts
        </p>
        <NavList />

        <div className="mt-8 border-t border-[#F0F0F0] pt-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-[#A1A1AA]">
            Related
          </p>
          <ul className="space-y-0.5">
            {[
              { href: '/tools/sla-credit-calculator', label: 'SLA credit calculator' },
              { href: '/track', label: 'Vendor reliability data' },
              { href: '/compare', label: 'Compare tools' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-[8px] px-3 py-2 text-[13.5px] text-[#52525B] transition-colors hover:bg-[#F8F9FA] hover:text-[#09090B]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
