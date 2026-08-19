'use client'

import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function TrustSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="bg-slate-50 py-20 md:py-24">
      <div
        ref={ref}
        className="mx-auto max-w-3xl px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <div className="mx-auto mb-8 h-px w-12 bg-slate-300" />

        <h2 className="text-xl font-medium text-slate-900 md:text-2xl">
          Built by engineers obsessed with infrastructure accountability.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-slate-600">
          Reliastra exists because we&apos;ve been in the war room ourselves. Staring at
          healthy dashboards while a vendor silently degraded. Watching teams waste hours on
          blame attribution. Losing SLA disputes because we couldn&apos;t prove what happened
          outside our stack.
        </p>

        <p className="mt-6 text-sm italic text-slate-400">
          Every claim on this website can survive scrutiny. That&apos;s the point.
        </p>
      </div>
    </section>
  )
}
