"use client"

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Track Visual — Monitoring pings                                   */
/* ------------------------------------------------------------------ */
const REGIONS = [
  { name: "US EAST", latency: "142ms" },
  { name: "US WEST", latency: "189ms" },
  { name: "EU WEST", latency: "97ms" },
] as const

function TrackVisual() {
  return (
    <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-col gap-2.5">
        {REGIONS.map((region) => (
          <div key={region.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="animate-pulse-healthy inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              <span className="font-mono-numeric text-xs text-slate-600">
                {region.name}
              </span>
            </div>
            <span className="text-xs text-slate-400">Monitoring</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Correlate Visual — Timeline bars                                  */
/* ------------------------------------------------------------------ */
function CorrelateVisual() {
  return (
    <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
      {/* Your Service bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            YOUR SERVICE
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-sm">
          <div className="flex-[3] bg-emerald-500" />
          <div className="flex-[2] bg-red-500" />
        </div>
      </div>

      {/* Vendor bar */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            VENDOR
          </span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-sm">
          <div className="flex-[3] bg-emerald-500" />
          <div className="flex-[2] bg-red-500" />
        </div>
      </div>

      {/* Correlation metric */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-2.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Temporal correlation
        </span>
        <span className="font-mono-numeric text-xs text-blue-600">96.8%</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Prove Visual — Evidence report preview                            */
/* ------------------------------------------------------------------ */
const EVIDENCE_ROWS = [
  { time: "14:31:52", text: "First 5xx detected", color: "bg-emerald-500" },
  { time: "14:32:15", text: "All regions affected", color: "bg-amber-500" },
  { time: "14:33:01", text: "Correlation established", color: "bg-blue-600" },
] as const

function ProveVisual() {
  return (
    <div className="rounded border border-slate-200 bg-slate-50/60 p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          EVIDENCE REPORT
        </span>
        <span className="font-mono-numeric text-[10px] text-slate-400">RPT-DEMO-0001</span>
      </div>

      {/* Evidence rows */}
      <div className="flex flex-col gap-2">
        {EVIDENCE_ROWS.map((row) => (
          <div key={row.time} className="flex items-center gap-2.5">
            <span
              className={cn("inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full", row.color)}
              aria-hidden="true"
            />
            <span className="font-mono-numeric text-xs text-slate-400">{row.time}</span>
            <span className="text-xs text-slate-600">{row.text}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
          Confidence
        </span>
        <span className="text-xs font-medium text-blue-600">HIGH</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stage data                                                        */
/* ------------------------------------------------------------------ */
const STAGES = [
  {
    number: "01",
    name: "TRACK",
    title: "Track",
    description:
      "Independently monitor your external dependencies from multiple global regions. Observe latency, errors, availability — without touching your infrastructure.",
    visualType: "track" as const,
  },
  {
    number: "02",
    name: "CORRELATE",
    title: "Correlate",
    description:
      "When an incident occurs, Reliastra correlates your service degradation with observed vendor behavior. Temporal alignment. Regional confirmation. Structured analysis.",
    visualType: "correlate" as const,
  },
  {
    number: "03",
    name: "PROVE",
    title: "Prove",
    description:
      "Generate structured evidence reports with timestamps, observations, and correlation data. The kind of evidence you bring to a vendor escalation conversation.",
    visualType: "prove" as const,
  },
] as const

function StageVisual({ type }: { type: "track" | "correlate" | "prove" }) {
  switch (type) {
    case "track":
      return <TrackVisual />
    case "correlate":
      return <CorrelateVisual />
    case "prove":
      return <ProveVisual />
  }
}

/* ------------------------------------------------------------------ */
/*  Track Correlate Prove Section                                     */
/* ------------------------------------------------------------------ */
export function TrackCorrelateProveSection() {
  const { ref: sectionRef, isVisible: sectionVisible } = useScrollReveal({
    threshold: 0.1,
    rootMargin: "0px 0px -60px 0px",
  })

  const { containerRef, visibleItems } = useStaggerReveal(STAGES.length, {
    threshold: 0.05,
    rootMargin: "0px 0px -40px 0px",
  })

  return (
    <section
      ref={sectionRef}
      id="product"
      className="bg-slate-50 py-24 md:py-32"
      aria-labelledby="tcp-heading"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div
          className={cn(
            "mb-16 space-y-4 transition-all duration-700 ease-out md:mb-20",
            sectionVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">HOW IT WORKS</p>
          <h2
            id="tcp-heading"
            className="text-3xl font-semibold text-slate-900 md:text-4xl lg:text-5xl"
          >
            Track. Correlate. Prove.
          </h2>
          <p className="text-base text-slate-600">The infrastructure accountability workflow.</p>
        </div>

        {/* Three stages */}
        <div ref={containerRef} className="grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-0">
          {STAGES.map((stage, index) => {
            const isRevealed = visibleItems.has(index)
            const isLast = index === STAGES.length - 1

            return (
              <div
                key={stage.number}
                className={cn(
                  "relative transition-all duration-500 ease-out",
                  isRevealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}
                style={{
                  transitionDelay: isRevealed ? `${index * 150}ms` : "0ms",
                }}
              >
                <div className="px-0 py-0 md:px-6 md:py-0 md:first:pl-0 md:last:pr-0">
                  <div className="space-y-4">
                    {/* Background number */}
                    <span
                      className="block text-5xl font-bold leading-none text-slate-200/60"
                      aria-hidden="true"
                    >
                      {stage.number}
                    </span>

                    {/* Stage name */}
                    <p className="text-xs uppercase tracking-[0.15em] text-blue-600">
                      {stage.name}
                    </p>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-slate-900 md:text-2xl">
                      {stage.title}
                    </h3>

                    {/* Description */}
                    <p className="max-w-sm text-sm leading-relaxed text-slate-600">
                      {stage.description}
                    </p>

                    {/* Visual */}
                    <div className="pt-2">
                      <StageVisual type={stage.visualType} />
                    </div>
                  </div>
                </div>

                {/* Desktop divider */}
                {!isLast && (
                  <div
                    className="absolute bottom-0 right-0 top-0 hidden w-px bg-slate-200 md:block"
                    aria-hidden="true"
                  />
                )}

                {/* Mobile separator */}
                {!isLast && (
                  <div className="my-10 block h-px bg-slate-200 md:hidden" aria-hidden="true" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
