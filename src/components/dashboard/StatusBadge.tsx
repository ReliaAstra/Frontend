"use client";

import { cn } from "@/lib/utils";

type StatusType = "up" | "down" | "degraded" | "unknown";

const statusConfig: Record<StatusType, { label: string; className: string; dotClass: string }> = {
  up: { label: "Operational", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dotClass: "bg-emerald-500" },
  down: { label: "Down", className: "bg-red-500/10 text-red-400 border-red-500/20", dotClass: "bg-red-500" },
  degraded: { label: "Degraded", className: "bg-amber-500/10 text-amber-400 border-amber-500/20", dotClass: "bg-amber-500" },
  unknown: { label: "Unknown", className: "bg-slate-500/10 text-slate-400 border-slate-500/20", dotClass: "bg-slate-500" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status] || statusConfig.unknown;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", config.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}
