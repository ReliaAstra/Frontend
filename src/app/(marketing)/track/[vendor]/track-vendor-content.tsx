'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Bell, ExternalLink, CheckCircle2, AlertTriangle, Clock, ArrowUpRight, Activity, Shield, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { vendorService, type VendorDetailResponse, type VendorHistoryResponse, type VendorMetricsResponse, type VendorIncidentsResponse, type VendorIncident } from '@/services/vendorService';
import { formatDistanceToNow, format } from 'date-fns';

type Vendor = 'stripe' | 'auth0' | 'cloudflare' | 'openai' | 'twilio' | 'vercel';

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  operational: { label: 'Operational', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  degraded_performance: { label: 'Degraded Performance', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: AlertTriangle },
  partial_outage: { label: 'Partial Outage', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: AlertTriangle },
  major_outage: { label: 'Major Outage', color: 'text-red-700 bg-red-50 border-red-200', icon: AlertTriangle },
  unknown: { label: 'Unknown', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: Shield },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200' },
  high: { label: 'High', color: 'text-orange-700 bg-orange-50 border-orange-200' },
  medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  low: { label: 'Low', color: 'text-blue-700 bg-blue-50 border-blue-200' },
};

interface TrackVendorContentProps {
  vendor: Vendor;
  vendorLabel: string;
}

