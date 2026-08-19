'use client'

import { CheckCircle2, Info } from 'lucide-react'
import { useScrollReveal, useStaggerReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Timeline event data                                                */
/* ------------------------------------------------------------------ */
const TIMELINE_EVENTS = [
  { time: '14:31:52', label: 'First 5xx detected', color: '#DC2626' },
  { time: '14:31:54', label: 'Latency spike detected', color: '#D97706' },
  { time: '14:32:01', label: 'Independent confirmation', color: '#2563EB' },
  { time: '14:32:15', label: 'All regions affected', color: '#DC2626' },
  { time: '15:18:39', label: 'Service restored', color: '#059669' },
] as const

const REGIONS = ['US EAST', 'US WEST', 'EU WEST'] as const

/* ------------------------------------------------------------------ */
/*  Progress bar (reused pattern)                                      */
/* ------------------------------------------------------------------ */
function ProgressBar({ value, color = '#2563EB' }: { value: number; color?: string }) {
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Evidence Report Panel                                              */
/* ------------------------------------------------------------------ */
function EvidenceReportPanel({
  visible,
  visibleEvents,
}: {
  visible: boolean
  visibleEvents: Set<number>
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.14)]',
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* Report header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            Reliastra Evidence Report
          </span>
          <span className="font-mono-numeric text-xs text-slate-500">RPT-DEMO-0001</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="h-3 w-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Illustrative Data
          </span>
        </div>
      </div>

      {/* Report body — two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT COLUMN — Verified Observations */}
        <div className="space-y-4 border-b border-slate-100 px-4 py-5 sm:px-5 md:border-b-0 md:border-r">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            Verified Observations
          </span>

          <div className="space-y-3">
            {/* Vendor */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-slate-400">Vendor</span>
              <span className="text-sm text-slate-900">Example Vendor API</span>
            </div>
            {/* Endpoint */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-slate-400">Endpoint</span>
              <span className="font-mono-numeric text-sm text-slate-900">/api/checkout</span>
            </div>
            {/* Incident Window */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-slate-400">Incident Window</span>
              <span className="font-mono-numeric text-sm text-slate-900">
                14:31:52 → 15:18:39 UTC
              </span>
            </div>
            {/* Duration */}
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-xs text-slate-400">Duration</span>
              <span className="font-mono-numeric text-sm text-amber-600">46m 47s</span>
            </div>
          </div>

          {/* Independent Regions */}
          <div className="pt-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Independent Confirmation
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              {REGIONS.map((region) => (
                <div key={region} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-medium text-emerald-600">{region}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Evidence Timeline */}
        <div className="px-4 py-5 sm:px-5">
          <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            Evidence Timeline
          </span>
          <div className="relative mt-4 space-y-0 pl-4">
            {/* Vertical connecting line */}
            <div className="absolute left-[3px] top-1 bottom-1 w-px bg-slate-200" />

            {TIMELINE_EVENTS.map((event, i) => (
              <div
                key={event.time + event.label}
                className={cn(
                  'relative flex items-start gap-3 pb-4 last:pb-0 transition-all duration-500 ease-out',
                  visibleEvents.has(i) ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Dot */}
                <span
                  className="absolute left-[-13px] top-1.5 h-2 w-2 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
                <div className="min-w-0">
                  <span className="block font-mono-numeric text-xs text-slate-400">
                    {event.time}
                  </span>
                  <span className="block text-sm text-slate-900">{event.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report footer — Correlation */}
      <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
          Correlation
        </span>
        <div className="mt-3 grid grid-cols-3 gap-4">
          {/* Temporal */}
          <div className="text-center">
            <span className="block font-mono-numeric text-lg text-blue-600">96.8%</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-slate-400">
              Temporal
            </span>
          </div>
          {/* Regional */}
          <div className="text-center">
            <span className="block font-mono-numeric text-lg text-blue-600">100%</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-slate-400">
              Regional
            </span>
          </div>
          {/* Confidence */}
          <div className="text-center">
            <span className="block text-sm font-medium text-blue-600">HIGH</span>
            <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-slate-400">
              Confidence
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Exported section                                                  */
/* ------------------------------------------------------------------ */
export function EvidenceReportSection() {
  const { ref, isVisible } = useScrollReveal()
  const { containerRef, visibleItems } = useStaggerReveal(TIMELINE_EVENTS.length, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px',
  })

  return (
    <section ref={ref} id="evidence" className="bg-slate-50 py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div
          className={cn(
            'mb-12 max-w-3xl space-y-3 transition-all duration-700 ease-out md:mb-16',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            SLA Evidence Reports
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl lg:text-4xl">
            When a vendor says &quot;everything looks fine,&quot; bring the evidence.
          </h2>
          <p className="text-sm text-slate-600">
            Structured, timestamped, independently verified observation reports.
          </p>
        </div>

        {/* Report Panel */}
        <div ref={containerRef}>
          <EvidenceReportPanel visible={isVisible} visibleEvents={visibleItems} />
        </div>
      </div>
    </section>
  )
}
