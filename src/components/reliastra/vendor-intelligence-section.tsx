'use client'

import { useState, useEffect } from 'react'
import { ArrowUpRight, Info } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Vendor data                                                        */
/* ------------------------------------------------------------------ */
type VendorStatus = 'Operational' | 'Degraded'

interface VendorRow {
  vendor: string
  region: string
  status: VendorStatus
  latencyMs: number
  http: number
}

const VENDOR_DATA: VendorRow[] = [
  { vendor: 'Stripe',        region: 'US East',     status: 'Operational', latencyMs: 91,  http: 200 },
  { vendor: 'Stripe',        region: 'EU West',     status: 'Operational', latencyMs: 124, http: 200 },
  { vendor: 'Stripe',        region: 'AP Southeast', status: 'Operational', latencyMs: 203, http: 200 },
  { vendor: 'Auth0',         region: 'US East',     status: 'Operational', latencyMs: 67,  http: 200 },
  { vendor: 'Auth0',         region: 'EU West',     status: 'Degraded',   latencyMs: 342, http: 200 },
  { vendor: 'Cloudflare',    region: 'US East',     status: 'Operational', latencyMs: 48,  http: 200 },
  { vendor: 'Cloudflare',    region: 'EU West',     status: 'Operational', latencyMs: 52,  http: 200 },
  { vendor: 'Twilio',        region: 'US East',     status: 'Operational', latencyMs: 145, http: 200 },
  { vendor: 'MongoDB Atlas', region: 'US East',     status: 'Operational', latencyMs: 23,  http: 200 },
  { vendor: 'OpenAI',        region: 'US East',     status: 'Operational', latencyMs: 389, http: 200 },
]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function latencyColor(ms: number): string {
  if (ms < 100) return 'text-emerald-600'
  if (ms > 500) return 'text-red-600'
  if (ms > 200) return 'text-amber-600'
  return 'text-slate-600'
}

function StatusBadge({ status }: { status: VendorStatus }) {
  const isOk = status === 'Operational'
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full',
          isOk ? 'bg-emerald-500' : 'bg-amber-500'
        )}
      />
      <span className={cn('text-sm', isOk ? 'text-emerald-600' : 'text-amber-600')}>
        {status}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Demo clock                                                         */
/* ------------------------------------------------------------------ */
function useDemoTime() {
  const [time, setTime] = useState(() => {
    const now = new Date()
    return now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  })
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date()
      setTime(n.toISOString().replace('T', ' ').slice(0, 19) + ' UTC')
    }, 60_000)
    return () => clearInterval(id)
  }, [])
  return time
}

/* ------------------------------------------------------------------ */
/*  Exported section                                                   */
/* ------------------------------------------------------------------ */
export function VendorIntelligenceSection() {
  const { ref, isVisible } = useScrollReveal()
  const demoTime = useDemoTime()

  return (
    <section ref={ref} id="vendor-intelligence" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div
          className={cn(
            'mb-12 space-y-3 transition-all duration-700 ease-out md:mb-16',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
            Public Vendor Intelligence
          </p>
          <h2 className="text-2xl font-semibold leading-tight text-slate-900 md:text-3xl lg:text-4xl">
            What&rsquo;s actually happening right now.
          </h2>
          <p className="text-sm text-slate-600">
            Live observations from our global monitoring network. Updated continuously.
          </p>
          <p className="font-mono-numeric text-xs text-slate-400" suppressHydrationWarning>
            Last updated: {demoTime}
          </p>
        </div>

        {/* Table */}
        <div
          className={cn(
            'overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-700 ease-out delay-100',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:px-5">
                    Vendor
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Region
                  </th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    Latency
                  </th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wider text-slate-400">
                    HTTP
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {VENDOR_DATA.map((row, i) => (
                  <tr
                    key={`${row.vendor}-${row.region}-${i}`}
                    className={cn(
                      'border-b border-slate-100 last:border-b-0',
                      row.status === 'Degraded' && 'bg-amber-50/50'
                    )}
                  >
                    <td className="px-4 py-2.5 text-sm text-slate-900 sm:px-5">{row.vendor}</td>
                    <td className="font-mono-numeric px-4 py-2.5 text-xs text-slate-500">
                      {row.region}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={row.status} />
                    </td>
                    <td
                      className={cn(
                        'px-4 py-2.5 text-right font-mono-numeric text-sm',
                        latencyColor(row.latencyMs)
                      )}
                    >
                      {row.latencyMs}ms
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono-numeric text-xs text-slate-400">
                      {row.http}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Illustrative data badge */}
          <div className="flex items-center justify-end border-t border-slate-100 px-4 py-2 sm:px-5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Info className="h-3 w-3" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Illustrative Data
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className={cn(
            'mt-8 flex items-center transition-all duration-700 ease-out delay-200',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          <a
            href="#pricing"
            className="inline-flex items-center gap-1.5 rounded border border-blue-600/40 px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors duration-200 hover:border-blue-600/70 hover:bg-blue-50"
          >
            EXPLORE LIVE VENDOR DATA
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  )
}
