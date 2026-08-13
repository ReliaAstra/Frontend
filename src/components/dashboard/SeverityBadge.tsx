"use client";

import { cn } from "@/lib/utils";
import type { IncidentSeverity } from "@/services/incidentService";

const severityConfig: Record<string, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-red-50 text-red-700 border-red-200" },
  major: { label: "Major", className: "bg-orange-50 text-orange-700 border-orange-200" },
  high: { label: "High", className: "bg-amber-50 text-amber-700 border-amber-200" },
  minor: { label: "Minor", className: "bg-amber-50 text-amber-700 border-amber-200" },
  medium: { label: "Medium", className: "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]" },
  low: { label: "Low", className: "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]" },
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  const config = severityConfig[severity] || severityConfig.low;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", config.className)}>
      {config.label}
    </span>
  );
}