"use client";

import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/services/incidentService";

const severityConfig: Record<IncidentSeverity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-50 text-red-600 border-red-200" },
  high: { label: "High", className: "bg-amber-50 text-amber-600 border-amber-200" },
  medium: { label: "Medium", className: "bg-blue-50 text-blue-600 border-blue-200" },
  low: { label: "Low", className: "bg-gray-100 text-gray-500 border-gray-300" },
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const config = severityConfig[severity] || severityConfig.low;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
