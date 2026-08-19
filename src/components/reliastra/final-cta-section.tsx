'use client'

import { useScrollReveal } from '@/hooks/use-scroll-reveal'

export function FinalCtaSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-24 md:py-32 bg-[#080B10]">
      <div
        ref={ref}
        className="max-w-3xl mx-auto px-6 text-center"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F3F5F7]">
          STOP GUESSING.
        </h2>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#F3F5F7] mt-1">
          START PROVING.
        </h2>

        <p className="mt-6 text-base md:text-lg text-[#8D98A8] max-w-xl mx-auto">
          The next time a vendor takes down your service, you should have independent
          evidence ready for the conversation.
        </p>

        <div className="mt-8">
          <a
            href="#"
            className="inline-block bg-[#3B82F6] text-white px-8 py-3 rounded font-medium text-sm hover:bg-[#2563EB] transition-colors duration-200"
          >
            START FREE
          </a>
        </div>

        <div className="mt-3">
          <a
            href="#"
            className="inline-block border border-[rgba(148,163,184,0.15)] text-[#8D98A8] px-8 py-3 rounded font-medium text-sm hover:text-white transition-colors duration-200"
          >
            EXPLORE LIVE VENDOR DATA
          </a>
        </div>

        <p className="mt-6 text-xs text-[#5A6577]">
          Free monitoring · No credit card required
        </p>
      </div>
    </section>
  )
}
