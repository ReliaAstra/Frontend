'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Inbox,
  RefreshCw,
  Rss,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  vendorService,
  type VendorDetailResponse,
  type VendorHistoryResponse,
  type VendorIncident,
  type VendorTimelineResponse,
} from '@/services/vendorService';
import { UptimeLegend, UptimeTimeline, type UptimeDay } from '@/components/uptime/UptimeTimeline';
import { bucketTimelineByDay, emptySeries, observedAverage } from '@/lib/uptime-series';

const ease = [0.25, 0.1, 0.25, 1] as const;
const REFRESH_INTERVAL_MS = 60_000;

type StatusLevel = 'operational' | 'degraded' | 'down' | 'unknown';

interface ComponentRow {
  key: string;
  name: string;
  category: string;
  status: StatusLevel;
  uptime24h: number | null;
  days: UptimeDay[];
  observedAvg: number | null;
}

interface AggregatedIncident extends VendorIncident {
  vendorName: string;
}

const STATUS_META: Record<
  StatusLevel,
  { label: string; dot: string; text: string; chip: string; ring: string }
> = {
  operational: {
    label: 'Operational',
    dot: 'bg-[#16A34A]',
    text: 'text-[#16A34A]',
    chip: 'bg-[#16A34A]/10 border-[#16A34A]/20',
    ring: 'rgba(22,163,74,0.35)',
  },
  degraded: {
    label: 'Degraded',
    dot: 'bg-[#D97706]',
    text: 'text-[#D97706]',
    chip: 'bg-[#D97706]/10 border-[#D97706]/20',
    ring: 'rgba(217,119,6,0.35)',
  },
  down: {
    label: 'Outage',
    dot: 'bg-[#DC2626]',
    text: 'text-[#DC2626]',
    chip: 'bg-[#DC2626]/10 border-[#DC2626]/20',
    ring: 'rgba(220,38,38,0.35)',
  },
  unknown: {
    label: 'Awaiting data',
    dot: 'bg-[#A1A1AA]',
    text: 'text-[#A1A1AA]',
    chip: 'bg-[#F8F9FA] border-[#E4E4E7]',
    ring: 'rgba(161,161,170,0.3)',
  },
};

function mapStatus(raw: string | undefined | null): StatusLevel {
  if (!raw) return 'unknown';
  const s = raw.toLowerCase();
  if (s === 'operational' || s === 'up' || s === 'healthy') return 'operational';
  if (s === 'degraded' || s === 'degraded_performance' || s === 'partial_outage') return 'degraded';
  if (s === 'down' || s === 'major_outage') return 'down';
  return 'unknown';
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return 'Ongoing';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC'
  );
}

/* ── The big breathing status indicator ─────────────────────────────────── */

function OverallStatus({
  level,
  loading,
  componentCount,
}: {
  level: StatusLevel;
  loading: boolean;
  componentCount: number;
}) {
  const meta = STATUS_META[level];
  const headline =
    level === 'operational'
      ? 'All Systems Operational'
      : level === 'degraded'
        ? 'Degraded Performance'
        : level === 'down'
          ? 'Active Outage'
          : 'Awaiting Observations';

  const sub =
    level === 'operational'
      ? `All ${componentCount} monitored component${componentCount === 1 ? '' : 's'} responding normally.`
      : level === 'degraded'
        ? 'One or more components are responding slowly or intermittently.'
        : level === 'down'
          ? 'One or more components are not responding. We are investigating.'
          : 'Components will appear here as observations arrive.';

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease }}
    >
      {/* Breathing orb */}
      <div className="relative mx-auto mb-8 flex h-20 w-20 items-center justify-center">
        <motion.span
          className={cn('absolute inset-0 rounded-full', meta.dot)}
          style={{ opacity: 0.12 }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.16, 0.03, 0.16] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className={cn('absolute rounded-full', meta.dot)}
          style={{ width: 56, height: 56, opacity: 0.16 }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <span
          className={cn('relative h-5 w-5 rounded-full', meta.dot)}
          style={{ boxShadow: `0 0 24px ${meta.ring}` }}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-10 w-80 max-w-full" />
          <Skeleton className="h-5 w-64 max-w-full" />
        </div>
      ) : (
        <>
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.03em] text-[#09090B] sm:text-[44px]">
            {headline}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#52525B]">{sub}</p>
        </>
      )}
    </motion.div>
  );
}

/* ── Component row with its own 90-day bar ──────────────────────────────── */

