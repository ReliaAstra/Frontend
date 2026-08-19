'use client';

import { useEffect, useMemo, useState, useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

export type DayStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface UptimeDay {
  /** ISO date (YYYY-MM-DD) for the bucket. */
  date: string;
  /** Observed uptime percentage for the day, or null when not observed. */
  uptime: number | null;
  status: DayStatus;
  /** Optional label describing what happened, shown in the tooltip. */
  note?: string;
}

const TONE: Record<DayStatus, { bar: string; glow: string; label: string; text: string }> = {
  operational: {
    bar: 'bg-[#16A34A]',
    glow: 'shadow-[0_0_10px_rgba(22,163,74,0.45)]',
    label: 'Operational',
    text: 'text-[#16A34A]',
  },
  degraded: {
    bar: 'bg-[#D97706]',
    glow: 'shadow-[0_0_10px_rgba(217,119,6,0.5)]',
    label: 'Degraded',
    text: 'text-[#D97706]',
  },
  down: {
    bar: 'bg-[#DC2626]',
    glow: 'shadow-[0_0_10px_rgba(220,38,38,0.5)]',
    label: 'Outage',
    text: 'text-[#DC2626]',
  },
  unknown: {
    bar: 'bg-[#E4E4E7]',
    glow: '',
    label: 'No data',
    text: 'text-[#A1A1AA]',
  },
};

const DARK_TONE: Record<DayStatus, string> = {
  operational: 'bg-[#16A34A]',
  degraded: 'bg-[#D97706]',
  down: 'bg-[#DC2626]',
  unknown: 'bg-[rgba(255,255,255,0.10)]',
};

function formatDay(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

interface Props {
  days: UptimeDay[];
  /** Colour treatment for light marketing pages or the dark console theme. */
  theme?: 'light' | 'dark';
  /** Height of the bars in pixels. */
  height?: number;
  /** Show the Nx days ago / today axis beneath. */
  showAxis?: boolean;
  className?: string;
  /** Accessible description of what this timeline represents. */
  label?: string;
}

/**
 * A 90-day stacked availability bar.
 *
 * Each segment is one observation day. Segments animate in on scroll with a
 * short stagger, and reveal an on-hover tooltip with the day's figure.
 */
/**
 * Number of day-segments to render at the current viewport width.
 *
 * 90 two-pixel bars do not fit inside a 375px screen, so narrow viewports
 * show a shorter, still-legible window rather than overflowing or rendering
 * sub-pixel slivers. The full series is always described to screen readers.
 */
function useVisibleDayCount(total: number): number {
  const [count, setCount] = useState(total);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 480) return Math.min(total, 30);
      if (w < 768) return Math.min(total, 60);
      return total;
    };
    const apply = () => setCount(compute());
    apply();
    window.addEventListener('resize', apply, { passive: true });
    return () => window.removeEventListener('resize', apply);
  }, [total]);

  return count;
}

