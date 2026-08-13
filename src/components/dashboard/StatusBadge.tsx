"use client";

import { cn } from "@/lib/utils";

type StatusType = "up" | "down" | "degraded" | "unknown";

const statusConfig: Record<StatusType, { label: string; className: string; dotClass: string }> = {
  up: { label: "Operational", className: "bg-emerald-50 text-emerald-700 border-emerald-200", dotClass: "bg-emerald-500" },
  down: { label: "Down", className: "bg-red-50 text-red-700 border-red-200", dotClass: "bg-red-500" },
  degraded: { label: "Degraded", className: "bg-amber-50 text-amber-700 border-amber-200", dotClass: "bg-amber-500" },
  unknown: { label: "Unknown", className: "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]", dotClass: "bg-[#71717A]" },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const config = statusConfig[status] || statusConfig.unknown;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", config.className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  );
}