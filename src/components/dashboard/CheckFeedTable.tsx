"use client";

import { StatusBadge } from "./StatusBadge";
import type { CheckResult } from "@/services/dashboardService";
import { formatDistanceToNow } from "date-fns";

interface CheckFeedTableProps {
  data: CheckResult[];
}

export function CheckFeedTable({ data }: CheckFeedTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Recent Checks</h3>
      <div className="space-y-3">
        {data.map((check) => (
          <div key={check.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
            <div className="flex items-center gap-3 min-w-0">
              <StatusBadge status={check.status} />
              <span className="text-sm text-gray-900 truncate">{check.dependency_name}</span>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-xs text-gray-500 font-mono">
                {check.status === "down" ? "—" : `${check.response_time_ms}ms`}
              </span>
              <span className="text-xs text-gray-400 w-16 text-right">
                {formatDistanceToNow(new Date(check.checked_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
