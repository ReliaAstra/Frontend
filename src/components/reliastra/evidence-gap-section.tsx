"use client"

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Capability matrix data                                            */
/* ------------------------------------------------------------------ */
const COLUMNS = [
  { label: "Status Pages", key: "statusPages" },
  { label: "Internal Monitoring", key: "internal" },
  { label: "Uptime Monitors", key: "uptime" },
  { label: "RELIASTRA", key: "reliastra", highlight: true },
] as const

const CAPABILITIES = [
  "Independent vendor monitoring",
  "Multi-region verification",
  "Dependency correlation",
  "Evidence generation",
  "Timestamped observations",
  "Public vendor intelligence",
] as const

/* ------------------------------------------------------------------ */
/*  Evidence Gap Section                                              */
/* ------------------------------------------------------------------ */
export function EvidenceGapSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
  })

  const { containerRef: matrixRef, visibleItems } = useStaggerReveal(
    CAPABILITIES.length + 1, // +1 for header row
    { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
  )

  return (
    <section
      className="bg-white py-24 md:py-32"
      aria-labelledby="evidence-gap-heading"
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
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">THE EVIDENCE GAP</p>
          <h2
            id="evidence-gap-heading"
            className="text-2xl font-semibold text-slate-900 md:text-3xl"
          >
            Existing monitoring tells you something is wrong.
          </h2>
          <p className="text-sm text-slate-600">
            Reliastra helps establish what happened outside your infrastructure.
          </p>
        </div>

        {/* Capability Matrix */}
        <div
          ref={matrixRef}
          className={cn(
            "overflow-x-auto rounded-[0.375rem] border border-slate-200 bg-white transition-all duration-700 ease-out",
            visibleItems.has(0)
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
          style={{ WebkitOverflowScrolling: "touch" }}
          role="table"
          aria-label="Capability comparison matrix"
        >
          <div className="min-w-[560px]">
            {/* Column Headers */}
            <div
              className="grid grid-cols-[1fr_repeat(4,100px)] border-b border-slate-200 bg-slate-50/60 px-5 py-3 md:grid-cols-[1fr_repeat(4,120px)] md:px-6"
              role="row"
            >
              <div role="columnheader" className="text-xs uppercase tracking-wide text-slate-400">
                Capability
              </div>
              {COLUMNS.map((col) => (
                <div
                  key={col.key}
                  role="columnheader"
                  className={cn(
                    "text-center text-xs uppercase tracking-wide",
                    col.highlight ? "text-blue-600" : "text-slate-400"
                  )}
                >
                  {col.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {CAPABILITIES.map((capability, rowIndex) => {
              const isRevealed = visibleItems.has(rowIndex + 1)
              const isLast = rowIndex === CAPABILITIES.length - 1

              return (
                <div
                  key={capability}
                  className={cn(
                    "grid grid-cols-[1fr_repeat(4,100px)] transition-all duration-500 ease-out md:grid-cols-[1fr_repeat(4,120px)]",
                    isRevealed
                      ? "translate-y-0 opacity-100"
                      : "translate-y-1 opacity-0",
                    !isLast && "border-b border-slate-100"
                  )}
                  style={{
                    transitionDelay: isRevealed ? `${(rowIndex + 1) * 80}ms` : "0ms",
                  }}
                  role="row"
                >
                  <div
                    role="rowheader"
                    className="px-5 py-3 text-sm text-slate-600 md:px-6"
                  >
                    {capability}
                  </div>
                  {COLUMNS.map((col) => (
                    <div
                      key={col.key}
                      role="cell"
                      className={cn(
                        "flex items-center justify-center py-3",
                        col.highlight && "bg-blue-50/70"
                      )}
                    >
                      {col.highlight ? (
                        <Check
                          size={16}
                          className="text-blue-600"
                          strokeWidth={2}
                          aria-label="Supported"
                        />
                      ) : (
                        <span className="text-slate-300" aria-label="Not supported">
                          —
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