export function UptimeTimeline({
  days,
  theme = 'light',
  height = 44,
  showAxis = true,
  className,
  label = 'Daily observed availability for the last 90 days',
}: Props) {
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const tooltipId = useId();

  const visibleCount = useVisibleDayCount(days.length);
  // Always keep the most recent days when the window is truncated.
  const visibleDays = useMemo(
    () => (visibleCount >= days.length ? days : days.slice(days.length - visibleCount)),
    [days, visibleCount],
  );

  const summary = useMemo(() => {
    const observed = days.filter((d) => d.uptime !== null);
    if (observed.length === 0) return null;
    const avg = observed.reduce((acc, d) => acc + (d.uptime ?? 0), 0) / observed.length;
    const incidentDays = days.filter((d) => d.status === 'down' || d.status === 'degraded').length;
    return { avg, observedDays: observed.length, incidentDays };
  }, [days]);

  const activeDay = active !== null ? visibleDays[active] : null;

  return (
    <div className={cn('w-full', className)}>
      <div
        className="relative"
        onMouseLeave={() => setActive(null)}
        role="img"
        aria-label={
          summary
            ? `${label}. Average ${summary.avg.toFixed(2)} percent across ${summary.observedDays} observed days.`
            : label
        }
      >
        {/* Bars */}
        <div className="flex items-end gap-[2px] sm:gap-[3px]" style={{ height }}>
          {visibleDays.map((day, i) => {
            const tone = TONE[day.status];
            const isActive = active === i;
            return (
              <motion.button
                key={day.date}
                type="button"
                className={cn(
                  'group relative flex-1 min-w-[2px] rounded-[2px] origin-bottom outline-none',
                  'focus-visible:ring-2 focus-visible:ring-[#0891B2] focus-visible:ring-offset-2',
                  theme === 'dark'
                    ? cn(DARK_TONE[day.status], 'focus-visible:ring-offset-[#0A0A0F]')
                    : cn(tone.bar, 'focus-visible:ring-offset-white'),
                  isActive && day.status !== 'unknown' && tone.glow,
                )}
                style={{ height: '100%' }}
                initial={reduce ? false : { scaleY: 0, opacity: 0 }}
                whileInView={reduce ? undefined : { scaleY: 1, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.4,
                  delay: Math.min(i * 0.006, 0.6),
                  ease,
                }}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-describedby={isActive ? tooltipId : undefined}
              >
                <span className="sr-only">
                  {formatDay(day.date)}:{' '}
                  {day.uptime !== null ? `${day.uptime.toFixed(2)}% uptime` : 'no data'}
                </span>
                {/* Hover lift */}
                <span
                  className={cn(
                    'pointer-events-none absolute inset-0 rounded-[2px] bg-white/0 transition-all duration-150',
                    'group-hover:bg-white/20',
                  )}
                />
              </motion.button>
            );
          })}
        </div>

        {/* Tooltip */}
        {activeDay && (
          <div
            id={tooltipId}
            role="tooltip"
            className={cn(
              'pointer-events-none absolute -top-2 left-1/2 z-20 -translate-x-1/2 -translate-y-full',
              'rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap',
              theme === 'dark'
                ? 'bg-[#1A1A20] text-[#FAFAFA] border border-[rgba(255,255,255,0.10)]'
                : 'bg-[#09090B] text-white',
            )}
          >
            <span className="font-semibold">{formatDay(activeDay.date)}</span>
            <span className="mx-2 opacity-40">·</span>
            <span className="font-mono tabular-nums">
              {activeDay.uptime !== null ? `${activeDay.uptime.toFixed(2)}%` : 'No data'}
            </span>
            {activeDay.note && (
              <>
                <span className="mx-2 opacity-40">·</span>
                <span className="opacity-80">{activeDay.note}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Axis */}
      {showAxis && (
        <div
          className={cn(
            'mt-3 flex items-center justify-between text-[11px] font-medium',
            theme === 'dark' ? 'text-[#52525B]' : 'text-[#A1A1AA]',
          )}
        >
          <span>{visibleDays.length} days ago</span>
          <span className="hidden sm:inline">
            {summary
              ? `${summary.observedDays} days observed`
              : 'Awaiting observations'}
          </span>
          <span>Today</span>
        </div>
      )}
    </div>
  );
}

/** Small legend shared by pages that render an UptimeTimeline. */
export function UptimeLegend({ theme = 'light' }: { theme?: 'light' | 'dark' }) {
  const items: { status: DayStatus; label: string }[] = [
    { status: 'operational', label: 'Operational' },
    { status: 'degraded', label: 'Degraded' },
    { status: 'down', label: 'Outage' },
    { status: 'unknown', label: 'No data' },
  ];
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium',
        theme === 'dark' ? 'text-[#52525B]' : 'text-[#A1A1AA]',
      )}
    >
      {items.map((item) => (
        <span key={item.status} className="inline-flex items-center gap-1.5">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-[2px]',
              theme === 'dark' ? DARK_TONE[item.status] : TONE[item.status].bar,
            )}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
