'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Inbox,
} from 'lucide-react';
import {
  vendorService,
  type VendorDetailResponse,
  type VendorHistoryResponse,
  type VendorIncidentsResponse,
  type VendorIncident,
} from '@/services/vendorService';

type StatusLevel = 'operational' | 'degraded' | 'down' | 'unknown';

interface VendorData {
  detail: VendorDetailResponse;
  history: VendorHistoryResponse | null;
}

interface AggregatedIncident extends VendorIncident {
  vendor_name: string;
}

const REFRESH_INTERVAL_MS = 60_000;

const statusConfig: Record<StatusLevel, { label: string; color: string; bg: string; dot: string; icon: typeof CheckCircle2 }> = {
  operational: { label: 'Operational', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  degraded: { label: 'Degraded Performance', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', icon: AlertTriangle },
  down: { label: 'Major Outage', color: 'text-red-600', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500', icon: AlertTriangle },
  unknown: { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400', icon: Clock },
};

function mapStatus(raw: string): StatusLevel {
  if (!raw) return 'unknown';
  const s = raw.toLowerCase();
  if (s === 'operational' || s === 'up' || s === 'healthy') return 'operational';
  if (s === 'degraded' || s === 'degraded_performance') return 'degraded';
  if (s === 'down' || s === 'major_outage' || s === 'partial_outage') return 'down';
  return 'unknown';
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    }) + ' UTC';
  } catch {
    return iso;
  }
}

function formatLastUpdated(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

const incidentStatusConfig: Record<string, { label: string; color: string }> = {
  resolved: { label: 'Resolved', color: 'text-emerald-600 bg-emerald-50' },
  monitoring: { label: 'Monitoring', color: 'text-amber-600 bg-amber-50' },
  investigating: { label: 'Investigating', color: 'text-red-600 bg-red-50' },
  identified: { label: 'Identified', color: 'text-orange-600 bg-orange-50' },
  fixed: { label: 'Fixed', color: 'text-emerald-600 bg-emerald-50' },
};

function getIncidentStatusLabel(status: string): string {
  return incidentStatusConfig[status]?.label ?? status;
}

function getIncidentStatusColor(status: string): string {
  return incidentStatusConfig[status]?.color ?? 'text-gray-600 bg-gray-50';
}

function ComponentsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:p-5 bg-gray-50">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24 hidden sm:block" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

function IncidentsSkeleton() {
  return (
    <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#F8F9FA]">
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Component</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-500 font-medium hidden md:table-cell">Duration</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100 last:border-0">
                <td className="py-3 px-4"><Skeleton className="h-4 w-40" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                <td className="py-3 px-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                <td className="py-3 px-4 hidden md:table-cell"><Skeleton className="h-4 w-14" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusContent() {
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [incidents, setIncidents] = useState<AggregatedIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const publicVendors = await vendorService.listPublicVendors();

      const vendorDataPromises = publicVendors.map(async (v) => {
        const [detail, history] = await Promise.all([
          vendorService.getVendorDetail(v.vendor_name),
          vendorService.getVendorHistory(v.vendor_name).catch(() => null),
        ]);
        return { detail, history };
      });

      const vendorResults = await Promise.all(vendorDataPromises);

      const incidentPromises = publicVendors.map((v) =>
        vendorService.getVendorIncidents(v.vendor_name).catch(() => ({
          vendor_name: v.vendor_name,
          incidents: [],
        }))
      );

      const incidentResults = await Promise.all(incidentPromises);

      const allIncidents: AggregatedIncident[] = incidentResults.flatMap((r) =>
        r.incidents.map((inc) => ({ ...inc, vendor_name: r.vendor_name }))
      );

      allIncidents.sort(
        (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
      );

      setVendors(vendorResults);
      setIncidents(allIncidents);
      setLastUpdated(new Date());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load status data';
      setError(message);
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

  const hasIssue = vendors.some((v) => {
    const s = mapStatus(v.detail.recent_status);
    return s === 'degraded' || s === 'down';
  });

  const allOperational = vendors.length > 0 && !hasIssue;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-[#0891B2]" />
            <Skeleton className="h-9 w-52" />
          </div>
          <Skeleton className="h-6 w-80 mx-auto mb-6" />
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 border border-gray-200 bg-gray-50">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
        <section className="mb-16" aria-label="System components">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-4">Components</h2>
          <ComponentsSkeleton />
        </section>
        <section aria-label="Incident history">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-4">Incident History</h2>
          <IncidentsSkeleton />
        </section>
      </div>
    );
  }

  if (error && vendors.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-24">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-8 w-8 text-[#0891B2]" />
            <h1 className="text-3xl md:text-4xl font-bold text-[#09090B]">System Status</h1>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-red-50 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-[#09090B] mb-2">
            Unable to load status data
          </h2>
          <p className="text-[#52525B] text-sm max-w-md mb-6">{error}</p>
          <Button variant="outline" onClick={() => fetchData()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-24">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Activity className="h-8 w-8 text-[#0891B2]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#09090B]">System Status</h1>
        </div>
        <p className="text-[#52525B] text-lg">
          Real-time health of Reliastra&apos;s monitoring infrastructure.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 border border-gray-200 bg-gray-50">
          <span
            className={cn(
              'h-2.5 w-2.5 rounded-full',
              allOperational ? 'bg-emerald-500' : hasIssue ? 'bg-amber-500 animate-pulse' : 'bg-gray-400'
            )}
          />
          <span
            className={cn(
              'text-sm font-medium',
              allOperational ? 'text-emerald-600' : hasIssue ? 'text-amber-600' : 'text-gray-500'
            )}
          >
            {vendors.length === 0
              ? 'No Systems Configured'
              : allOperational
                ? 'All Systems Operational'
                : 'Partial Issues Detected'}
          </span>
          {refreshing && (
            <RefreshCw className="h-3.5 w-3.5 text-[#A1A1AA] animate-spin ml-1" />
          )}
        </div>
      </div>

      {/* System Components */}
      <section className="mb-16" aria-label="System components">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
          Components
        </h2>
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center rounded-lg border border-[#E4E4E7] bg-[#F8F9FA]">
            <Inbox className="h-10 w-10 text-[#A1A1AA] mb-3" />
            <p className="text-[#52525B] font-medium mb-1">No public vendors yet</p>
            <p className="text-[#A1A1AA] text-sm">System components will appear here once configured.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map((v) => {
              const status = mapStatus(v.detail.recent_status);
              const config = statusConfig[status];
              const displayName = v.detail.display_name || v.detail.vendor_name;
              const uptime = v.history?.uptime_percentage_24h;
              return (
                <div
                  key={v.detail.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-4 md:p-5 transition-colors',
                    config.bg
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'h-3 w-3 rounded-full shrink-0',
                        config.dot,
                        status === 'degraded' && 'animate-pulse'
                      )}
                    />
                    <span className="text-[#09090B] font-medium">{displayName}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[#52525B] text-sm hidden sm:inline">
                      24h uptime
                    </span>
                    <span className={cn('text-sm font-semibold tabular-nums', config.color)}>
                      {uptime !== undefined && uptime !== null
                        ? `${uptime.toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Incident History */}
      <section aria-label="Incident history">
        <h2 className="text-[11px] font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
          Incident History
        </h2>
        {incidents.length === 0 ? (
          <div className="rounded-lg border border-[#E4E4E7] bg-[#F8F9FA] py-10 text-center">
            <p className="text-[#52525B] text-sm">No incidents recorded.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E4E4E7] bg-[#F8F9FA]">
                    <th className="text-left py-3 px-4 text-[#52525B] font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-[#52525B] font-medium">Component</th>
                    <th className="text-left py-3 px-4 text-[#52525B] font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-[#52525B] font-medium hidden md:table-cell">Duration</th>
                    <th className="text-left py-3 px-4 text-[#52525B] font-medium hidden lg:table-cell">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc) => (
                    <tr
                      key={inc.incident_id}
                      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-[#52525B] whitespace-nowrap">
                        {formatDate(inc.started_at)}
                      </td>
                      <td className="py-3 px-4 text-[#09090B] font-medium">
                        {inc.dependency_name || inc.vendor_name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'text-xs font-medium px-2.5 py-1 rounded-full',
                            getIncidentStatusColor(inc.status)
                          )}
                        >
                          {getIncidentStatusLabel(inc.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#52525B] hidden md:table-cell">
                        {formatDuration(inc.duration_seconds)}
                      </td>
                      <td className="py-3 px-4 text-[#52525B] hidden lg:table-cell capitalize">
                        {inc.severity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Footer note */}
      <div className="mt-12 text-center">
        <p className="text-[#A1A1AA] text-sm">
          {lastUpdated
            ? `Last updated: ${formatLastUpdated(lastUpdated)}`
            : 'Last updated: —'}
          {' · Page refreshes every 60 seconds'}
        </p>
      </div>
    </div>
  );
}
