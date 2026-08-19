'use client';

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Clock,
  ExternalLink,
  Globe,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  vendorService,
  type VendorDetailResponse,
  type VendorHistoryResponse,
  type VendorIncidentsResponse,
  type VendorMetricsResponse,
  type VendorTimelineResponse,
} from '@/services/vendorService';
import { LatencyChart } from '@/components/tracking/LatencyChart';
import { TimeRangeSelector } from '@/components/tracking/TimeRangeSelector';
import { UptimeLegend, UptimeTimeline } from '@/components/uptime/UptimeTimeline';
import {
  bucketTimelineByDay,
  countObservedDays,
  emptySeries,
  observedAverage,
} from '@/lib/uptime-series';
import type { CatalogVendor } from '@/lib/vendor-catalog';

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.5, ease },
};

type StatusLevel = 'operational' | 'degraded' | 'down' | 'unknown';

const STATUS_META: Record<
  StatusLevel,
  { label: string; color: string; bg: string; glow: string }
> = {
  operational: {
    label: 'Operational',
    color: '#16A34A',
    bg: 'rgba(22,163,74,0.12)',
    glow: '0 0 20px rgba(22,163,74,0.4)',
  },
  degraded: {
    label: 'Degraded',
    color: '#D97706',
    bg: 'rgba(217,119,6,0.12)',
    glow: '0 0 20px rgba(217,119,6,0.4)',
  },
  down: {
    label: 'Down',
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.12)',
    glow: '0 0 20px rgba(220,38,38,0.4)',
  },
  unknown: {
    label: 'Awaiting data',
    color: '#71717A',
    bg: 'rgba(113,113,122,0.12)',
    glow: 'none',
  },
};

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: '#16A34A' },
  medium: { label: 'Medium', color: '#D97706' },
  high: { label: 'High', color: '#DC2626' },
  critical: { label: 'Critical', color: '#DC2626' },
};

