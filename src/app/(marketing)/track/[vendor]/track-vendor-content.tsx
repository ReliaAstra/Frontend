'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, ExternalLink, CheckCircle2, AlertTriangle, Shield,
  TrendingUp, RefreshCw, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
} from '@/services/vendorService';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string; bg: string; borderColor: string }> = {
  up: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  operational: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700', bg: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  degraded: { label: 'Degraded', dotColor: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200' },
  degraded_performance: { label: 'Degraded', dotColor: 'bg-amber-500', textColor: 'text-amber-700', bg: 'bg-amber-50', borderColor: 'border-amber-200' },
  down: { label: 'Down', dotColor: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-red-200' },
  partial_outage: { label: 'Partial Outage', dotColor: 'bg-orange-500', textColor: 'text-orange-700', bg: 'bg-orange-50', borderColor: 'border-orange-200' },
  major_outage: { label: 'Major Outage', dotColor: 'bg-red-500', textColor: 'text-red-700', bg: 'bg-red-50', borderColor: 'border-red-200' },
  unknown: { label: 'Unknown', dotColor: 'bg-gray-400', textColor: 'text-gray-600', bg: 'bg-gray-50', borderColor: 'border-gray-200' },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200' },
  major: { label: 'Major', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  high: { label: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  minor: { label: 'Minor', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low: { label: 'Low', color: 'text-blue-700 bg-blue-50 border-blue-200' },
};

interface Props {
  vendorSlug: string;
}

export function TrackVendorContent({ vendorSlug }: Props) {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const [detail, setDetail] = useState<VendorDetailResponse | null>(null);
  const [history, setHistory] = useState<VendorHistoryResponse | null>(null);
  const [metrics, setMetrics] = useState<VendorMetricsResponse | null>(null);
  const [incidents, setIncidents] = useState<VendorIncidentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const vendorLabel = detail?.display_name || vendorSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const vendorName = detail?.vendor_name || vendorSlug;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setFetchError(null);
    try {
      const [d, h, m, i] = await Promise.all([
        vendorService.getVendorDetail(vendorSlug),
        vendorService.getVendorHistory(vendorSlug),
        vendorService.getVendorMetrics(vendorSlug),
        vendorService.getVendorIncidents(vendorSlug, 50),
      ]);
      setDetail(d);
      setHistory(h);
      setMetrics(m);
      setIncidents(i);
      setLastFetch(new Date().toISOString());
    } catch {
      setFetchError('Unable to load vendor intelligence data. The measurement service may be unavailable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vendorSlug]);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60s
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Process metrics for chart
  const chartData = useMemo(() => {
    if (!metrics?.metrics) return [];
    return Object.entries(metrics.metrics)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, w]) => ({
        hour: format(new Date(w.window), 'HH:mm'),
        window: w.window,
        latency: Math.round(w.avg_latency_ms),
        p95: Math.round(w.p95_latency_ms),
        uptime: w.uptime_percentage,
        observations: w.total_observations,
      }));
  }, [metrics]);

  const maxLatency = chartData.length > 0 ? Math.max(...chartData.map(d => d.latency), ...chartData.map(d => d.p95), 1) : 1;

  const overallStatus = detail?.recent_status || 'unknown';
  const statusStyle = statusConfig[overallStatus] || statusConfig.unknown;

  const uptimeValue = history?.uptime_percentage_24h ?? null;
  const avgLatency = history?.avg_latency_ms_24h ?? null;
  const totalChecks = history?.recent_checks_count ?? null;
  const latestP95 = chartData.length > 0 ? chartData[chartData.length - 1].p95 : null;
  const latestObservations = chartData.length > 0 ? chartData[chartData.length - 1].observations : null;

  const isStale = detail?.last_check_at && (Date.now() - new Date(detail.last_check_at).getTime()) > 300000; // 5 min

  const handleSubscribe = async () => {
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubscribing(true);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, vendor: vendorSlug }),
      });
      if (res.ok) {
        toast.success(`Subscribed to ${vendorLabel} alerts.`);
        setEmail('');
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setSubscribing(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'Ongoing';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // --- RENDER ---

  // Loading shell
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-10 w-80 mb-2" />
        <Skeleton className="h-5 w-96 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
        </div>
        <Skeleton className="h-64 rounded-lg mb-8" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <Link href="/track" className="text-sm text-[#0891B2] hover:text-[#0E7490] transition-colors mb-6 inline-block">
          &larr; All Vendors
        </Link>
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center mt-4">
          <AlertCircle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#09090B]">{fetchError}</p>
          <button
            onClick={() => fetchData()}
            className="mt-4 text-xs font-medium text-[#0891B2] hover:text-[#0E7490] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8">
      {/* ── HEADER ── */}
      <section className="pt-10 pb-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/track" className="text-[13px] text-[#A1A1AA] hover:text-[#0891B2] transition-colors">
              Vendors
            </Link>
            <span className="text-[#E4E4E7]">/</span>
            <span className="text-[13px] text-[#52525B] font-medium">{vendorLabel}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              {/* Vendor name + status */}
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-[28px] font-semibold text-[#09090B] tracking-[-0.02em]">
                  {vendorLabel}
                </h1>
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] px-2.5 py-1 rounded-md border',
                  statusStyle.bg, statusStyle.textColor, statusStyle.borderColor
                )}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', statusStyle.dotColor,
                    (overallStatus === 'degraded' || overallStatus === 'degraded_performance' || overallStatus === 'partial_outage') && 'animate-pulse'
                  )} />
                  {statusStyle.label}
                </span>
              </div>

              <p className="text-sm text-[#52525B] max-w-xl leading-relaxed">
                {detail?.category ? `${detail.category} · ` : ''}Vendor intelligence measured continuously by Reliastra.
                Data collected independently from {vendorLabel}&apos;s own status reporting.
              </p>
            </div>

            {/* Refresh */}
            <div className="flex items-center gap-3 shrink-0">
              {lastFetch && (
                <span className="text-[11px] font-mono text-[#A1A1AA]">
                  {format(new Date(lastFetch), 'HH:mm:ss')} UTC
                </span>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
                aria-label="Refresh data"
              >
                <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Live measurement bar */}
          <div className="mt-5 px-4 py-3 rounded-lg bg-[#F8F9FA] border border-[#F0F0F0]">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isStale ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                )} />
                {isStale ? (
                  <span className="text-amber-700 font-medium">
                    Measurement delayed &middot; Last observation {detail?.last_check_at ? formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true }) : 'unknown'}
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">
                    Measured {detail?.last_check_at ? formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true }) : 'recently'}
                  </span>
                )}
              </div>
              {detail?.endpoints && (
                <span className="text-[#A1A1AA]">
                  {detail.endpoints.length} endpoint{detail.endpoints.length !== 1 ? 's' : ''} monitored
                </span>
              )}
              {totalChecks !== null && (
                <span className="text-[#A1A1AA]">
                  {totalChecks.toLocaleString()} observations (24h)
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-[#E4E4E7]" />

      {/* ── RELIABILITY SUMMARY ── */}
      <section className="py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA] mb-4">
          Reliability
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] block mb-2">
              24h uptime
            </span>
            {uptimeValue !== null ? (
              <p className={cn(
                'text-[22px] font-semibold font-mono tracking-tight',
                uptimeValue >= 99.95 ? 'text-emerald-600' : uptimeValue >= 99 ? 'text-amber-600' : 'text-red-600'
              )}>
                {uptimeValue.toFixed(2)}%
              </p>
            ) : (
              <p className="text-sm text-[#A1A1AA]">No data</p>
            )}
          </div>
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] block mb-2">
              Median latency
            </span>
            {avgLatency !== null ? (
              <p className={cn(
                'text-[22px] font-semibold font-mono tracking-tight',
                avgLatency > 500 ? 'text-red-600' : avgLatency > 200 ? 'text-amber-600' : 'text-[#09090B]'
              )}>
                {Math.round(avgLatency)}<span className="text-[13px] font-normal text-[#A1A1AA] ml-1">ms</span>
              </p>
            ) : (
              <p className="text-sm text-[#A1A1AA]">No data</p>
            )}
          </div>
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] block mb-2">
              P95 latency
            </span>
            {latestP95 !== null ? (
              <p className={cn(
                'text-[22px] font-semibold font-mono tracking-tight',
                latestP95 > 500 ? 'text-red-600' : latestP95 > 300 ? 'text-amber-600' : 'text-[#09090B]'
              )}>
                {latestP95}<span className="text-[13px] font-normal text-[#A1A1AA] ml-1">ms</span>
              </p>
            ) : (
              <p className="text-sm text-[#A1A1AA]">No data</p>
            )}
          </div>
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] block mb-2">
              Observations
            </span>
            {totalChecks !== null ? (
              <p className="text-[22px] font-semibold font-mono tracking-tight text-[#09090B]">
                {totalChecks.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-[#A1A1AA]">No data</p>
            )}
          </div>
        </div>
      </section>

      {/* ── LATENCY CHART ── */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA]">
            Response Latency
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#A1A1AA]">
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#0891B2]" /> Median</div>
            <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#0891B2]/25" /> P95</div>
          </div>
        </div>
        {chartData.length > 0 ? (
          <div className="rounded-lg border border-[#E4E4E7] p-5 bg-white">
            <div className="flex items-end gap-[2px] h-48">
              {chartData.map((d, idx) => {
                const avgH = (d.latency / maxLatency) * 100;
                const p95H = (d.p95 / maxLatency) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative min-w-0">
                    {/* Tooltip */}
                    <div className="absolute -top-10 bg-[#09090B] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                      Avg: {d.latency}ms / P95: {d.p95}ms
                    </div>
                    <div className="w-full flex gap-[1px] items-end">
                      <div
                        className="flex-1 rounded-t-sm bg-[#0891B2]/20 transition-all min-h-[1px]"
                        style={{ height: `${Math.max(p95H, 1)}%` }}
                      />
                      <div
                        className={cn(
                          'flex-1 rounded-t-sm transition-all min-h-[1px]',
                          d.latency > 500 ? 'bg-red-400' : d.latency > 300 ? 'bg-amber-400' : 'bg-[#0891B2]'
                        )}
                        style={{ height: `${Math.max(avgH, 1)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-[#A1A1AA] font-mono">
              {chartData.filter((_, i) => i % Math.max(Math.floor(chartData.length / 8), 1) === 0).map(d => (
                <span key={d.hour}>{d.hour}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
            <p className="text-sm text-[#52525B]">No latency data available yet.</p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Reliastra has not collected enough observations to display latency trends.
            </p>
          </div>
        )}
      </section>

      {/* ── MONITORED ENDPOINTS ── */}
      {detail?.endpoints && detail.endpoints.length > 0 && (
        <section className="pb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA] mb-4">
            Monitored Endpoints
          </p>
          <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Endpoint</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Regions</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Status</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden sm:table-cell">Last Check</th>
                </tr>
              </thead>
              <tbody>
                {detail.endpoints.map(ep => {
                  const epStatus = statusConfig[ep.health_status] || statusConfig.unknown;
                  return (
                    <tr key={ep.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4 font-mono text-[12px] text-[#09090B] max-w-[300px] truncate">{ep.endpoint_url}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {ep.regions.map(r => (
                            <span key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F8F9FA] text-[#52525B] border border-[#F0F0F0]">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border',
                          epStatus.bg, epStatus.textColor, epStatus.borderColor
                        )}>
                          <span className={cn('h-1.5 w-1.5 rounded-full', epStatus.dotColor)} />
                          {epStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#A1A1AA] font-mono text-right hidden sm:table-cell">
                        {ep.last_check_at ? formatDistanceToNow(new Date(ep.last_check_at), { addSuffix: true }) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── INCIDENT HISTORY ── */}
      <section className="pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA] mb-4">
          Incident History
        </p>
        {incidents && incidents.incidents.length > 0 ? (
          <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Service</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Severity</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Status</th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden md:table-cell">Duration</th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden sm:table-cell">Started</th>
                </tr>
              </thead>
              <tbody>
                {incidents.incidents.map((inc: VendorIncident) => {
                  const sev = severityConfig[inc.severity] || severityConfig.medium;
                  const isResolved = inc.status === 'resolved';
                  return (
                    <tr key={inc.incident_id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[#09090B] font-medium">{inc.dependency_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium', sev.color)}>
                          {sev.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('h-1.5 w-1.5 rounded-full', isResolved ? 'bg-emerald-500' : 'bg-amber-500')} />
                          <span className={cn('text-[12px] font-medium', isResolved ? 'text-emerald-700' : 'text-amber-700')}>
                            {isResolved ? 'Resolved' : inc.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[12px] text-[#52525B] hidden md:table-cell">
                        {formatDuration(inc.duration_seconds)}
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#A1A1AA] font-mono text-right hidden sm:table-cell">
                        {format(new Date(inc.started_at), 'MMM d, HH:mm')} UTC
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-[#09090B]">No incidents recorded</p>
            <p className="text-xs text-[#A1A1AA] mt-1">{vendorLabel} has maintained a clean record in the observed period.</p>
          </div>
        )}
      </section>

      {/* ── METHODOLOGY ── */}
      <section className="pb-8 pt-4 border-t border-[#E4E4E7]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA] mb-3">
          Measurement Methodology
        </p>
        <div className="max-w-2xl">
          <p className="text-xs text-[#52525B] leading-relaxed">
            Reliastra measures vendor endpoints from independent probe regions at defined intervals.
            Measurements include HTTP availability, response latency, status codes, regional consistency,
            and observation timestamps. Reliability calculations are derived from observed measurements
            and reflect actual endpoint behavior, not vendor-reported SLAs. Data is collected independently
            of the vendor&apos;s own infrastructure or status reporting.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 border-t border-[#E4E4E7]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-[18px] font-semibold text-[#09090B] tracking-[-0.02em] mb-2">
            Want deeper intelligence?
          </h2>
          <p className="text-sm text-[#52525B] mb-6">
            Create a Reliastra account to monitor your own dependencies and build evidence-driven reliability records.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#09090B] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#09090B]/90 transition-colors"
            >
              Create account
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 text-sm w-[200px]"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                variant="outline"
                className="h-9 text-sm border-[#E4E4E7] text-[#52525B] hover:bg-[#F8F9FA] shrink-0"
              >
                {subscribing ? '...' : 'Alerts'}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