export function TrackVendorContent({ vendor, vendorLabel }: TrackVendorContentProps) {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const [detail, setDetail] = useState<VendorDetailResponse | null>(null);
  const [history, setHistory] = useState<VendorHistoryResponse | null>(null);
  const [metrics, setMetrics] = useState<VendorMetricsResponse | null>(null);
  const [incidents, setIncidents] = useState<VendorIncidentsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const vendorName = vendorLabel.toLowerCase();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [d, h, m, i] = await Promise.all([
        vendorService.getVendorDetail(vendorName),
        vendorService.getVendorHistory(vendorName),
        vendorService.getVendorMetrics(vendorName),
        vendorService.getVendorIncidents(vendorName, 20),
      ]);
      setDetail(d);
      setHistory(h);
      setMetrics(m);
      setIncidents(i);
    } catch (err) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Process metrics for the latency chart
  const chartData = metrics
    ? Object.entries(metrics.metrics)
        .map(([, w]) => ({
          hour: format(new Date(w.window), 'HH:00'),
          latency: Math.round(w.avg_latency_ms),
          p95: Math.round(w.p95_latency_ms),
          errorRate: w.error_rate * 100,
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour))
    : [];

  const maxLatency = chartData.length > 0 ? Math.max(...chartData.map((d) => d.latency), ...chartData.map((d) => d.p95)) : 1;
  const maxP95 = chartData.length > 0 ? Math.max(...chartData.map((d) => d.p95)) : 1;

  const overallStatus = detail?.recent_status || 'unknown';
  const statusStyle = statusConfig[overallStatus] || statusConfig.unknown;

  const uptimeValue = history?.uptime_percentage_24h ?? 99.99;
  const avgLatency = history?.avg_latency_ms_24h ?? 0;
  const totalChecks = history?.recent_checks_count ?? 0;

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
        body: JSON.stringify({ email, vendor }),
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
            <div className="flex items-center gap-2 mb-4">
              <ExternalLink className="h-4 w-4 text-[#0891B2]" />
              <span className="text-sm text-[#52525B]">Independent Monitoring</span>
              {detail?.last_check_at && (
                <span className="text-xs text-gray-400 ml-2">
                  Last checked {formatDistanceToNow(new Date(detail.last_check_at), { addSuffix: true })}
                </span>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#09090B] tracking-tight">
                  {vendorLabel} API Status
                </h1>
                <p className="mt-2 text-[#52525B] max-w-xl">
                  Real-time, third-party monitoring of {vendorLabel}&apos;s API endpoints.
                  Data is collected independently — not from {vendorLabel}&apos;s own status page.
                </p>
              </div>
              <Badge className={cn('text-sm px-3 py-1 w-fit border', statusStyle.color)} variant="secondary">
                <statusStyle.icon className="h-4 w-4 mr-1" />
                {statusStyle.label}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* KPI Summary Cards */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl bg-gray-100" />
              ))
            ) : (
              <>
                <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#52525B]">24h Uptime</span>
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className={cn('text-2xl font-bold', uptimeValue >= 99.9 ? 'text-emerald-600' : uptimeValue >= 99 ? 'text-amber-600' : 'text-red-600')}>
                    {uptimeValue.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#52525B]">Avg Latency (24h)</span>
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className={cn('text-2xl font-bold', avgLatency > 500 ? 'text-red-600' : avgLatency > 200 ? 'text-amber-600' : 'text-gray-900')}>
                    {avgLatency.toFixed(0)}ms
                  </p>
                </div>
                <div className="rounded-xl border border-[#E4E4E7] bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-[#52525B]">Total Checks (24h)</span>
                    <Shield className="h-4 w-4 text-[#0891B2]" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalChecks.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Latency Chart - Real Data */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#09090B]">24-Hour Response Latency</h2>
            <div className="flex items-center gap-4 text-xs text-[#52525B]">
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0891B2]" /> Avg</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#0891B2]/30" /> P95</div>
              <div className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> &gt; 500ms</div>
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-64 rounded-xl bg-gray-100" />
          ) : chartData.length > 0 ? (
            <div className="rounded-xl border border-[#E4E4E7] p-6 bg-white">
              <div className="flex items-end gap-[3px] h-48">
                {chartData.map((d, idx) => {
                  const avgHeight = (d.latency / maxLatency) * 100;
                  const p95Height = (d.p95 / maxP95) * 100;
                  const isHigh = d.latency > 500;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                      <div className="absolute -top-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        Avg: {d.latency}ms / P95: {d.p95}ms
                      </div>
                      <div className="w-full flex gap-[1px] items-end">
                        {/* P95 bar (lighter, behind) */}
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
              <div className="flex justify-between mt-2 text-xs text-[#A1A1AA]">
                {chartData.filter((_, i) => i % Math.max(Math.floor(chartData.length / 6), 1) === 0).map((d) => (
                  <span key={d.hour}>{d.hour}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-12 text-center text-gray-400">
              No latency data available yet.
            </div>
          )}
        </div>
      </section>

      {/* Monitored Endpoints */}
      {detail?.endpoints && detail.endpoints.length > 0 && (
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <h2 className="text-lg font-semibold text-[#09090B] mb-6">Monitored Endpoints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detail.endpoints.map((ep) => {
                const epStatus = statusConfig[ep.health_status] || statusConfig.unknown;
                const EpIcon = epStatus.icon;
                return (
                  <div key={ep.id} className="rounded-xl border border-[#E4E4E7] bg-white p-5">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={cn('text-xs px-2 py-0.5 border', epStatus.color)} variant="secondary">
                        <EpIcon className="h-3 w-3 mr-1" />
                        {epStatus.label}
                      </Badge>
                      {ep.is_active && (
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-sm font-mono text-gray-900 break-all mb-3">{ep.endpoint_url}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ep.regions.map((r) => (
                        <span key={r} className="text-[10px] font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                          {r}
                        </span>
                      ))}
                    </div>
                    {ep.last_check_at && (
                      <p className="text-[10px] text-gray-400 mt-2">
                        Last check: {formatDistanceToNow(new Date(ep.last_check_at), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Incident History - Real Data */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <h2 className="text-lg font-semibold text-[#09090B] mb-6">Incident History</h2>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : incidents && incidents.incidents.length > 0 ? (
            <div className="rounded-xl border border-[#E4E4E7] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#E4E4E7]">
                      <th className="text-left py-3 px-4 font-medium text-[#52525B]">Service</th>
                      <th className="text-left py-3 px-4 font-medium text-[#52525B]">Severity</th>
                      <th className="text-left py-3 px-4 font-medium text-[#52525B]">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-[#52525B]">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-[#52525B]">Started</th>
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
                              <span className="text-gray-900 font-medium">{inc.dependency_name}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', sev.color)}>
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
                          <td className="py-3 px-4 font-mono text-xs text-gray-600">
                            {formatDuration(inc.duration_seconds)}
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">
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
            <div className="rounded-xl border border-[#E4E4E7] bg-white p-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No incidents recorded</p>
              <p className="text-sm text-gray-400 mt-1">{vendorLabel} has had a clean record.</p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe to Alerts */}
      <section className="py-24 bg-slate-50">
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
