"use client";

import { useEffect, useState } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LatencyChart } from "@/components/dashboard/LatencyChart";
import { SlaDegradationWidget } from "@/components/dashboard/SlaDegradationWidget";
import { CheckFeedTable } from "@/components/dashboard/CheckFeedTable";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { dashboardService, type DashboardSummary, type LatencyPoint, type SlaDegradation, type CheckResult } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// Mock critical operations data
const mockCriticalOps = [
  {
    id: "INC-2024-0847",
    title: "Twilio SMS API returning 503 errors",
    severity: "critical" as const,
    dependency: "Twilio SMS",
    client: "Acme Digital Agency",
    site: "Production",
    vendorCorrelation: "Twilio carrier outage — US East",
    confidence: 0.94,
    startedAt: "2026-08-12T17:32:00Z",
  },
  {
    id: "INC-2024-0846",
    title: "Auth0 OIDC token endpoint latency elevated",
    severity: "high" as const,
    dependency: "Auth0 OIDC",
    client: "Acme Digital Agency",
    site: "Production",
    vendorCorrelation: null,
    confidence: 0.78,
    startedAt: "2026-08-12T16:15:00Z",
  },
];

export default function DashboardPage() {
  const { currentOrg } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [latency, setLatency] = useState<LatencyPoint[]>([]);
  const [sla, setSla] = useState<SlaDegradation | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);

  useEffect(() => {
    dashboardService.getSummary().then(setSummary);
    dashboardService.getLatency().then(setLatency);
    dashboardService.getSlaDegradation().then(setSla);
    dashboardService.getRecentChecks().then(setChecks);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[15px] font-semibold text-gray-900 tracking-tight">OPERATIONS OVERVIEW</h1>
          <span className="text-[11px] text-gray-400 font-normal">{currentOrg?.name || "Acme Digital Agency"}</span>
        </div>
        <p className="text-[12px] text-gray-400">
          Production Intelligence — {summary ? (
            <>
              <span className="text-gray-600 font-medium">{summary.total_dependencies}</span> Dependencies
              {" · "}
              <span className="text-gray-600 font-medium">{summary.active_incidents}</span> Active Incidents
              {" · "}
              <span className={summary.uptime_24h >= 99.9 ? "text-emerald-600" : "text-amber-600"}><span className="font-medium">{summary.uptime_24h.toFixed(2)}%</span></span> Dependency Reliability
            </>
          ) : "Analyzing observations..."}
        </p>
      </div>

      {/* KPI Metric Strip */}
      {summary ? <KpiCards data={summary} /> : <KpiStripSkeleton />}

      {/* Critical Operations */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
          <h2 className="text-[13px] font-semibold text-gray-900">Critical Operations</h2>
          <span className="text-[11px] text-gray-400 ml-auto">{mockCriticalOps.length} incidents requiring attention</span>
        </div>
        <div className="divide-y divide-gray-100">
          {mockCriticalOps.map((inc) => (
            <Link
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors group"
            >
              <SeverityBadge severity={inc.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-gray-900 group-hover:text-[#0891B2] transition-colors">
                    {inc.title}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                  <span className="font-mono text-gray-500">{inc.id}</span>
                  <span>{inc.client} / {inc.site}</span>
                  <span>{inc.dependency}</span>
                </div>
              </div>
              {inc.vendorCorrelation && (
                <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                  <span>Vendor correlation detected</span>
                </div>
              )}
              <div className="text-right shrink-0">
                <div className="text-[11px] text-gray-400">Confidence</div>
                <div className="text-[13px] font-mono font-medium text-gray-900">{(inc.confidence * 100).toFixed(0)}%</div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Chart + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <div>
          {latency.length > 0 ? (
            <LatencyChart data={latency} />
          ) : (
            <Skeleton className="h-[320px] rounded-lg bg-white" />
          )}
        </div>
        <div>
          {sla ? <SlaDegradationWidget data={sla} /> : <Skeleton className="h-[260px] rounded-lg bg-white" />}
        </div>
      </div>

      {/* Recent Checks Table */}
      <div>
        {checks.length > 0 ? (
          <CheckFeedTable data={checks} />
        ) : (
          <Skeleton className="h-[300px] rounded-lg bg-white" />
        )}
      </div>
    </div>
  );
}

function KpiStripSkeleton() {
  return (
    <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
      <div className="divide-x divide-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-5 py-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}