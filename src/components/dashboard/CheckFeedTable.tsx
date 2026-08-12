"use client";

import { StatusBadge } from "./StatusBadge";
import type { CheckResult } from "@/services/dashboardService";
import { formatDistanceToNow } from "date-fns";

interface CheckFeedTableProps {
  data: CheckResult[];
}

export function CheckFeedTable({ data }: CheckFeedTableProps) {
  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
      <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">Recent Checks</h3>
      <div className="space-y-3">
        {data.map((check) => (
          <div key={check.id} className="flex items-center justify-between py-2 border-b border-[#2A2D3A] last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <StatusBadge status={check.status} />
              <span className="text-sm text-[#F1F5F9] truncate">{check.dependency_name}</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs text-[#94A3B8] font-mono">
                {check.status === "down" ? "—" : `${check.response_time_ms}ms`}
              </span>
              <span className="text-xs text-[#64748B] w-16 text-right">
                {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
