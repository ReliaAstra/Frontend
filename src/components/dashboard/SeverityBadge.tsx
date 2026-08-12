"use client";

import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/services/incidentService";

const severityConfig: Record<IncidentSeverity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  high: { label: "High", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  medium: { label: "Medium", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  low: { label: "Low", className: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const config = severityConfig[severity] || severityConfig.low;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
