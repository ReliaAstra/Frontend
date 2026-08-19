"use client"

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import { Shield, Terminal, Building2, type LucideIcon } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Use case data                                                     */
/* ------------------------------------------------------------------ */
interface UseCase {
  number: string
  title: string
  outcome: string
  problem: string
  workflow: string
  icon: LucideIcon
}

const USE_CASES: UseCase[] = [
  {
    number: "01",
    title: "SaaS Teams",
    outcome: "Protect your customer SLA.",
    problem:
      "When checkout fails, customers don't care if it's your code or your payment provider. They care that they can't buy. And SLA credits won't cover the churn.",
    workflow:
      "Reliastra independently monitors your payment, auth, and API dependencies. When degradation correlates with your incident, you get structured evidence \u2014 not speculation.",
    icon: Shield,
  },
  {
    number: "02",
    title: "DevOps / SRE",
    outcome: "Understand external dependency impact.",
    problem:
      "Your on-call engineer gets paged at 2 AM. Dashboards look healthy. Vendor status page says operational. But something is wrong. The war room starts, and nobody can answer the simplest question: is it us or them?",
    workflow:
      "Reliastra provides the independent, multi-region evidence that turns a 45-minute blame session into a 5-minute vendor escalation.",
    icon: Terminal,
  },
  {
    number: "03",
    title: "Agencies / MSPs",
    outcome: "Prove vendor failures across client infrastructure.",
    problem:
      "Managing infrastructure for multiple clients means multiplying the dependency surface. When a shared vendor degrades, you need to demonstrate it wasn't your configuration or your code.",
    workflow:
      "Reliastra monitors dependencies per client group and generates evidence reports that separate your responsibility from vendor behavior.",
    icon: Building2,
  },
]

/* ------------------------------------------------------------------ */
/*  Use Cases Section                                                 */
/* ------------------------------------------------------------------ */
export function UseCasesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
  })

  const { containerRef: casesRef, visibleItems } = useStaggerReveal(
    USE_CASES.length,
    { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
  )

  return (
    <section
      className="bg-slate-50 py-24 md:py-32"
      aria-labelledby="use-cases-heading"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-12 space-y-3 transition-all duration-700 ease-out md:mb-16",
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">USE CASES</p>
          <h2
            id="use-cases-heading"
            className="text-2xl font-semibold text-slate-900 md:text-3xl"
          >
            Built for teams that can&apos;t afford to guess.
          </h2>
        </div>

        {/* Use Case Scenarios */}
        <div ref={casesRef} className="flex flex-col" role="list" aria-label="Use case scenarios">
          {USE_CASES.map((useCase, index) => {
            const Icon = useCase.icon
            const isRevealed = visibleItems.has(index)
            const isLast = index === USE_CASES.length - 1

            return (
              <div
                key={useCase.number}
                role="listitem"
                className={cn(
                  "relative transition-all duration-700 ease-out",
                  isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  !isLast && "border-b border-slate-200"
                )}
                style={{
                  transitionDelay: isRevealed ? `${index * 150}ms` : "0ms",
                }}
              >
                {/* Desktop layout */}
                <div className="hidden gap-8 py-10 md:flex md:py-14 lg:gap-12">
                  {/* Left: decorative number */}
                  <div className="relative flex w-24 flex-shrink-0 items-start">
                    <span
                      className="select-none text-6xl font-semibold leading-none text-slate-200/60"
                      aria-hidden="true"
                    >
                      {useCase.number}
                    </span>
                    {/* Small icon aligned with title */}
                    <div className="absolute -right-1 top-0.5">
                      <Icon
                        size={16}
                        className="text-slate-400"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  {/* Right: content */}
                  <div className="flex-1 space-y-3">
                    <h3 className="text-xl font-semibold text-slate-900">{useCase.title}</h3>
                    <p className="text-sm text-blue-600">{useCase.outcome}</p>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                      {useCase.problem}
                    </p>
                    <p className="max-w-xl text-sm leading-relaxed text-slate-600">
                      {useCase.workflow}
                    </p>
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="flex flex-col gap-3 py-8 md:hidden">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="select-none text-4xl font-semibold leading-none text-slate-200/60"
                      aria-hidden="true"
                    >
                      {useCase.number}
                    </span>
                    <Icon
                      size={14}
                      className="text-slate-400"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{useCase.title}</h3>
                  <p className="text-sm text-blue-600">{useCase.outcome}</p>
                  <p className="text-sm leading-relaxed text-slate-600">{useCase.problem}</p>
                  <p className="text-sm leading-relaxed text-slate-600">{useCase.workflow}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
