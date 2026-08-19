'use client'

import { useState, useEffect, useRef, useCallback, useSyncExternalStore, Fragment } from 'react'
import { Info, ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Live incident headline — state machine                             */
/* ------------------------------------------------------------------ */

type Phase = 'observing' | 'detected' | 'investigating' | 'correlating' | 'evidence' | 'idle'

const PHASE_LABEL: Record<Phase, string> = {
  observing: 'Observing',
  detected: 'Incident Detected',
  investigating: 'Investigating',
  correlating: 'Correlating',
  evidence: 'Evidence Ready',
  idle: 'Live Incident Analysis',
}

const PHASE_DOT: Record<Phase, string> = {
  observing: 'bg-slate-400',
  detected: 'bg-red-500',
  investigating: 'bg-blue-600',
  correlating: 'bg-blue-600',
  evidence: 'bg-emerald-600',
  idle: 'bg-slate-400',
}

interface Word {
  key: string
  text: string
}

const LINE_1: Word[] = [
  { key: 'your', text: 'Your' },
  { key: 'site', text: 'site' },
  { key: 'went', text: 'went' },
  { key: 'down', text: 'down.' },
]

const LINE_2: Word[] = [
  { key: 'was', text: 'Was' },
  { key: 'it', text: 'it' },
  { key: 'you', text: 'you,' },
  { key: 'or', text: 'or' },
  { key: 'your-2', text: 'your' },
  { key: 'vendors', text: 'vendors?' },
]

const ALL_WORDS = [...LINE_1, ...LINE_2]

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
}

