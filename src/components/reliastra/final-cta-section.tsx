'use client'

import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function FinalCtaSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="bg-white py-24 md:py-32">
      <div
        ref={ref}
        className="mx-auto max-w-3xl px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
          STOP GUESSING.
        </h2>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl lg:text-5xl">
          START PROVING.
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base text-slate-600 md:text-lg">
          The next time a vendor takes down your service, you should have independent evidence
          ready for the conversation.
        </p>

        <div className="mt-8">
          <a
            href="#pricing"
            className="inline-block rounded bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
          >
            START FREE
          </a>
        </div>

        <div className="mt-3">
          <a
            href="#vendor-intelligence"
            className="inline-block rounded border border-slate-300 px-8 py-3 text-sm font-medium text-slate-600 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
          >
            EXPLORE LIVE VENDOR DATA
          </a>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          Free monitoring · No credit card required
        </p>
      </div>
    </section>
  )
}
