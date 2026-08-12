"use client";

import { Layers, AlertTriangle, Shield, Clock } from "lucide-react";
import type { DashboardSummary } from "@/services/dashboardService";

interface KpiCardsProps {
  data: DashboardSummary;
}

const cards = [
  {
    key: "total_dependencies" as const,
    label: "Total Dependencies",
    icon: Layers,
    color: "text-[#8B5CF6]",
    bg: "bg-violet-50",
    format: (v: number) => v.toString(),
  },
  {
    key: "active_incidents" as const,
    label: "Active Incidents",
    icon: AlertTriangle,
    color: "text-[#EF4444]",
    bg: "bg-red-50",
    format: (v: number) => v.toString(),
  },
  {
    key: "uptime_24h" as const,
    label: "Uptime 24h",
    icon: Shield,
    color: "text-[#10B981]",
    bg: "bg-emerald-50",
    format: (v: number) => `${v.toFixed(2)}%`,
  },
  {
    key: "avg_latency_ms" as const,
    label: "Avg Latency",
    icon: Clock,
    color: "text-[#3B82F6]",
    bg: "bg-blue-50",
    format: (v: number) => `${v.toFixed(0)}ms`,
  },
];

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              {card.label}
            </p>
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {card.format(data[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
}
