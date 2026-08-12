"use client";

import type { DashboardSummary } from "@/services/dashboardService";

interface KpiCardsProps {
  data: DashboardSummary;
}

interface MetricDef {
  key: keyof DashboardSummary;
  label: string;
  format: (v: number) => string;
  colorFn: (v: number) => string;
}

const metrics: MetricDef[] = [
  {
    key: "active_incidents",
    label: "ACTIVE INCIDENTS",
    format: (v) => v.toString(),
    colorFn: (v) => v > 0 ? "text-red-600" : "text-gray-900",
  },
  {
    key: "total_dependencies",
    label: "DEPENDENCIES",
    format: (v) => v.toString(),
    colorFn: () => "text-gray-900",
  },
  {
    key: "uptime_24h",
    label: "RELIABILITY (24H)",
    format: (v) => `${v.toFixed(2)}%`,
    colorFn: (v) => v >= 99.9 ? "text-emerald-600" : v >= 99 ? "text-amber-600" : "text-red-600",
  },
  {
    key: "avg_latency_ms",
    label: "AVG LATENCY",
    format: (v) => `${v.toFixed(0)}ms`,
    colorFn: (v) => v > 500 ? "text-amber-600" : "text-gray-900",
  },
  {
    key: "checks_24h",
    label: "CHECKS (24H)",
    format: (v) => v.toLocaleString(),
    colorFn: () => "text-gray-900",
  },
];

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="border border-gray-200 bg-white rounded-lg overflow-hidden">
      <div className="divide-x divide-gray-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {metrics.map((m) => {
          const value = data[m.key];
          return (
            <div key={m.key} className="px-5 py-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-1.5">
                {m.label}
              </p>
              <p className={`text-xl font-semibold font-mono tabular-nums leading-none ${m.colorFn(value)}`}>
                {m.format(value)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
