'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { label: 'Product', href: '#product' },
  { label: 'Vendor Intelligence', href: '#vendor-intelligence' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
] as const

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 8)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200 ease-out',
        scrolled
          ? 'h-14 border-b border-[rgba(148,163,184,0.08)] bg-[#0E131B]/90 backdrop-blur-md'
          : 'h-16 bg-transparent'
      )}
    >
      <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Wordmark */}
        <a
          href="#"
          className="text-sm font-semibold uppercase tracking-[0.15em] text-[#F3F5F7] transition-opacity duration-200 hover:opacity-80"
        >
          Reliastra
        </a>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#8D98A8] transition-colors duration-200 hover:text-[#F3F5F7]"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#signin"
            className="text-sm text-[#8D98A8] transition-colors duration-200 hover:text-[#F3F5F7]"
          >
            Sign In
          </a>
          <a
            href="#start"
            className="rounded bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
          >
            Start Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center text-[#8D98A8] transition-colors duration-200 hover:text-[#F3F5F7]"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-[rgba(148,163,184,0.08)] bg-[#0E131B] p-0"
            >
              <SheetHeader className="border-b border-[rgba(148,163,184,0.08)] px-6 py-5">
                <SheetTitle className="text-sm font-semibold uppercase tracking-[0.15em] text-[#F3F5F7]">
                  Reliastra
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-3 py-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded px-3 py-2.5 text-sm text-[#8D98A8] transition-colors duration-200 hover:bg-[rgba(148,163,184,0.06)] hover:text-[#F3F5F7]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2 border-t border-[rgba(148,163,184,0.08)] px-6 py-5">
                <a
                  href="#signin"
                  className="rounded px-3 py-2.5 text-sm text-[#8D98A8] transition-colors duration-200 hover:text-[#F3F5F7]"
                >
                  Sign In
                </a>
                <a
                  href="#start"
                  className="rounded bg-[#3B82F6] px-3 py-2.5 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
                >
                  Start Free
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