/* ------------------------------------------------------------------ */
/*  Signal line — thin sweep under the first sentence                 */
/* ------------------------------------------------------------------ */
function SignalLine({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className="absolute left-0 top-full mt-3 block h-px w-full">
      {/* static faint baseline */}
      <span className="absolute inset-x-0 top-0 h-px bg-slate-200" />
      {/* traveling fill */}
      <span
        className="absolute left-0 top-0 h-px w-full origin-left bg-blue-500/70"
        style={{
          transform: on ? 'scaleX(1)' : 'scaleX(0)',
          transitionDuration: on ? '1200ms' : '0ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionProperty: 'transform',
        }}
      />
      {/* leading dot */}
      <span
        className="absolute -top-[3px] h-[7px] w-[7px] rounded-full bg-blue-600"
        style={{
          left: on ? 'calc(100% - 7px)' : '0%',
          opacity: on ? 1 : 0,
          transitionDuration: on ? '1200ms' : '0ms',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionProperty: 'left, opacity',
        }}
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Incident status indicator chip                                     */
/* ------------------------------------------------------------------ */
function IncidentChip({ phase, reduced }: { phase: Phase; reduced: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <span
        aria-hidden="true"
        className={cn('h-1.5 w-1.5 rounded-full', PHASE_DOT[phase], !reduced && 'animate-pulse-soft')}
      />
      <span className="font-mono-numeric text-[10px] font-medium uppercase tracking-[0.14em] text-slate-600">
        {PHASE_LABEL[phase]}
      </span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Correlation signal — hypothesis comparison diagram                 */
/* ------------------------------------------------------------------ */
function CorrelationSignal({ phase, on }: { phase: Phase; on: boolean }) {
  const ready = phase === 'evidence' || phase === 'idle'
  return (
    <div className="mt-8 hidden max-w-xl sm:block" aria-hidden="true">
      <div className="flex items-baseline justify-between text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
        <span>Your Infrastructure</span>
        <span>External Dependencies</span>
      </div>

      <svg viewBox="0 0 640 52" className="mt-1 h-12 w-full" preserveAspectRatio="none">
        <path
          d="M48 6 V22 H320 V40 M592 6 V22 H320"
          fill="none"
          stroke="#CBD5E1"
          strokeWidth="1"
          style={{
            strokeDasharray: 1300,
            strokeDashoffset: on ? 0 : 1300,
            transition: 'stroke-dashoffset 1400ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <circle
          cx="48"
          cy="6"
          r="3"
          fill="#2563EB"
          style={{ opacity: on ? 1 : 0, transition: 'opacity 400ms ease-out 200ms' }}
        />
        <circle
          cx="592"
          cy="6"
          r="3"
          fill="#2563EB"
          style={{ opacity: on ? 1 : 0, transition: 'opacity 400ms ease-out 200ms' }}
        />
        <circle
          cx="320"
          cy="22"
          r="2.5"
          fill="#2563EB"
          style={{ opacity: on ? 1 : 0, transition: 'opacity 400ms ease-out 700ms' }}
        />
      </svg>

      <div className="text-center">
        <span
          className={cn(
            'font-mono-numeric text-[10px] font-medium uppercase tracking-[0.18em]',
            ready ? 'text-emerald-600' : 'text-blue-600'
          )}
        >
          {ready ? 'Evidence Ready' : 'Correlating'}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero Section (exported)                                            */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05, rootMargin: '0px 0px -40px 0px' })
  const reduced = usePrefersReducedMotion()

  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<Phase>('observing')
  const [target, setTarget] = useState<'you' | 'vendors' | null>(null)
  const [sweepOn, setSweepOn] = useState(false)
  const [lastCheck, setLastCheck] = useState(2)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }, [])

  /* Clear timers on unmount */
  useEffect(() => {
    const timers = timersRef.current
    return () => {
      timers.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  /* Incident cycle driven by timers */
  useEffect(() => {
    if (!isVisible || reduced) return

    // Word stagger (enter) — one shot
    ALL_WORDS.forEach((word, i) => {
      schedule(() => {
        setRevealed((prev) => new Set(prev).add(word.key))
      }, i * 70)
    })

    const runCycle = () => {
      setPhase('observing')
      setSweepOn(false)
      setTarget(null)
      schedule(() => {
        setPhase('detected')
        setSweepOn(true)
      }, 1300)
      schedule(() => setPhase('investigating'), 2600)
      schedule(() => setTarget('you'), 2600)
      schedule(() => setTarget('vendors'), 3750)
      schedule(() => setPhase('correlating'), 5200)
      schedule(() => setPhase('evidence'), 7200)
      schedule(() => {
        setPhase('idle')
        setTarget(null)
      }, 9200)
      // Long, stable hold — then a gentle re-run (headline words stay put)
      schedule(runCycle, 9200 + 16000)
    }

    schedule(runCycle, 0)

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [isVisible, reduced, schedule])

  /* Micro-signal tick — occasional "last check" update */
  useEffect(() => {
    if (!isVisible || reduced) return
    const id = setInterval(() => {
      setLastCheck((s) => (s >= 5 ? 1 : s + 1))
    }, 3000)
    return () => clearInterval(id)
  }, [isVisible, reduced])

  const animate = isVisible && !reduced
  const incidentOn = phase === 'detected' || phase === 'investigating'
  const diagramOn = phase === 'correlating' || phase === 'evidence' || phase === 'idle'

  // Reduced motion: settle into a calm, fully-revealed, static state.
  const displayPhase: Phase = reduced ? 'idle' : phase
  const showSweep = reduced ? true : sweepOn
  const showDiagram = reduced ? true : diagramOn

  const renderWord = (word: Word, isLast: boolean) => (
    <Fragment key={word.key}>
      <span
        className={cn(
          'ra-word',
          revealed.has(word.key) && 'ra-word--in',
          word.key === 'down' && incidentOn && 'ra-word-incident',
          ((word.key === 'you' && target === 'you') ||
            (word.key === 'vendors' && target === 'vendors')) &&
            'ra-word-emph'
        )}
      >
        {word.text}
      </span>
      {!isLast && ' '}
    </Fragment>
  )

  return (
    <section ref={ref} className="relative overflow-hidden px-6 pt-32 pb-24 md:pt-40 md:pb-32">
      {/* Subtle ambient wash — restrained, not neon */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(1100px 420px at 18% -12%, rgba(37, 99, 235, 0.05), transparent 60%), radial-gradient(900px 420px at 85% -8%, rgba(15, 23, 42, 0.03), transparent 60%)',
        }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Eyebrow + incident indicator */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            External Dependency Intelligence
          </p>
          <IncidentChip phase={displayPhase} reduced={reduced} />
        </div>

        {/* Headline — live incident animation */}
        <div className={cn('max-w-3xl pt-4', animate && 'ra-hero--animating')}>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            <span className="relative block">
              {LINE_1.map((word, i) => renderWord(word, i === LINE_1.length - 1))}
              <SignalLine on={showSweep} />
            </span>

            <span className="mt-7 block md:mt-8">
              {LINE_2.map((word, i) => renderWord(word, i === LINE_2.length - 1))}
            </span>
          </h1>

          {/* Micro-signals telemetry */}
          <div
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono-numeric text-[11px] uppercase tracking-[0.08em] text-slate-500"
            aria-hidden="true"
          >
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              3 Regions
            </span>
            <span className="text-slate-300">·</span>
            <span>12 Dependencies</span>
            <span className="hidden text-slate-300 sm:inline">·</span>
            <span className="hidden sm:inline">Last Check {lastCheck}s Ago</span>
            <span className="hidden text-slate-300 lg:inline">·</span>
            <span className="hidden text-slate-400 lg:inline">US-EAST · EU-WEST · AP-SOUTHEAST</span>
            <span className="ml-auto hidden text-[10px] text-slate-400 md:inline">
              Simulated signal
            </span>
          </div>

          {/* Correlation hypothesis diagram */}
          <CorrelationSignal phase={displayPhase} on={showDiagram} />
        </div>

        {/* Supporting copy + CTAs */}
        <div className="max-w-3xl space-y-6 pt-6">
          <p className="max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
            Reliastra independently monitors the external services your infrastructure depends
            on, correlates their failures with your incidents, and produces structured evidence
            of what happened.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center rounded bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700"
            >
              START FREE
            </a>
            <a
              href="#vendor-intelligence"
              className="inline-flex items-center justify-center rounded border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
            >
              EXPLORE LIVE VENDOR DATA
            </a>
          </div>
          <p className="text-xs text-slate-400">
            No credit card required · Free monitoring available
          </p>
        </div>

        {/* Incident Panel */}
        <div className="mt-14 max-w-5xl overflow-x-auto md:mt-16">
          <IncidentPanel visible={isVisible} />
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tiny animated counter                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1500, start: boolean) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!start) return
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target * 10) / 10)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration, start])

  return value
}

/* ------------------------------------------------------------------ */
/*  Sparkline — 10 bars, first 6 short, last 4 escalating              */
/* ------------------------------------------------------------------ */
const SPARKLINE_BARS = [
  { h: 8, color: '#10B981' },
  { h: 6, color: '#10B981' },
  { h: 10, color: '#10B981' },
  { h: 7, color: '#10B981' },
  { h: 9, color: '#10B981' },
  { h: 12, color: '#F59E0B' },
  { h: 42, color: '#EF4444' },
  { h: 65, color: '#EF4444' },
  { h: 88, color: '#EF4444' },
  { h: 96, color: '#EF4444' },
] as const

function ErrorRateSparkline() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="h-8 w-16 flex-shrink-0"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {SPARKLINE_BARS.map((bar, i) => (
        <rect
          key={i}
          x={i * 10 + 1}
          y={100 - bar.h}
          width={7}
          height={bar.h}
          rx={1}
          fill={bar.color}
          opacity={0.85}
        />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Status dot                                                         */
/* ------------------------------------------------------------------ */
function StatusDot({ status }: { status: 'healthy' | 'warning' | 'incident' }) {
  const colorMap = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    incident: 'bg-red-500',
  }
  return <span className={cn('inline-block h-2 w-2 flex-shrink-0 rounded-full', colorMap[status])} />
}

/* ------------------------------------------------------------------ */
/*  Progress bar                                                       */
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
/*  Incident Panel                                                     */
/* ------------------------------------------------------------------ */
function IncidentPanel({ visible }: { visible: boolean }) {
  const correlationCount = useCountUp(96.8, 1500, visible)
  const regionalCount = useCountUp(100, 1200, visible)

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-24px_rgba(15,23,42,0.16)]',
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-red-600">
            Incident
          </span>
          <span className="font-mono-numeric text-xs text-slate-400">INC-DEMO-001</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Info className="h-3 w-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Illustrative Data
          </span>
        </div>
      </div>

      {/* Main content — two columns */}
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* Divider on desktop */}
        <div className="hidden border-r border-slate-100 md:block" />

        {/* LEFT COLUMN — Your Service */}
        <div className="space-y-3 px-4 py-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Your Service
          </span>
          <p className="font-mono-numeric text-sm text-slate-900">checkout.example.com</p>
          <p className="text-sm font-medium text-amber-600">CHECKOUT DEGRADATION</p>
          <p className="font-mono-numeric text-xs text-slate-500">
            14:02:00 UTC — 14:25:41 UTC
          </p>

          {/* Error rate metric + sparkline */}
          <div className="flex items-end justify-between gap-3 pt-1">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Error Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-numeric text-sm text-slate-500">0.4%</span>
                <span className="text-slate-400">→</span>
                <span className="font-mono-numeric text-sm text-red-600">18.7%</span>
              </div>
            </div>
            <ErrorRateSparkline />
          </div>
        </div>

        {/* RIGHT COLUMN — Vendor Dependency */}
        <div className="space-y-3 border-t border-slate-100 px-4 py-4 md:border-t-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Vendor Dependency
          </span>
          <p className="font-mono-numeric text-sm text-slate-900">Stripe / EU</p>
          <p className="font-mono-numeric text-xs text-slate-500">
            14:02:04 UTC — 14:25:38 UTC
          </p>

          {/* Latency */}
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Latency
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-numeric text-sm text-slate-500">420ms</span>
              <span className="text-slate-400">→</span>
              <span className="font-mono-numeric text-sm text-red-600">8.4s</span>
            </div>
          </div>

          {/* Error rate */}
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Error Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-numeric text-sm text-slate-500">0.3%</span>
              <span className="text-slate-400">→</span>
              <span className="font-mono-numeric text-sm text-red-600">17.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-4 py-4 md:grid-cols-[1fr_1.4fr_auto] md:items-start md:gap-6">
        {/* Other Dependencies */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Other Dependencies
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono-numeric text-xs text-slate-600">Cloudflare</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status="healthy" />
              <span className="text-xs text-emerald-600">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono-numeric text-xs text-slate-600">Database (RDS)</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status="healthy" />
              <span className="text-xs text-emerald-600">Operational</span>
            </div>
          </div>
        </div>

        {/* Reliastra Analysis */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Reliastra Analysis
          </span>
          <p className="text-xs text-slate-500">Likely contributing dependency</p>
          <p className="text-sm font-medium text-blue-600">Stripe / EU</p>
          <p className="text-sm font-medium text-blue-600">Confidence: HIGH</p>
          <p className="text-xs text-slate-500">Independent observations: 3 / 3 regions</p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Temporal correlation
              </span>
              <span className="font-mono-numeric text-xs text-blue-600">{correlationCount}%</span>
            </div>
            <ProgressBar value={visible ? correlationCount : 0} color="#2563EB" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Regional confirmation
              </span>
              <span className="font-mono-numeric text-xs text-blue-600">3/3</span>
            </div>
            <ProgressBar value={visible ? regionalCount : 0} color="#2563EB" />
          </div>
        </div>

        {/* View Evidence button */}
        <div className="flex items-start md:pt-6">
          <a
            href="#evidence"
            className="inline-flex items-center gap-1.5 rounded border border-blue-600/40 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors duration-200 hover:border-blue-600/70 hover:bg-blue-50"
          >
            View Evidence
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
