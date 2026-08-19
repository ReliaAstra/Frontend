'use client'

import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function TrustSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-20 md:py-24 bg-[#0A0C12]">
      <div
        ref={ref}
        className="max-w-3xl mx-auto px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="w-12 h-px bg-[rgba(148,163,184,0.12)] mx-auto mb-8" />

        <h2 className="text-xl md:text-2xl font-medium text-[#F3F5F7]">
          Built by engineers obsessed with infrastructure accountability.
        </h2>

        <p className="mt-6 text-sm text-[#8D98A8] max-w-xl mx-auto leading-relaxed">
          Reliastra exists because we&apos;ve been in the war room ourselves. Staring at
          healthy dashboards while a vendor silently degraded. Watching teams waste
          hours on blame attribution. Losing SLA disputes because we couldn&apos;t prove
          what happened outside our stack.
        </p>

        <p className="mt-6 text-sm text-[#5A6577] italic">
          Every claim on this website can survive scrutiny. That&apos;s the point.
        </p>
      </div>
    </section>
  )
}
