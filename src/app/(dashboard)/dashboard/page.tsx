"use client";

import { useEffect, useState, useCallback } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LatencyChart } from "@/components/dashboard/LatencyChart";
import { SlaDegradationWidget } from "@/components/dashboard/SlaDegradationWidget";
import { CheckFeedTable } from "@/components/dashboard/CheckFeedTable";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { dashboardService, type DashboardSummaryResponse, type LatencyDataPoint, type SlaDegradationResponse, type CheckResultResponse } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { incidentService, type Incident } from "@/services/incidentService";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { currentOrg, isLoading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [latency, setLatency] = useState<LatencyDataPoint[]>([]);
  const [sla, setSla] = useState<SlaDegradationResponse | null>(null);
  const [checks, setChecks] = useState<CheckResultResponse[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [s, l, sl, c, inc] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getLatency(24),
        dashboardService.getSlaDegradation(30),
        dashboardService.getRecentChecks(10),
        incidentService.list("open"),
      ]);
      setSummary(s);
      setLatency(l);
      setSla(sl);
      setChecks(c);
      setIncidents(inc);
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [authLoading, fetchDashboard]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-[320px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">
              OPERATIONS OVERVIEW
            </h1>
            <span className="text-[11px] text-[#A1A1AA] font-normal">
              {currentOrg?.name || "No organization"}
            </span>
          </div>
          <p className="text-[12px] text-[#A1A1AA]">
            {summary ? (
              <>
                <span className="text-[#52525B] font-medium">{summary.active_dependencies_count}</span> dependencies
                {" · "}
                <span className={summary.open_incidents_count > 0 ? "text-amber-600" : "text-emerald-600"}>
                  <span className="font-medium">{summary.open_incidents_count}</span>
                </span> open incidents
                {" · "}
                <span className={cn(
                  "font-medium",
                  summary.overall_uptime_percentage >= 99.9 ? "text-emerald-600" : summary.overall_uptime_percentage >= 99 ? "text-amber-600" : "text-red-600"
                )}>
                  {summary.overall_uptime_percentage.toFixed(2)}%
                </span> reliability
              </>
            ) : loading ? "Loading observations..." : "No data available"}
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing || loading}
          className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <p className="text-xs text-red-500 mt-0.5">
              Check that the backend is accessible and your session is valid.
            </p>
          </div>
          <button onClick={() => fetchDashboard()} className="text-xs font-medium text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {/* KPI Strip */}
      {loading ? <KpiStripSkeleton /> : summary ? <KpiCards data={summary} /> : null}

      {/* Active Incidents */}
      {!loading && incidents.length > 0 && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <h2 className="text-[13px] font-semibold text-[#09090B]">Active Incidents</h2>
            <span className="text-[11px] text-[#A1A1AA] ml-auto">{incidents.length} requiring attention</span>
          </div>
          <div className="divide-y divide-[#F0F0F0]">
            {incidents.map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
              >
                <SeverityBadge severity={inc.severity} />
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors">
                    {inc.description || `Incident ${inc.id.slice(0, 8)}`}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#A1A1AA]">
                    <span className="font-mono text-[#52525B]">{inc.id.slice(0, 12)}</span>
                    <span className="capitalize">{inc.root_cause?.replace("_", " ") || "Unknown"}</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No incidents + no data state */}
      {!loading && !error && incidents.length === 0 && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6 text-center">
          <p className="text-sm text-[#09090B] font-medium">No active incidents</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            {summary
              ? `${summary.active_dependencies_count} dependencies are operating normally.`
              : "Connect to the backend to see operational data."
            }
          </p>
        </div>
      )}

      {/* Main Grid: Chart + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div>
          {latency.length > 0 ? (
            <LatencyChart data={latency} />
          ) : (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
              <p className="text-sm text-[#52525B]">No latency data available yet.</p>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Latency trends will appear once observations are collected.
              </p>
            </div>
          )}
        </div>
        <div>
          {sla ? <SlaDegradationWidget data={sla} /> : (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
              <p className="text-sm text-[#52525B]">No SLA degradation data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Checks */}
      <div>
        {checks.length > 0 ? (
          <CheckFeedTable data={checks} />
        ) : (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
            <p className="text-sm text-[#52525B]">No recent check results.</p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Check results will appear once dependencies are configured and measurements begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiStripSkeleton() {
  return (
    <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
      <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-5 py-4 space-y-2">
            <Skeleton className="h-3 w-24 bg-[#F8F9FA]" />
            <Skeleton className="h-6 w-16 bg-[#F8F9FA]" />
          </div>
        ))}
      </div>
    </div>
  );
}
