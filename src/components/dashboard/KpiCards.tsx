"use client";

import type { DashboardSummaryResponse } from "@/services/dashboardService";

interface KpiCardsProps {
  data: DashboardSummaryResponse;
}

interface MetricDef {
  label: string;
  value: string;
  color: string;
}

function buildMetrics(data: DashboardSummaryResponse): MetricDef[] {
  return [
    {
      label: "DEPENDENCIES",
      value: String(data.active_dependencies_count),
      color: "text-[#09090B]",
    },
    {
      label: "OPEN INCIDENTS",
      value: String(data.open_incidents_count),
      color: data.open_incidents_count > 0 ? "text-amber-600" : "text-emerald-600",
    },
    {
      label: "RELIABILITY",
      value: `${data.overall_uptime_percentage.toFixed(2)}%`,
      color: data.overall_uptime_percentage >= 99.9 ? "text-emerald-600" : data.overall_uptime_percentage >= 99 ? "text-amber-600" : "text-red-600",
    },
    {
      label: "ALERTS TODAY",
      value: String(data.alerts_today_count),
      color: data.alerts_today_count > 0 ? "text-amber-600" : "text-[#09090B]",
    },
  ];
}

export function KpiCards({ data }: KpiCardsProps) {
  const metrics = buildMetrics(data);
  return (
    <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
      <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA] mb-1.5">
              {m.label}
            </p>
            <p className={`text-xl font-semibold font-mono tabular-nums leading-none ${m.color}`}>
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
