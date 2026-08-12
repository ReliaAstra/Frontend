"use client";

import { useEffect, useState } from "react";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { LatencyChart } from "@/components/dashboard/LatencyChart";
import { SlaDegradationWidget } from "@/components/dashboard/SlaDegradationWidget";
import { CheckFeedTable } from "@/components/dashboard/CheckFeedTable";
import { dashboardService, type DashboardSummary, type LatencyPoint, type SlaDegradation, type CheckResult } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
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
    <div className="space-y-6">
      {/* Breadcrumb & Title */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Overview of your external dependency health</p>
      </div>

      {/* KPI Cards */}
      {summary ? <KpiCards data={summary} /> : <KpiCardsSkeleton />}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Latency Chart */}
        <div>
          {latency.length > 0 ? (
            <LatencyChart data={latency} />
          ) : (
            <Skeleton className="h-[360px] rounded-xl bg-white" />
          )}
        </div>

        {/* Right: SLA + Check Feed */}
        <div className="space-y-6">
          {sla ? <SlaDegradationWidget data={sla} /> : <Skeleton className="h-[320px] rounded-xl bg-white" />}
          {checks.length > 0 ? <CheckFeedTable data={checks} /> : <Skeleton className="h-[240px] rounded-xl bg-white" />}
        </div>
      </div>
    </div>
  );
}

function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[120px] rounded-xl bg-white" />
      ))}
    </div>
  );
}