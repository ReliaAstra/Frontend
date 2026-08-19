'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Info, ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Animated Headline                                                  */
/* ------------------------------------------------------------------ */
type WordAccent = 'none' | 'incident' | 'accent'

interface HeadlineWord {
  text: string
  accent: WordAccent
  delay: number // ms after isVisible, when this word starts revealing
}

const HEADLINE_WORDS: HeadlineWord[][] = [
  // Line 1: "Your site went down."
  [
    { text: 'Your', accent: 'none', delay: 0 },
    { text: 'site', accent: 'none', delay: 60 },
    { text: 'went', accent: 'none', delay: 110 },
    { text: 'down.', accent: 'incident', delay: 180 },
  ],
  // Line 2: "Was it you, or your vendors?"
  [
    { text: 'Was', accent: 'none', delay: 380 },
    { text: 'it', accent: 'none', delay: 430 },
    { text: 'you,', accent: 'none', delay: 480 },
    { text: 'or', accent: 'none', delay: 540 },
    { text: 'your', accent: 'none', delay: 590 },
    { text: 'vendors?', accent: 'accent', delay: 670 },
  ],
]

function AnimatedHeadline({ visible, className }: { visible: boolean; className?: string }) {
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set())
  const [cursorVisible, setCursorVisible] = useState(false)
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const flatWords = useMemo(
    () => HEADLINE_WORDS.flat(),
    []
  )

  // Total word count for cursor timing
  const totalWords = flatWords.length

  const scheduleReveal = useCallback((
    wordIndex: number,
    delay: number,
  ) => {
    const timer = setTimeout(() => {
      setRevealedWords(prev => {
        const next = new Set(prev)
        next.add(wordIndex)
        return next
      })
      // Show cursor after the last word
      if (wordIndex === totalWords - 1) {
        const existing = timersRef.current.get(-1)
        if (existing) clearTimeout(existing)
        const cursorTimer = setTimeout(() => setCursorVisible(true), 120)
        timersRef.current.set(-1, cursorTimer)
      }
    }, delay)
    timersRef.current.set(wordIndex, timer)
  }, [totalWords])

  useEffect(() => {
    if (!visible) return

    flatWords.forEach((word, i) => {
      scheduleReveal(i, word.delay)
    })

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current.clear()
      setRevealedWords(new Set())
      setCursorVisible(false)
    }
  }, [visible, flatWords, scheduleReveal])

  const accentClass = (accent: WordAccent, isRevealed: boolean) => {
    if (!isRevealed) return ''
    if (accent === 'incident') return 'animate-glow-incident'
    if (accent === 'accent') return 'animate-glow-accent'
    return ''
  }

  return (
    <h1 className={className}>
      {HEADLINE_WORDS.map((line, lineIdx) => (
        <span key={lineIdx}>
          {lineIdx > 0 && <br />}
          {line.map((word, wordIdx) => {
            const flatIdx = HEADLINE_WORDS.slice(0, lineIdx).flat().length + wordIdx
            const isRevealed = revealedWords.has(flatIdx)
            return (
              <span
                key={`${lineIdx}-${wordIdx}`}
                className={cn(
                  'headline-word',
                  isRevealed && 'revealed',
                  accentClass(word.accent, isRevealed),
                )}
              >
                {word.text}
              </span>
            )
          })}
        </span>
      ))}
      {/* Blinking terminal cursor */}
      <span
        className={cn(
          'ml-0.5 inline-block w-[3px] h-[0.85em] align-middle rounded-sm bg-[#3B82F6] transition-opacity duration-300',
          cursorVisible ? 'animate-cursor-blink opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      />
    </h1>
  )
}

/* ------------------------------------------------------------------ */
/*  Tiny animated counter                                            */
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
      // ease-out cubic
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
/*  Sparkline — 10 bars, first 6 short, last 4 escalating            */
/* ------------------------------------------------------------------ */
const SPARKLINE_BARS = [
  { h: 8, color: '#22C55E' },
  { h: 6, color: '#22C55E' },
  { h: 10, color: '#22C55E' },
  { h: 7, color: '#22C55E' },
  { h: 9, color: '#22C55E' },
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
/*  Status dot                                                       */
/* ------------------------------------------------------------------ */
function StatusDot({ status }: { status: 'healthy' | 'warning' | 'incident' }) {
  const colorMap = {
    healthy: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    incident: 'bg-[#EF4444]',
  }
  return <span className={cn('inline-block h-2 w-2 flex-shrink-0 rounded-full', colorMap[status])} />
}

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
/*  Incident Panel                                                    */
/* ------------------------------------------------------------------ */
function IncidentPanel({ visible }: { visible: boolean }) {
  const correlationCount = useCountUp(96.8, 1500, visible)
  const regionalCount = useCountUp(100, 1200, visible)

  return (
    <div
      className={cn(
        'rounded-lg border border-[rgba(148,163,184,0.08)] bg-[#0E131B] shadow-[0_0_60px_-12px_rgba(59,130,246,0.06)]',
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[rgba(148,163,184,0.08)] px-4 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-[#EF4444]">
            Incident
          </span>
          <span className="font-mono-numeric text-xs text-[#5A6577]">
            INC-DEMO-001
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[#5A6577]">
          <Info className="h-3 w-3" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Illustrative Data
          </span>
        </div>
      </div>

      {/* Main content — two columns */}
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {/* Divider on desktop */}
        <div className="hidden border-r border-[rgba(148,163,184,0.08)] md:block" />

        {/* LEFT COLUMN — Your Service */}
        <div className="space-y-3 px-4 py-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
            Your Service
          </span>
          <p className="font-mono-numeric text-sm text-[#F3F5F7]">
            checkout.example.com
          </p>
          <p className="text-sm font-medium text-[#F59E0B]">
            CHECKOUT DEGRADATION
          </p>
          <p className="font-mono-numeric text-xs text-[#8D98A8]">
            14:02:00 UTC — 14:25:41 UTC
          </p>

          {/* Error rate metric + sparkline */}
          <div className="flex items-end justify-between gap-3 pt-1">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
                Error Rate
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono-numeric text-sm text-[#8D98A8]">0.4%</span>
                <span className="text-[#5A6577]">→</span>
                <span className="font-mono-numeric text-sm text-[#EF4444]">18.7%</span>
              </div>
            </div>
            <ErrorRateSparkline />
          </div>
        </div>

        {/* RIGHT COLUMN — Vendor Dependency */}
        <div className="space-y-3 border-t border-[rgba(148,163,184,0.08)] px-4 py-4 md:border-t-0">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
            Vendor Dependency
          </span>
          <p className="font-mono-numeric text-sm text-[#F3F5F7]">
            Stripe / EU
          </p>
          <p className="font-mono-numeric text-xs text-[#8D98A8]">
            14:02:04 UTC — 14:25:38 UTC
          </p>

          {/* Latency */}
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
              Latency
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-numeric text-sm text-[#8D98A8]">420ms</span>
              <span className="text-[#5A6577]">→</span>
              <span className="font-mono-numeric text-sm text-[#EF4444]">8.4s</span>
            </div>
          </div>

          {/* Error rate */}
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
              Error Rate
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono-numeric text-sm text-[#8D98A8]">0.3%</span>
              <span className="text-[#5A6577]">→</span>
              <span className="font-mono-numeric text-sm text-[#EF4444]">17.1%</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid grid-cols-1 gap-4 border-t border-[rgba(148,163,184,0.08)] px-4 py-4 md:grid-cols-[1fr_1.4fr_auto] md:items-start md:gap-6">
        {/* Other Dependencies */}
        <div className="space-y-2">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
            Other Dependencies
          </span>
          <div className="flex items-center justify-between">
            <span className="font-mono-numeric text-xs text-[#8D98A8]">Cloudflare</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status="healthy" />
              <span className="text-xs text-[#22C55E]">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono-numeric text-xs text-[#8D98A8]">Database (RDS)</span>
            <div className="flex items-center gap-1.5">
              <StatusDot status="healthy" />
              <span className="text-xs text-[#22C55E]">Operational</span>
            </div>
          </div>
        </div>

        {/* Reliastra Analysis */}
        <div className="space-y-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
            Reliastra Analysis
          </span>
          <p className="text-xs text-[#8D98A8]">
            Likely contributing dependency
          </p>
          <p className="text-sm font-medium text-[#3B82F6]">
            Stripe / EU
          </p>
          <p className="text-sm font-medium text-[#3B82F6]">
            Confidence: HIGH
          </p>
          <p className="text-xs text-[#8D98A8]">
            Independent observations: 3 / 3 regions
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
                Temporal correlation
              </span>
              <span className="font-mono-numeric text-xs text-[#3B82F6]">
                {correlationCount}%
              </span>
            </div>
            <ProgressBar value={visible ? correlationCount : 0} color="#3B82F6" />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#5A6577]">
                Regional confirmation
              </span>
              <span className="font-mono-numeric text-xs text-[#3B82F6]">
                3/3
              </span>
            </div>
            <ProgressBar value={visible ? regionalCount : 0} color="#3B82F6" />
          </div>
        </div>

        {/* View Evidence button */}
        <div className="flex items-start md:pt-6">
          <a
            href="#evidence"
            className="inline-flex items-center gap-1.5 rounded border border-[rgba(59,130,246,0.4)] px-3 py-1.5 text-xs font-medium text-[#3B82F6] transition-colors duration-200 hover:border-[rgba(59,130,246,0.7)] hover:bg-[rgba(59,130,246,0.06)]"
          >
            View Evidence
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero Section (exported)                                           */
/* ------------------------------------------------------------------ */
export function HeroSection() {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.05, rootMargin: '0px 0px -40px 0px' })

  return (
    <section
      ref={ref}
      className="relative pt-32 pb-24 md:pt-40 md:pb-32 px-6"
    >
      <div className="mx-auto max-w-6xl">
        {/* Eyebrow — fades in before headline */}
        <p
          className={cn(
            'max-w-3xl text-xs uppercase tracking-[0.2em] text-[#5A6577] transition-all duration-500 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          )}
        >
          External Dependency Intelligence
        </p>

        {/* Headline — animated word-by-word reveal (own container, no parent opacity) */}
        <div className="max-w-3xl pt-4">
          <AnimatedHeadline
            visible={isVisible}
            className="text-3xl font-bold leading-tight text-[#F3F5F7] md:text-5xl lg:text-6xl"
          />
        </div>

        {/* Supporting copy + CTAs — fade in after headline completes */}
        <div
          className={cn(
            'max-w-3xl space-y-6 pt-6 transition-all duration-700 ease-out',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
          style={{ transitionDelay: isVisible ? '900ms' : '0ms' }}
        >
          <p className="max-w-2xl text-base leading-relaxed text-[#8D98A8] md:text-lg">
            Reliastra independently monitors the external services your
            infrastructure depends on, correlates their failures with your
            incidents, and produces structured evidence of what happened.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-4">
            <a
              href="#start"
              className="inline-flex items-center justify-center rounded bg-[#3B82F6] px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#2563EB]"
            >
              START FREE
            </a>
            <a
              href="#vendor-data"
              className="inline-flex items-center justify-center rounded border border-[rgba(148,163,184,0.15)] px-6 py-2.5 text-sm font-medium text-[#8D98A8] transition-colors duration-200 hover:border-[rgba(148,163,184,0.3)] hover:text-[#F3F5F7]"
            >
              EXPLORE LIVE VENDOR DATA
            </a>
          </div>
          <p className="text-xs text-[#5A6577]">
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
