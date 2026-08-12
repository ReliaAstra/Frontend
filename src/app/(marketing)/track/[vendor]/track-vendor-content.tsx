'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bell, ExternalLink, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Activity, Shield, TrendingUp, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { vendorService, type VendorDetailResponse, type VendorHistoryResponse, type VendorMetricsResponse, type VendorIncidentsResponse, type VendorIncident } from '@/services/vendorService';
import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  operational: { label: 'Operational', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  degraded_performance: { label: 'Degraded Performance', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: AlertTriangle },
  partial_outage: { label: 'Partial Outage', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle },
  major_outage: { label: 'Major Outage', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle },
  unknown: { label: 'Unknown', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: Shield },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50 border-red-200' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  medium: { label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  low: { label: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' },
};

interface TrackVendorContentProps {
  vendorSlug: string;
}

export function TrackVendorContent({ vendorSlug }: TrackVendorContentProps) {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const [detail, setDetail] = useState<VendorDetailResponse | null>(null);
  const [history, setHistory] = useState<VendorHistoryResponse | null>(null);
  const [metrics, setMetrics] = useState<VendorMetricsResponse | null>(null);
  const [incidents, setIncidents] = useState<VendorIncidentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const vendorLabel = detail?.display_name || vendorSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const vendorName = detail?.vendor_name || vendorSlug;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const [d, h, m, i] = await Promise.all([
        vendorService.getVendorDetail(vendorSlug),
        vendorService.getVendorHistory(vendorSlug),
        vendorService.getVendorMetrics(vendorSlug),
        vendorService.getVendorIncidents(vendorSlug, 20),
      ]);
      setDetail(d);
      setHistory(h);
      setMetrics(m);
      setIncidents(i);
      setLastFetch(new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [vendorSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process metrics for the latency chart
  const chartData = useMemo(() => {
    if (!metrics) return [];
    return Object.entries(metrics.metrics)
      .map(([, w]) => ({
        hour: format(new Date(w.window), 'HH:00'),
        window: w.window,
        latency: Math.round(w.avg_latency_ms),
        p95: Math.round(w.p95_latency_ms),
        errorRate: w.error_rate * 100,
        uptime: w.uptime_percentage,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }, [metrics]);

  // Build a set of incident windows for chart markers
  const incidentWindows = useMemo(() => {
    if (!incidents || !chartData.length) return new Set<string>();
    const windows = new Set<string>();
    for (const inc of incidents.incidents) {
      const start = new Date(inc.started_at);
      const end = inc.resolved_at ? new Date(inc.resolved_at) : new Date();
      for (const cd of chartData) {
        const wTime = new Date(cd.window);
        if (wTime >= start && wTime <= end) {
          windows.add(cd.hour);
        }
      }
    }
    return windows;
  }, [incidents, chartData]);

  const maxLatency = chartData.length > 0 ? Math.max(...chartData.map((d) => d.latency), ...chartData.map((d) => d.p95)) : 1;
  const maxP95 = chartData.length > 0 ? Math.max(...chartData.map((d) => d.p95)) : 1;

  const overallStatus = detail?.recent_status || 'unknown';
  const statusStyle = statusConfig[overallStatus] || statusConfig.unknown;

  const uptimeValue = history?.uptime_percentage_24h ?? 99.99;
  const avgLatency = history?.avg_latency_ms_24h ?? 0;
  const totalChecks = history?.recent_checks_count ?? 0;

  // Calculate latest p95 for the header
  const latestP95 = chartData.length > 0 ? chartData[chartData.length - 1].p95 : null;

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
        toast.success(`Subscribed to ${vendorLabel} alerts!`);
        setEmail('');
      } else {
        toast.error('Subscription failed. Please try again.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return 'Ongoing';
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Breadcrumb + data freshness */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link href="/track" className="text-sm text-gray-400 hover:text-[#0891B2] transition-colors">
                  All Vendors
                </Link>
                <span className="text-gray-300">/</span>
                <ExternalLink className="h-4 w-4 text-[#0891B2]" />
                <span className="text-sm text-[#52525B] font-medium">{vendorLabel}</span>
              </div>
              {lastFetch && !loading && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0891B2] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    {format(new Date(lastFetch), 'HH:mm:ss')} UTC
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight">
                  {vendorLabel} API Status
                </h1>
                <p className="mt-2 text-[#52525B] max-w-xl">
                  Real-time, third-party monitoring of {vendorLabel}&apos;s API endpoints.
                  Data collected independently — not from {vendorLabel}&apos;s own status page.
                </p>
              </div>
              <Badge className={cn('text-sm px-3 py-1 w-fit border', statusStyle.color)} variant="secondary">
                <statusStyle.icon className="h-4 w-4 mr-1" />
                {statusStyle.label}
              </Badge>
            </div>

            {/* Data freshness bar */}
            {detail?.last_check_at && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>
                  Last check: {formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true })}
                  {detail.endpoints && detail.endpoints.length > 0 && ` · ${detail.endpoints.length} endpoint${detail.endpoints.length > 1 ? 's' : ''} monitored`}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* KPI Summary Cards */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-4">24-Hour Summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg bg-gray-100" />
              ))
            ) : (
              <>
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Uptime</span>
                    <Activity className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                  <p className={cn('text-xl font-bold font-mono', uptimeValue >= 99.9 ? 'text-emerald-600' : uptimeValue >= 99 ? 'text-amber-600' : 'text-red-600')}>
                    {uptimeValue.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Avg Latency</span>
                    <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <p className={cn('text-xl font-bold font-mono', avgLatency > 500 ? 'text-red-600' : avgLatency > 200 ? 'text-amber-600' : 'text-[#09090B]')}>
                    {avgLatency.toFixed(0)}<span className="text-sm font-normal text-gray-400 ml-0.5">ms</span>
                  </p>
                </div>
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">P95 Latency</span>
                    <TrendingUp className="h-3.5 w-3.5 text-[#0891B2]" />
                  </div>
                  <p className={cn('text-xl font-bold font-mono', (latestP95 ?? 0) > 500 ? 'text-red-600' : (latestP95 ?? 0) > 300 ? 'text-amber-600' : 'text-[#09090B]')}>
                    {latestP95 ?? '—'}<span className="text-sm font-normal text-gray-400 ml-0.5">ms</span>
                  </p>
                </div>
                <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Total Checks</span>
                    <Shield className="h-3.5 w-3.5 text-[#0891B2]" />
                  </div>
                  <p className="text-xl font-bold font-mono text-[#09090B]">
                    {totalChecks.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Latency Chart */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">24-Hour Response Latency</p>
            <div className="flex items-center gap-4 text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#0891B2]" /> Avg</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-[#0891B2]/25" /> P95</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-red-400" /> &gt;500ms</div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-amber-200" /> Incident</div>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-64 rounded-lg bg-gray-100" />
          ) : chartData.length > 0 ? (
            <div className="rounded-lg border border-[#E4E4E7] p-5 bg-white">
              <div className="flex items-end gap-[3px] h-48">
                {chartData.map((d, idx) => {
                  const avgHeight = (d.latency / maxLatency) * 100;
                  const p95Height = (d.p95 / maxP95) * 100;
                  const isHigh = d.latency > 500;
                  const hasIncident = incidentWindows.has(d.hour);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-[#09090B] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-mono">
                        Avg: {d.latency}ms / P95: {d.p95}ms
                      </div>
                      {/* Incident marker bar */}
                      {hasIncident && (
                        <div className="w-full h-1 rounded-t-sm bg-amber-200 mb-0.5" title="Incident period" />
                      )}
                      <div className="w-full flex gap-[1px] items-end">
                        {/* P95 bar */}
                        <div
                          className="flex-1 rounded-t-sm bg-[#0891B2]/20 transition-all min-h-[2px]"
                          style={{ height: `${Math.max(p95Height, 2)}%` }}
                        />
                        {/* Avg bar */}
                        <div
                          className={cn(
                            'flex-1 rounded-t-sm transition-all min-h-[2px]',
                            isHigh ? 'bg-red-400' : d.latency > 300 ? 'bg-amber-400' : 'bg-[#0891B2]'
                          )}
                          style={{ height: `${Math.max(avgHeight, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[11px] text-[#A1A1AA] font-mono">
                {chartData.filter((_, i) => i % Math.max(Math.floor(chartData.length / 8), 1) === 0).map((d) => (
                  <span key={d.hour}>{d.hour}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center text-gray-400">
              No latency data available yet.
            </div>
          )}
        </div>
      </section>

      {/* Monitored Endpoints — Table style */}
      {detail?.endpoints && detail.endpoints.length > 0 && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-4">Monitored Endpoints</p>
            <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Endpoint</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Regions</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden sm:table-cell">Last Check</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.endpoints.map((ep) => {
                      const epStatus = statusConfig[ep.health_status] || statusConfig.unknown;
                      const EpIcon = epStatus.icon;
                      return (
                        <tr key={ep.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-xs text-[#09090B] max-w-[300px] truncate">{ep.endpoint_url}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {ep.regions.map((r) => (
                                <span key={r} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium', epStatus.color)}>
                              <EpIcon className="h-3 w-3" />
                              {epStatus.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400 hidden sm:table-cell">
                            {ep.last_check_at ? formatDistanceToNow(new Date(ep.last_check_at), { addSuffix: true }) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Incident History */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-4">Incident History</p>
          {loading ? (
            <div className="space-y-1">
              <Skeleton className="h-10 w-full bg-gray-100 rounded-t-lg rounded-b-none" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full bg-gray-50" />
              ))}
            </div>
          ) : incidents && incidents.incidents.length > 0 ? (
            <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Service</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Severity</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden md:table-cell">Duration</th>
                      <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden sm:table-cell">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.incidents.map((inc: VendorIncident) => {
                      const sev = severityConfig[inc.severity] || severityConfig.medium;
                      const isResolved = inc.status === 'resolved';
                      return (
                        <tr key={inc.incident_id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#09090B] font-medium">{inc.dependency_name}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium', sev.color)}>
                              {sev.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              'inline-flex items-center gap-1.5 text-xs font-medium',
                              isResolved ? 'text-emerald-600' : 'text-amber-600'
                            )}>
                              <span className={cn('h-1.5 w-1.5 rounded-full', isResolved ? 'bg-emerald-500' : 'bg-amber-500')} />
                              {isResolved ? 'Resolved' : 'Open'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-gray-500 hidden md:table-cell">
                            {formatDuration(inc.duration_seconds)}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-400 hidden sm:table-cell">
                            {formatDistanceToNow(new Date(inc.started_at), { addSuffix: true })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No incidents recorded</p>
              <p className="text-sm text-gray-400 mt-1">{vendorLabel} has had a clean record.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe to Alerts */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center"
          >
            <Bell className="h-10 w-10 text-[#0891B2] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#09090B]">Subscribe to Alerts</h2>
            <p className="mt-2 text-[#52525B]">
              Get notified instantly when {vendorLabel}&apos;s API degrades or goes down.
            </p>
            <div className="mt-6 flex gap-2">
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
              />
              <Button onClick={handleSubscribe} disabled={subscribing} className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg shrink-0">
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}