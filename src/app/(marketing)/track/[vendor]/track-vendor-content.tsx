'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { motion, type Variants } from 'framer-motion';
import { RefreshCw, ShieldCheck, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  vendorService,
  type VendorDetailResponse,
  type VendorHistoryResponse,
  type VendorMetricsResponse,
  type VendorIncidentsResponse,
  type VendorIncident,
  type VendorTimelineResponse,
} from '@/services/vendorService';
import { formatDistanceToNow, format } from 'date-fns';
import { LatencyChart } from '@/components/tracking/LatencyChart';
import { TimeRangeSelector } from '@/components/tracking/TimeRangeSelector';
import Link from 'next/link';

// ─── Design Tokens ─────────────────────────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = {
  auth: '#EB5424',
  cdn: '#F48120',
  ai: '#10A37F',
  payments: '#635BFF',
  communications: '#F22F46',
  infrastructure: '#F6821F',
  hosting: '#0891B2',
  database: '#007AF5',
  monitoring: '#6C5CE7',
};

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string; bg: string }> = {
  up: { label: 'Operational', dotColor: '#16A34A', textColor: 'text-[#16A34A]', bg: 'rgba(22,163,74,0.12)' },
  operational: { label: 'Operational', dotColor: '#16A34A', textColor: 'text-[#16A34A]', bg: 'rgba(22,163,74,0.12)' },
  degraded: { label: 'Degraded', dotColor: '#D97706', textColor: 'text-[#D97706]', bg: 'rgba(217,119,6,0.12)' },
  degraded_performance: { label: 'Degraded', dotColor: '#D97706', textColor: 'text-[#D97706]', bg: 'rgba(217,119,6,0.12)' },
  down: { label: 'Down', dotColor: '#DC2626', textColor: 'text-[#DC2626]', bg: 'rgba(220,38,38,0.12)' },
  partial_outage: { label: 'Partial Outage', dotColor: '#DC2626', textColor: 'text-[#DC2626]', bg: 'rgba(220,38,38,0.12)' },
  major_outage: { label: 'Major Outage', dotColor: '#DC2626', textColor: 'text-[#DC2626]', bg: 'rgba(220,38,38,0.12)' },
  unknown: { label: 'Unknown', dotColor: '#52525B', textColor: 'text-[#52525B]', bg: 'rgba(82,82,91,0.12)' },
};

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  low: { color: '#16A34A', bg: 'rgba(22,163,74,0.12)', label: 'Low' },
  medium: { color: '#D97706', bg: 'rgba(217,119,6,0.12)', label: 'Medium' },
  high: { color: '#DC2626', bg: 'rgba(220,38,38,0.12)', label: 'High' },
  critical: { color: '#DC2626', bg: 'rgba(220,38,38,0.12)', label: 'Critical' },
};

// ─── Animation Helpers ──────────────────────────────────────────────────────────

const prefersReducedMotion = typeof window !== 'undefined'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: prefersReducedMotion ? 0 : 0.08 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' } },
};

// ─── Count-up Hook ──────────────────────────────────────────────────────────────

function useCountUp(target: number | null | undefined, decimals = 0, duration = 800): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null || target === 0) {
      // Defer to next frame to avoid synchronous setState in effect
      const id = requestAnimationFrame(() => setValue(0));
      return () => cancelAnimationFrame(id);
    }
    if (prefersReducedMotion) {
      const id = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(id);
    }

    const start = performance.now();
    const from = 0;
    const to = target;
    let rafId: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(from + (to - from) * eased);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, decimals, duration]);

  return decimals > 0 ? Number(value.toFixed(decimals)) : Math.round(value);
}

// ─── Utility: Format duration ────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds == null) return 'Ongoing';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function getUptimeColor(uptime: number | null | undefined): string {
  if (uptime == null) return '#52525B';
  if (uptime >= 99.95) return '#16A34A';
  if (uptime >= 99) return '#D97706';
  return '#DC2626';
}