function mapStatus(raw: string | undefined | null): StatusLevel {
  if (!raw) return 'unknown';
  const s = raw.toLowerCase();
  if (s === 'up' || s === 'operational' || s === 'healthy') return 'operational';
  if (s === 'degraded' || s === 'degraded_performance' || s === 'partial_outage') return 'degraded';
  if (s === 'down' || s === 'major_outage') return 'down';
  return 'unknown';
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return 'Ongoing';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/* ── Animated count-up ───────────────────────────────────────────────────── */

function useCountUp(target: number | null | undefined, decimals = 0, duration = 900): number {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (target == null) {
      setValue(0);
      return;
    }
    if (reduce) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}

/* ── Stat tile ───────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  suffix,
  accent = '#FAFAFA',
}: {
  label: string;
  value: string | null;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div className="border-l-2 border-[rgba(8,145,178,0.4)] pl-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#52525B]">{label}</p>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums" style={{ color: value ? accent : '#3F3F46' }}>
        {value ?? '—'}
        {value && suffix && <span className="ml-1 text-sm text-[#71717A]">{suffix}</span>}
      </p>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────────────── */

interface Props {
  vendorSlug: string;
  /** Static catalogue entry, when we know this vendor. */
  catalog?: CatalogVendor;
  /** Display name resolved at build time for the SSR shell. */
  fallbackName: string;
}

export function VendorProfile({ vendorSlug, catalog, fallbackName }: Props) {
  const [chartWindow, setChartWindow] = useState('24h');
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(`${format(new Date(), 'HH:mm:ss')} UTC`);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const { data: detail, isLoading: detailLoading } = useSWR<VendorDetailResponse>(
    `vendor-${vendorSlug}`,
    () => vendorService.getVendorDetail(vendorSlug),
    { refreshInterval: 30_000, shouldRetryOnError: false },
  );
  const { data: history } = useSWR<VendorHistoryResponse>(
    `history-${vendorSlug}`,
    () => vendorService.getVendorHistory(vendorSlug),
    { refreshInterval: 30_000, shouldRetryOnError: false },
  );
  const { data: metrics } = useSWR<VendorMetricsResponse>(
    `metrics-${vendorSlug}-${chartWindow}`,
    () => vendorService.getVendorMetrics(vendorSlug, chartWindow),
    { refreshInterval: 30_000, shouldRetryOnError: false },
  );
  const { data: incidents } = useSWR<VendorIncidentsResponse>(
    `incidents-${vendorSlug}`,
    () => vendorService.getVendorIncidents(vendorSlug, 20),
    { refreshInterval: 30_000, shouldRetryOnError: false },
  );
  const { data: timeline } = useSWR<VendorTimelineResponse>(
    `timeline-${vendorSlug}-${chartWindow}`,
    () =>
      vendorService.getVendorTimeline(
        vendorSlug,
        chartWindow as '1h' | '6h' | '24h' | '7d' | '30d' | '90d',
      ),
    { refreshInterval: 30_000, shouldRetryOnError: false },
  );
  const { data: timeline90 } = useSWR<VendorTimelineResponse>(
    `timeline90-${vendorSlug}`,
    () => vendorService.getVendorTimeline(vendorSlug, '90d'),
    { refreshInterval: 300_000, shouldRetryOnError: false },
  );

  const displayName = detail?.display_name || catalog?.name || fallbackName;
  const category = detail?.category || catalog?.category || '';
  const status = mapStatus(detail?.recent_status);
  const statusMeta = STATUS_META[status];
  const accent = catalog?.color ?? '#0891B2';
  const endpoints = detail?.endpoints ?? [];

  const days = useMemo(
    () => (timeline90 ? bucketTimelineByDay(timeline90.points, 90) : emptySeries(90)),
    [timeline90],
  );
  const avg90 = observedAverage(days);
  const observedDays = countObservedDays(days);

  const windowMetrics = metrics?.metrics?.[chartWindow] ?? null;
  const uptime24h = history?.uptime_percentage_24h ?? null;
  const avgLatency = history?.avg_latency_ms_24h ?? windowMetrics?.avg_latency_ms ?? null;
  const p95 = windowMetrics?.p95_latency_ms ?? null;
  const observations = history?.recent_checks_count ?? windowMetrics?.total_observations ?? null;

  const animatedAvg = useCountUp(avg90, 2);
  const animatedLatency = useCountUp(avgLatency);

  const chartData = useMemo(() => {
    if (timeline?.points?.length) {
      return timeline.points.map((p) => ({
        hour: format(new Date(p.timestamp), 'HH:mm'),
        latency: p.avg_latency_ms ?? 0,
        p95: p.avg_latency_ms ?? 0,
      }));
    }
    return [];
  }, [timeline]);

  const hasChartData = chartData.some((d) => d.latency > 0);

  // Split the headline uptime figure so decimals can be tinted cyan.
  const avgStr = avg90 !== null ? animatedAvg.toFixed(2) : null;
  const [avgWhole, avgDecimals] = (avgStr ?? '0.00').split('.');

  const regions = useMemo(() => {
    const set = new Set<string>();
    endpoints.forEach((ep) => ep.regions?.forEach((r) => set.add(r)));
    return Array.from(set);
  }, [endpoints]);

  return (
    <div className="mx-auto max-w-[1120px] px-5 sm:px-6 lg:px-8">
      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="pt-6">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <Link href="/track" className="text-[#71717A] transition-colors hover:text-[#FAFAFA]">
              Vendors
            </Link>
          </li>
          <li className="text-[#3F3F46]" aria-hidden="true">
            /
          </li>
          <li className="font-medium text-[#FAFAFA]">{displayName}</li>
        </ol>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <motion.header
        className="pb-10 pt-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-base font-bold"
                style={{
                  backgroundColor: `${accent}1F`,
                  color: accent,
                  border: `1px solid ${accent}33`,
                }}
              >
                {displayName.slice(0, 2).toUpperCase()}
              </span>
              <h1 className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#FAFAFA] sm:text-[44px]">
                {displayName}
              </h1>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}
              >
                <span className="relative flex h-2 w-2">
                  {status === 'operational' && (
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                      style={{ backgroundColor: statusMeta.color }}
                    />
                  )}
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusMeta.color, boxShadow: statusMeta.glow }}
                  />
                </span>
                {statusMeta.label}
              </span>

              {category && (
                <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1.5 text-xs font-medium capitalize text-[#A1A1AA]">
                  {category}
                </span>
              )}

              {detail?.last_check_at && (
                <span className="text-xs text-[#71717A]">
                  Measured {formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true })}
                </span>
              )}
            </div>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[#A1A1AA]">
              {catalog?.summary ? `${catalog.summary} ` : ''}
              Independent reliability observations for {displayName}, measured continuously by
              Reliastra from infrastructure outside both your stack and the vendor&apos;s.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="font-mono text-sm text-[#52525B]">{clock}</span>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#131318]"
              title="Auto-refreshes every 30 seconds"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#52525B]" aria-hidden="true" />
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── SLA performance hero number ────────────────────────────────── */}
      <motion.section
        className="overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease }}
        aria-labelledby="sla-performance-heading"
      >
        <div
          className="grid grid-cols-1 gap-8 p-7 sm:p-9 lg:grid-cols-[minmax(0,340px)_1fr]"
          style={{
            background:
              'radial-gradient(ellipse 60% 100% at 0% 0%, rgba(8,145,178,0.12) 0%, transparent 70%)',
          }}
        >
          {/* Big number */}
          <div>
            <h2
              id="sla-performance-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]"
            >
              SLA Performance · 90 days
            </h2>
            {avg90 === null ? (
              <>
                <p className="mt-3 font-mono text-[56px] font-extrabold leading-none tracking-[-0.04em] text-[#3F3F46]">
                  —
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-[#71717A]">
                  No observations recorded yet for this window.
                </p>
              </>
            ) : (
              <>
                <p className="mt-3 font-mono text-[56px] font-extrabold leading-none tracking-[-0.04em] text-[#FAFAFA] sm:text-[68px]">
                  {avgWhole}
                  <span className="text-[#0891B2]">.{avgDecimals}</span>
                  <span className="ml-1 text-3xl text-[#52525B]">%</span>
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-[#A1A1AA]">
                  observed uptime across{' '}
                  <span className="font-semibold text-[#FAFAFA]">{observedDays}</span> measured{' '}
                  {observedDays === 1 ? 'day' : 'days'}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-[#52525B]">
                  This is what Reliastra observed externally. It is not {displayName}&apos;s own
                  SLA calculation, which uses their measurement method and exclusions.
                </p>
              </>
            )}
          </div>

          {/* 90-day visualization */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">
                Daily availability
              </span>
              <UptimeLegend theme="dark" />
            </div>
            <UptimeTimeline
              days={days}
              theme="dark"
              height={72}
              label={`90-day observed availability for ${displayName}`}
            />
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-2 gap-6 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] p-7 sm:p-8 lg:grid-cols-4">
          <Stat
            label="24h uptime"
            value={uptime24h !== null ? uptime24h.toFixed(2) : null}
            suffix="%"
            accent={uptime24h !== null && uptime24h >= 99.5 ? '#16A34A' : '#D97706'}
          />
          <Stat
            label="Median latency"
            value={avgLatency ? String(animatedLatency) : null}
            suffix="ms"
          />
          <Stat label="P95 latency" value={p95 ? String(Math.round(p95)) : null} suffix="ms" />
          <Stat
            label="Observations (24h)"
            value={observations ? observations.toLocaleString() : null}
          />
        </div>
      </motion.section>

      {/* ── Latency ────────────────────────────────────────────────────── */}
      <motion.section className="mt-6" {...fadeUp} aria-labelledby="latency-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 id="latency-heading" className="text-sm font-semibold text-[#FAFAFA]">
            Response latency
          </h2>
          <TimeRangeSelector active={chartWindow} onChange={setChartWindow} />
        </div>
        <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14] p-5 sm:p-7">
          {hasChartData ? (
            <LatencyChart data={chartData} height={260} />
          ) : (
            <div className="flex h-[260px] flex-col items-center justify-center gap-2 text-center">
              {timeline || metrics ? (
                <>
                  <Activity className="h-6 w-6 text-[#3F3F46]" aria-hidden="true" />
                  <p className="text-sm text-[#52525B]">
                    No latency observations for this window yet
                  </p>
                </>
              ) : (
                <Skeleton className="h-[240px] w-full rounded-xl" />
              )}
            </div>
          )}
          {timeline?.from && timeline?.to && (
            <div className="mt-3 flex justify-between font-mono text-[10px] text-[#3F3F46]">
              <span>{format(new Date(timeline.from), 'MMM d, HH:mm')}</span>
              <span>{format(new Date(timeline.to), 'MMM d, HH:mm')}</span>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── Incidents + sidebar ────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Incidents */}
        <motion.section {...fadeUp} aria-labelledby="incidents-heading">
          <h2 id="incidents-heading" className="mb-4 text-sm font-semibold text-[#FAFAFA]">
            Recent incidents
          </h2>
          <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14] p-6 sm:p-7">
            {incidents?.incidents?.length ? (
              <div className="relative">
                <div className="absolute bottom-2 left-[6px] top-2 w-px bg-[rgba(255,255,255,0.08)]" />
                <ol className="space-y-6">
                  {incidents.incidents.map((inc, i) => {
                    const sev = SEVERITY_META[inc.severity] ?? SEVERITY_META.medium;
                    const resolved = inc.status === 'resolved' || Boolean(inc.resolved_at);
                    return (
                      <motion.li
                        key={inc.incident_id}
                        className="relative flex gap-4"
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.25), ease }}
                      >
                        <span
                          className="relative z-10 mt-1.5 h-[13px] w-[13px] shrink-0 rounded-full border-[3px] border-[#0F0F14]"
                          style={{ backgroundColor: sev.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[11px] text-[#52525B]">
                            {format(new Date(inc.started_at), 'MMM d, yyyy HH:mm')} UTC
                          </p>
                          <p className="mt-1 text-sm font-medium text-[#FAFAFA]">
                            {inc.dependency_name || displayName}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                              style={{ backgroundColor: `${sev.color}1F`, color: sev.color }}
                            >
                              {sev.label}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-[#71717A]">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {formatDuration(inc.duration_seconds)}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                resolved
                                  ? 'bg-[rgba(22,163,74,0.12)] text-[#16A34A]'
                                  : 'bg-[rgba(217,119,6,0.12)] text-[#D97706]',
                              )}
                            >
                              {resolved ? 'Resolved' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ol>
              </div>
            ) : (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
                  <span
                    className="absolute inset-0 animate-ping rounded-full bg-[rgba(22,163,74,0.15)]"
                    style={{ animationDuration: '2.5s' }}
                  />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(22,163,74,0.10)]">
                    <ShieldCheck className="h-6 w-6 text-[#16A34A]" aria-hidden="true" />
                  </div>
                </div>
                <p className="font-medium text-[#FAFAFA]">No incidents recorded</p>
                <p className="mt-1.5 max-w-sm text-sm text-[#71717A]">
                  {displayName} has a clean record across the observed period.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Sidebar */}
        <motion.aside className="space-y-6" {...fadeUp}>
          {/* Monitoring detail */}
          <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14] p-6">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">
              What we observe
            </h2>

            {detailLoading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {(endpoints.length
                  ? endpoints.map((ep) => ep.endpoint_url)
                  : (catalog?.observes ?? [])
                ).map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span className="min-w-0 break-words font-mono text-[12px] leading-relaxed text-[#A1A1AA]">
                      {item}
                    </span>
                  </li>
                ))}
                {!endpoints.length && !catalog?.observes?.length && (
                  <li className="text-sm text-[#52525B]">Endpoint list not yet published.</li>
                )}
              </ul>
            )}

            {regions.length > 0 && (
              <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
                <p className="mb-2.5 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]">
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  Observed from
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {regions.map((r) => (
                    <span
                      key={r}
                      className="rounded-md bg-[rgba(255,255,255,0.05)] px-2 py-1 font-mono text-[10px] text-[#A1A1AA]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {catalog?.statusPage && (
              <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
                <a
                  href={catalog.statusPage}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#71717A] transition-colors hover:text-[#0891B2]"
                >
                  {displayName}&apos;s own status page
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <p className="mt-2 text-[11px] leading-relaxed text-[#3F3F46]">
                  Linked as context. Vendor status pages are operator-declared, not independent
                  measurement.
                </p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div
            className="rounded-[22px] border border-[rgba(8,145,178,0.2)] p-6"
            style={{
              background:
                'radial-gradient(ellipse 100% 100% at 0% 0%, rgba(8,145,178,0.14) 0%, transparent 70%), #0F0F14',
            }}
          >
            <h2 className="text-[15px] font-semibold text-[#FAFAFA]">
              Track {displayName} for your stack
            </h2>
            <p className="mt-2.5 text-[13px] leading-relaxed text-[#A1A1AA]">
              Correlate these observations with your own incidents and export timestamped evidence
              for a credit claim.
            </p>
            <Link
              href="/register"
              className="group mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[#FAFAFA] text-sm font-semibold text-[#0A0A0F] transition-all duration-200 hover:shadow-lg"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tools/sla-credit-calculator"
              className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-[10px] border border-[rgba(255,255,255,0.10)] text-sm font-semibold text-[#A1A1AA] transition-colors hover:bg-[rgba(255,255,255,0.04)] hover:text-[#FAFAFA]"
            >
              SLA credit calculator
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </motion.aside>
      </div>

      {/* ── Methodology ────────────────────────────────────────────────── */}
      <motion.section className="mt-6 mb-16" {...fadeUp} aria-labelledby="methodology-heading">
        <div className="rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0F0F14] p-7 sm:p-8">
          <h2
            id="methodology-heading"
            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#52525B]"
          >
            Methodology
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: 'Independent origin',
                body: `Checks run from cloud regions operated by neither ${displayName} nor you, so an observation is not attributable to either party's infrastructure.`,
              },
              {
                title: 'Fixed schedule',
                body: 'Observations are recorded on a fixed interval and continue whether or not an incident has been declared, so the record exists before it is needed.',
              },
              {
                title: 'Nothing inferred',
                body: 'Days with no observations are shown as no data rather than assumed healthy. Every figure on this page comes from a recorded measurement.',
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="text-[13px] font-semibold text-[#FAFAFA]">{item.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[#71717A]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