function ComponentCard({ row, index }: { row: ComponentRow; index: number }) {
  const meta = STATUS_META[row.status];
  return (
    <motion.div
      className="rounded-2xl border border-[#E4E4E7] bg-white p-5 transition-all duration-200 hover:border-[#D4D4D8] hover:shadow-[0_2px_12px_rgba(0,0,0,0.04)] sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3), ease }}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', meta.dot)} />
          <div>
            <h3 className="text-[15px] font-semibold text-[#09090B]">{row.name}</h3>
            {row.category && (
              <p className="mt-0.5 text-xs capitalize text-[#A1A1AA]">{row.category}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
              90-day observed
            </p>
            <p className="font-mono text-sm font-semibold tabular-nums text-[#09090B]">
              {row.observedAvg !== null ? `${row.observedAvg.toFixed(2)}%` : '—'}
            </p>
          </div>
          <span
            className={cn(
              'rounded-full border px-2.5 py-1 text-[11px] font-semibold',
              meta.chip,
              meta.text,
            )}
          >
            {meta.label}
          </span>
        </div>
      </div>

      <UptimeTimeline
        days={row.days}
        height={36}
        showAxis={false}
        label={`90-day observed availability for ${row.name}`}
      />

      <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-[#A1A1AA]">
        <span>90 days ago</span>
        <span className="font-mono tabular-nums">
          {row.uptime24h !== null ? `${row.uptime24h.toFixed(2)}% (24h)` : 'No 24h data'}
        </span>
        <span>Today</span>
      </div>
    </motion.div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export function StatusContent() {
  const [rows, setRows] = useState<ComponentRow[]>([]);
  const [incidents, setIncidents] = useState<AggregatedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errored, setErrored] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [email, setEmail] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    setErrored(false);

    try {
      const vendors = await vendorService.listPublicVendors();

      const results = await Promise.all(
        vendors.map(async (v) => {
          const [detail, history, timeline, incidentsRes] = await Promise.all([
            vendorService.getVendorDetail(v.vendor_name).catch(() => null),
            vendorService.getVendorHistory(v.vendor_name).catch(() => null),
            vendorService.getVendorTimeline(v.vendor_name, '90d').catch(() => null),
            vendorService.getVendorIncidents(v.vendor_name, 20).catch(() => null),
          ]);
          return { vendor: v, detail, history, timeline, incidentsRes };
        }),
      );

      const nextRows: ComponentRow[] = results.map(({ vendor, detail, history, timeline }) => {
        const days = bucketTimelineByDay(
          (timeline as VendorTimelineResponse | null)?.points,
          90,
        );
        return {
          key: vendor.vendor_name,
          name:
            (detail as VendorDetailResponse | null)?.display_name ||
            vendor.display_name ||
            vendor.vendor_name,
          category: (detail as VendorDetailResponse | null)?.category ?? vendor.category ?? '',
          status: mapStatus((detail as VendorDetailResponse | null)?.recent_status),
          uptime24h: (history as VendorHistoryResponse | null)?.uptime_percentage_24h ?? null,
          days,
          observedAvg: observedAverage(days),
        };
      });

      const nextIncidents: AggregatedIncident[] = results
        .flatMap(({ vendor, incidentsRes }) =>
          (incidentsRes?.incidents ?? []).map((inc) => ({
            ...inc,
            vendorName: vendor.display_name || vendor.vendor_name,
          })),
        )
        .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
        .slice(0, 12);

      setRows(nextRows);
      setIncidents(nextIncidents);
      setLastUpdated(new Date());
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(true), REFRESH_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const overall: StatusLevel = useMemo(() => {
    if (rows.length === 0) return 'unknown';
    if (rows.some((r) => r.status === 'down')) return 'down';
    if (rows.some((r) => r.status === 'degraded')) return 'degraded';
    if (rows.every((r) => r.status === 'unknown')) return 'unknown';
    return 'operational';
  }, [rows]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      toast.error('Enter a valid email address.');
      return;
    }
    toast.success('Status subscriptions are coming soon — we saved your interest.');
    setEmail('');
  };

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="border-b border-[#F0F0F0] px-6 pb-16 pt-20 md:px-12 md:pb-20 md:pt-28"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(8,145,178,0.05) 0%, transparent 100%)',
        }}
      >
        <div className="mx-auto max-w-[900px]">
          <OverallStatus level={overall} loading={loading} componentCount={rows.length} />

          <motion.div
            className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs text-[#A1A1AA]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25, ease }}
          >
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {lastUpdated ? `Updated ${formatTimestamp(lastUpdated.toISOString())}` : 'Loading…'}
            </span>
            <span className="hidden text-[#E4E4E7] sm:inline">·</span>
            <span>Refreshes every 60 seconds</span>
            {refreshing && (
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0891B2]" aria-hidden="true" />
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Components ──────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <motion.div
            className="mb-8 flex flex-wrap items-end justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease }}
          >
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
                Components
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#09090B]">
                90-day observed availability
              </h2>
            </div>
            <UptimeLegend />
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[#E4E4E7] bg-white p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-9 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : errored && rows.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] py-16 text-center">
              <AlertTriangle className="mb-3 h-8 w-8 text-[#D97706]" aria-hidden="true" />
              <p className="font-medium text-[#09090B]">Unable to load component data</p>
              <p className="mt-1 max-w-sm text-sm text-[#52525B]">
                The status API did not respond. This page retries automatically every 60 seconds.
              </p>
              <button
                onClick={() => fetchData(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-5 py-2.5 text-sm font-semibold text-[#09090B] transition-colors hover:border-[#09090B]"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry now
              </button>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] py-16 text-center">
              <Inbox className="mb-3 h-8 w-8 text-[#A1A1AA]" aria-hidden="true" />
              <p className="font-medium text-[#09090B]">No public components yet</p>
              <p className="mt-1 text-sm text-[#52525B]">
                Components appear here once monitoring is configured.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((row, i) => (
                <ComponentCard key={row.key} row={row} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Incident history ────────────────────────────────────────────── */}
      <section className="border-t border-[#F0F0F0] bg-[#FCFCFD] px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-[900px]">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, ease }}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              History
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-[#09090B]">
              Recent incidents
            </h2>
          </motion.div>

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <motion.div
              className="flex flex-col items-center rounded-2xl border border-[#E4E4E7] bg-white py-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease }}
            >
              <div className="relative mb-4 flex h-14 w-14 items-center justify-center">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#16A34A]/15" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]/10">
                  <CheckCircle2 className="h-7 w-7 text-[#16A34A]" aria-hidden="true" />
                </div>
              </div>
              <p className="font-medium text-[#09090B]">No incidents recorded</p>
              <p className="mt-1 text-sm text-[#52525B]">
                Nothing to report in the observed period.
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              <div className="absolute bottom-2 left-[7px] top-2 w-px bg-[#E4E4E7]" />
              <div className="space-y-5">
                {incidents.map((inc, i) => {
                  const resolved = inc.status === 'resolved' || Boolean(inc.resolved_at);
                  return (
                    <motion.div
                      key={inc.incident_id}
                      className="relative pl-8"
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease }}
                    >
                      <span
                        className={cn(
                          'absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-[3px] border-white',
                          resolved ? 'bg-[#16A34A]' : 'bg-[#D97706]',
                        )}
                      />
                      <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[#09090B]">
                            {inc.dependency_name || inc.vendorName}
                          </span>
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                              resolved
                                ? 'bg-[#16A34A]/10 text-[#16A34A]'
                                : 'bg-[#D97706]/10 text-[#D97706]',
                            )}
                          >
                            {resolved ? 'Resolved' : 'Active'}
                          </span>
                          <span className="rounded-full bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider capitalize text-[#52525B]">
                            {inc.severity}
                          </span>
                        </div>
                        <p className="mt-2 font-mono text-xs text-[#A1A1AA]">
                          {formatTimestamp(inc.started_at)} · {formatDuration(inc.duration_seconds)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Subscribe ───────────────────────────────────────────────────── */}
      <section className="border-t border-[#F0F0F0] px-6 py-16 md:px-12 md:py-24">
        <motion.div
          className="mx-auto max-w-[560px] text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease }}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-[#09090B]">
            Subscribe to updates
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-[#52525B]">
            Get notified when a component changes state. No marketing, only status.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="status-email" className="sr-only">
              Email address
            </label>
            <input
              id="status-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="h-12 flex-1 rounded-[10px] border border-[#E4E4E7] bg-white px-4 text-sm text-[#09090B] outline-none transition-colors placeholder:text-[#A1A1AA] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-[10px] bg-[#0A0A0F] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Subscribe
            </button>
          </form>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            <a
              href="/changelog/feed.xml"
              className="inline-flex items-center gap-1.5 font-medium text-[#52525B] transition-colors hover:text-[#0891B2]"
            >
              <Rss className="h-4 w-4" aria-hidden="true" />
              Changelog feed
            </a>
            <a
              href="/track"
              className="inline-flex items-center gap-1.5 font-medium text-[#52525B] transition-colors hover:text-[#0891B2]"
            >
              Vendor reliability pages
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </section>
    </>
  );
}