function getLatencyColor(ms: number | null | undefined): string {
  if (ms == null || ms === 0) return '#52525B';
  if (ms <= 200) return '#16A34A';
  if (ms <= 500) return '#D97706';
  return '#DC2626';
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function TrackVendorContent({ vendorSlug }: { vendorSlug: string }) {
  const [window, setWindow] = useState('24h');
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Live clock
  useEffect(() => {
    function tick() {
      setCurrentTime(format(new Date(), 'HH:mm:ss') + ' UTC');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Data Fetching ───────────────────────────────────────────────────────────

  const { data: detail, isLoading: detailLoading } = useSWR(
    `vendor-${vendorSlug}`,
    () => vendorService.getVendorDetail(vendorSlug),
    { refreshInterval: 30000 },
  );

  const { data: history } = useSWR(
    `history-${vendorSlug}`,
    () => vendorService.getVendorHistory(vendorSlug),
    { refreshInterval: 30000 },
  );

  const { data: metrics } = useSWR(
    `metrics-${vendorSlug}-${window}`,
    () => vendorService.getVendorMetrics(vendorSlug, window),
    { refreshInterval: 30000 },
  );

  const { data: incidents } = useSWR(
    `incidents-${vendorSlug}`,
    () => vendorService.getVendorIncidents(vendorSlug, 50),
    { refreshInterval: 30000 },
  );

  const { data: timeline } = useSWR(
    `timeline-${vendorSlug}-${window}`,
    () => vendorService.getVendorTimeline(vendorSlug, window as '1h' | '6h' | '24h' | '7d' | '30d' | '90d'),
    { refreshInterval: 30000 },
  );

  // ── Derived Data ────────────────────────────────────────────────────────────

  const displayName = detail?.display_name ?? vendorSlug;
  const category = detail?.category ?? '';
  const recentStatus = detail?.recent_status ?? 'unknown';
  const endpoints = detail?.endpoints ?? [];
  const brandColor = BRAND_COLORS[category] ?? '#0891B2';

  const statusCfg = statusConfig[recentStatus] ?? statusConfig.unknown;

  const selectedWindowMetrics = metrics?.metrics?.[window] ?? null;

  const uptime24h = history?.uptime_percentage_24h ?? selectedWindowMetrics?.uptime_percentage ?? null;
  const avgLatency = history?.avg_latency_ms_24h ?? selectedWindowMetrics?.avg_latency_ms ?? null;
  const p95Latency = selectedWindowMetrics?.p95_latency_ms ?? null;
  const observationCount = history?.recent_checks_count ?? selectedWindowMetrics?.total_observations ?? null;

  // Count-up animated values
  const animatedUptime = useCountUp(uptime24h, 2);
  const animatedLatency = useCountUp(avgLatency);
  const animatedP95 = useCountUp(p95Latency);
  const animatedObservations = useCountUp(observationCount);

  // Chart data — timeline takes priority
  const chartData = useMemo(() => {
    // Prefer timeline points if available
    if (timeline?.points && timeline.points.length > 0) {
      return timeline.points.map((p) => ({
        hour: format(new Date(p.timestamp), 'HH:mm'),
        latency: p.avg_latency_ms ?? 0,
        p95: p.avg_latency_ms ?? 0,
      }));
    }

    // Fall back to metrics
    if (metrics?.metrics && selectedWindowMetrics) {
      // Single-point summary from the window metrics
      return [{
        hour: selectedWindowMetrics.window,
        latency: selectedWindowMetrics.avg_latency_ms ?? 0,
        p95: selectedWindowMetrics.p95_latency_ms ?? 0,
      }];
    }

    return [];
  }, [timeline, metrics, selectedWindowMetrics]);

  // Check if chart data is all zeros
  const hasChartData = chartData.length > 0 && chartData.some((d) => d.latency > 0);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
    toast.success('Data refreshed');
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <motion.nav variants={fadeUp} className="pt-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/track" className="text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
              Vendors
            </Link>
          </li>
          <li className="text-[#52525B]">/</li>
          <li className="text-sm text-[#FAFAFA] font-medium">{displayName}</li>
        </ol>
      </motion.nav>

      {/* ── Hero Header ──────────────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} className="pt-10 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left: Name + Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="shrink-0 w-[10px] h-[10px] rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <h1 className="text-[36px] font-bold text-[#FAFAFA] tracking-[-0.02em] leading-[1.1]">
              {detailLoading ? <Skeleton className="h-9 w-64" /> : displayName}
            </h1>
            {!detailLoading && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-500"
                style={{ backgroundColor: statusCfg.bg, color: statusCfg.textColor }}
              >
                <span
                  className="w-2 h-2 rounded-full transition-colors duration-500"
                  style={{ backgroundColor: statusCfg.dotColor }}
                />
                {statusCfg.label}
              </span>
            )}
          </div>

          {/* Right: Clock + Refresh */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-[#52525B]">{currentTime}</span>
            <button
              onClick={handleRefresh}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#131318] hover:bg-[#1A1A20] transition-colors"
              aria-label="Refresh data"
            >
              <RefreshCw
                className="w-4 h-4 text-[#A1A1AA]"
                style={{
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                }}
              />
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* Description */}
        <p className="text-[15px] text-[#A1A1AA] max-w-2xl mt-3">
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} · ` : ''}
          Vendor intelligence measured continuously by Reliastra.
        </p>

        {/* Live Indicator Bar */}
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 mt-6 flex flex-wrap items-center gap-6 text-sm">
          {/* Last check / Awaiting */}
          {detail?.last_check_at ? (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A]" />
              </span>
              <span className="text-[#A1A1AA]">Measured {formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true })}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
              <span className="text-[#D97706]">Awaiting first observation</span>
            </div>
          )}

          {/* Endpoints monitored */}
          <span className="text-[#A1A1AA]">
            {endpoints.length} endpoint{endpoints.length !== 1 ? 's' : ''} monitored
          </span>

          {/* Observations 24h */}
          {observationCount != null && observationCount > 0 ? (
            <span className="text-[#A1A1AA]">{observationCount.toLocaleString()} observations (24h)</span>
          ) : (
            <span className="text-[#52525B]">0 observations (24h)</span>
          )}
        </div>
      </motion.section>

      {/* ── Quick Stats Bar ──────────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} className="mt-8">
        <div className="bg-[#131318] rounded-2xl border border-[rgba(255,255,255,0.08)] p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Uptime */}
            <div className="border-l-4 pl-4" style={{ borderColor: 'rgba(8,145,178,0.5)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#52525B] mb-2">24h Uptime</p>
              {uptime24h != null ? (
                <p className="font-mono text-3xl font-bold" style={{ color: getUptimeColor(uptime24h) }}>
                  {animatedUptime}%
                </p>
              ) : (
                <p className="font-mono text-3xl font-bold text-[#52525B]">--</p>
              )}
            </div>

            {/* Median Latency */}
            <div className="border-l-4 pl-4" style={{ borderColor: 'rgba(8,145,178,0.5)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#52525B] mb-2">Median Latency</p>
              {avgLatency != null && avgLatency > 0 ? (
                <p className="font-mono text-3xl font-bold" style={{ color: getLatencyColor(avgLatency) }}>
                  {animatedLatency}<span className="text-lg text-[#A1A1AA] ml-1">ms</span>
                </p>
              ) : (
                <p className="font-mono text-3xl font-bold text-[#52525B]">--</p>
              )}
            </div>

            {/* P95 Latency */}
            <div className="border-l-4 pl-4" style={{ borderColor: 'rgba(8,145,178,0.5)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#52525B] mb-2">P95 Latency</p>
              {p95Latency != null && p95Latency > 0 ? (
                <p className="font-mono text-3xl font-bold" style={{ color: getLatencyColor(p95Latency) }}>
                  {animatedP95}<span className="text-lg text-[#A1A1AA] ml-1">ms</span>
                </p>
              ) : (
                <p className="font-mono text-3xl font-bold text-[#52525B]">--</p>
              )}
            </div>

            {/* Observations */}
            <div className="border-l-4 pl-4" style={{ borderColor: 'rgba(8,145,178,0.5)' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#52525B] mb-2">Observations</p>
              {observationCount != null && observationCount > 0 ? (
                <p className="font-mono text-3xl font-bold text-[#FAFAFA]">
                  {animatedObservations.toLocaleString()}
                </p>
              ) : (
                <p className="font-mono text-3xl font-bold text-[#52525B]">--</p>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Latency Chart Section ────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} className="pb-8 mt-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-[#FAFAFA]">Response latency</span>
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0891B2]" />
                Median
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgba(255,255,255,0.3)]" />
                P95
              </span>
            </div>
          </div>
          <TimeRangeSelector active={window} onChange={setWindow} />
        </div>

        <div className="bg-[#131318] rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 mt-4">
          {hasChartData ? (
            <LatencyChart data={chartData} height={300} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-[#52525B] text-sm">
              {timeline || metrics ? 'No latency data available for this window' : <Skeleton className="h-[300px] w-full rounded-xl" />}
            </div>
          )}
          {/* Time range labels */}
          <div className="flex justify-between mt-3">
            <span className="text-[10px] text-[#52525B] font-mono">
              {timeline?.from ? format(new Date(timeline.from), 'MMM d, HH:mm') : ''}
            </span>
            <span className="text-[10px] text-[#52525B] font-mono">
              {timeline?.to ? format(new Date(timeline.to), 'MMM d, HH:mm') : ''}
            </span>
          </div>
        </div>
      </motion.section>

      {/* ── Monitored Endpoints Section ──────────────────────────────────────── */}
      {endpoints.length > 0 && (
        <motion.section variants={fadeUp} className="pb-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#52525B]">
            MONITORED ENDPOINTS
          </h2>
          <div className="bg-[#131318] rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden mt-4">
            {/* Header */}
            <div className="bg-[rgba(255,255,255,0.02)] px-6 py-3 grid grid-cols-[1fr,auto,auto,auto] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
              <span>Endpoint</span>
              <span>Regions</span>
              <span>Status</span>
              <span>Last Check</span>
            </div>

            {/* Rows */}
            {endpoints.map((ep, i) => {
              const epStatus = statusConfig[ep.health_status] ?? statusConfig.unknown;
              return (
                <div
                  key={ep.id ?? i}
                  className="px-6 py-4 grid grid-cols-[1fr,auto,auto,auto] gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <span className="font-mono text-sm text-[#FAFAFA] truncate max-w-xs" title={ep.endpoint_url}>
                    {ep.endpoint_url}
                  </span>
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {ep.regions.map((r) => (
                      <span
                        key={r}
                        className="text-[10px] bg-[rgba(255,255,255,0.05)] rounded px-1.5 py-0.5 text-[#A1A1AA]"
                      >
                        {r}
                      </span>
                    ))}
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{ backgroundColor: epStatus.bg, color: epStatus.textColor }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: epStatus.dotColor }} />
                    {epStatus.label}
                  </span>
                  <span className="font-mono text-sm text-[#52525B]">
                    {ep.last_check_at ? formatDistanceToNow(new Date(ep.last_check_at), { addSuffix: true }) : '--'}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* ── Incident History Section ─────────────────────────────────────────── */}
      <motion.section variants={fadeUp} className="pb-8">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#52525B]">
          INCIDENT HISTORY
        </h2>

        <div className="bg-[#131318] rounded-2xl border border-[rgba(255,255,255,0.08)] p-6 mt-4">
          {incidents && incidents.incidents.length > 0 ? (
            /* ── Timeline with incidents ────────────────────────────────────── */
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-[rgba(255,255,255,0.08)]" />

              <div className="space-y-6">
                {incidents.incidents.map((inc) => {
                  const sev = severityConfig[inc.severity] ?? severityConfig.medium;
                  const incStatus = inc.status === 'resolved' || inc.resolved_at
                    ? { label: 'Resolved', color: '#16A34A', bg: 'rgba(22,163,74,0.12)' }
                    : { label: 'Active', color: '#D97706', bg: 'rgba(217,119,6,0.12)' };

                  return (
                    <div key={inc.incident_id} className="relative flex gap-4">
                      {/* Dot on the line */}
                      <span
                        className="shrink-0 w-[10px] h-[10px] rounded-full mt-1 relative z-10"
                        style={{ backgroundColor: sev.color }}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-[#52525B]">
                          {format(new Date(inc.started_at), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p className="text-sm font-medium text-[#FAFAFA] mt-1">{inc.dependency_name}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: sev.bg, color: sev.color }}
                          >
                            {sev.label}
                          </span>
                          <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(inc.duration_seconds)}
                          </span>
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ backgroundColor: incStatus.bg, color: incStatus.color }}
                          >
                            {incStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── Empty State ──────────────────────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full bg-[rgba(22,163,74,0.2)] animate-ping" style={{ animationDuration: '2s' }} />
                <div className="relative w-16 h-16 rounded-full bg-[rgba(22,163,74,0.12)] flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#16A34A]" />
                </div>
              </div>
              <p className="text-lg font-semibold text-[#FAFAFA] mt-4">No incidents recorded</p>
              <p className="text-sm text-[#A1A1AA] mt-2 text-center max-w-md">
                {displayName} has maintained a clean record in the observed period.
              </p>
              <p className="text-xs text-[#52525B] mt-1 italic">This is a good thing.</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* ── CTA Section ───────────────────────────────────────────────────────── */}
      <motion.section variants={fadeUp} className="py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FAFAFA]">Want deeper intelligence?</h2>
          <p className="text-[15px] text-[#A1A1AA] max-w-lg mx-auto mt-3">
            Get real-time alerts, detailed analytics, and custom dashboards for every vendor in your stack.
          </p>
          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            <Link
              href="/signup"
              className="bg-[#FAFAFA] text-[#0A0A0F] px-6 py-3 rounded-[10px] font-semibold text-sm hover:bg-white hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              Create account
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center">
              <Input
                type="email"
                placeholder="you@company.com"
                className="bg-[#1C1C22] border-[rgba(255,255,255,0.08)] text-[#FAFAFA] placeholder:text-[#52525B] rounded-r-none h-[46px] text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ borderRadius: '10px 0 0 10px' }}
              />
              <button
                onClick={() => toast.success('Alerts registered! Check your inbox.')}
                className="bg-[#0891B2] text-white px-5 py-3 rounded-r-[10px] font-semibold text-sm hover:bg-[#0E7490] transition-colors h-[46px]"
              >
                Get alerts
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
