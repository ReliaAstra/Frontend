'use client'

import { Info, ChevronDown } from 'lucide-react'
import { useScrollReveal, useStaggerReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Cascade data                                                      */
/* ------------------------------------------------------------------ */
const VENDOR_LATENCY: { value: string; color: string; width: number }[] = [
  { value: '420ms',  color: '#F3F5F7', width: 5 },
  { value: '812ms',  color: '#F59E0B', width: 10 },
  { value: '2.4s',   color: '#F59E0B', width: 24 },
  { value: '8.4s',   color: '#EF4444', width: 84 },
]

const SERVICE_ERRORS: { value: string; color: string; width: number }[] = [
  { value: '0.4%',   color: '#F3F5F7', width: 2 },
  { value: '1.2%',   color: '#F59E0B', width: 6 },
  { value: '7.8%',   color: '#EF4444', width: 39 },
  { value: '18.7%',  color: '#EF4444', width: 94 },
]

const TOTAL_CASCADE_STEPS = VENDOR_LATENCY.length + SERVICE_ERRORS.length

/* ------------------------------------------------------------------ */
/*  Progress bar                                                      */
/* ------------------------------------------------------------------ */
function ProgressBar({ value, color = '#3B82F6' }: { value: number; color?: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-[rgba(148,163,184,0.08)]">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Cascade column                                                    */
/* ------------------------------------------------------------------ */
function CascadeColumn({
  label,
  data,
  startIndex,
  visibleItems,
}: {
  label: string
  data: { value: string; color: string; width: number }[]
  startIndex: number
  visibleItems: Set<number>
}) {
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5A6577]">
        {label}
      </span>
      <div className="space-y-2 pt-2">
        {data.map((item, i) => {
          const idx = startIndex + i
          const visible = visibleItems.has(idx)
          return (
            <div key={item.value}>
              <div
                className={cn(
                  'flex items-center justify-between gap-4 transition-all duration-500 ease-out',
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                )}
                style={{ transitionDelay: `${(i) * 120}ms` }}
              >
                <span
                  className="font-mono-numeric text-lg"
                  style={{ color: item.color }}
                >
                  {item.value}
                </span>
                {/* Mini bar */}
                <div className="h-2 w-20 overflow-hidden rounded-sm bg-[rgba(148,163,184,0.06)]">
                  <div
                    className="h-full rounded-sm transition-all duration-700 ease-out"
                    style={{
                      width: visible ? `${item.width}%` : '0%',
                      backgroundColor: item.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
              {i < data.length - 1 && (
                <div className="flex items-center gap-2 py-0.5 pl-1">
                  <ChevronDown className="h-3 w-3 text-[#5A6577]" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Correlation Panel                                                  */
/* ------------------------------------------------------------------ */
function CorrelationPanel({
  visible,
  visibleItems,
}: {
  visible: boolean
  visibleItems: Set<number>
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[rgba(148,163,184,0.08)] bg-[#0E131B] shadow-[0_0_80px_-16px_rgba(59,130,246,0.05)]',
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="font-mono-numeric text-xs text-[#8D98A8]">
            INC-DEMO-001
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5A6577]">
            Checkout Degradation
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#5A6577]">
          <Info className="h-3 w-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Illustrative Data
          </span>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-6 p-4 sm:p-5 md:grid-cols-2 md:gap-8">
        <CascadeColumn
          label="Vendor Latency"
          data={VENDOR_LATENCY}
          startIndex={0}
          visibleItems={visibleItems}
        />
        <CascadeColumn
          label="Service Error Rate"
          data={SERVICE_ERRORS}
          startIndex={VENDOR_LATENCY.length}
          visibleItems={visibleItems}
        />
      </div>

      {/* Correlation summary */}
      <div className="border-t border-[rgba(148,163,184,0.08)] px-4 py-4 sm:px-5">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#5A6577]">
          Correlation Summary
        </span>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Temporal */}
          <div>
            <span className="font-mono-numeric text-2xl text-[#3B82F6]">96.8%</span>
            <p className="mt-1 text-xs text-[#5A6577]">Temporal Correlation</p>
            <div className="mt-2">
              <ProgressBar value={96.8} color="#3B82F6" />
            </div>
          </div>
          {/* Regional */}
          <div>
            <span className="font-mono-numeric text-2xl text-[#3B82F6]">3 / 3</span>
            <p className="mt-1 text-xs text-[#5A6577]">Regional Confirmation</p>
            <div className="mt-2">
              <ProgressBar value={100} color="#3B82F6" />
            </div>
          </div>
          {/* Assessment */}
          <div>
            <span className="text-sm font-medium text-[#3B82F6]">
              LIKELY CONTRIBUTING DEPENDENCY
            </span>
            <p className="mt-1 text-xs text-[#5A6577]">Assessment</p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-5 text-xs text-[#5A6577]">
          Observation ≠ correlation ≠ causation. Reliastra provides evidence, not conclusions.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Exported section                                                   */
/* ------------------------------------------------------------------ */
export function CorrelationEngineSection() {
  const { ref, isVisible } = useScrollReveal()
  const { containerRef, visibleItems } = useStaggerReveal(TOTAL_CASCADE_STEPS, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  })

  return (
    <section ref={ref} className="bg-[#0A0C12] py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div
          className={cn(
            'mb-12 max-w-2xl space-y-3 transition-all duration-700 ease-out md:mb-16',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-[#5A6577]">
            Correlation Engine
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-[#F3F5F7] md:text-3xl lg:text-4xl">
            Observation. Correlation. Evidence.
          </h2>
          <p className="text-sm text-[#8D98A8]">
            Reliastra does not claim causation. It provides independent observation and correlation data.
          </p>
        </div>

        {/* Correlation Panel */}
        <div ref={containerRef}>
          <CorrelationPanel visible={isVisible} visibleItems={visibleItems} />
        </div>
      </div>
    </section>
  )
}
