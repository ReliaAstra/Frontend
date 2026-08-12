"use client";

import { StatusBadge } from "./StatusBadge";
import type { CheckResult } from "@/services/dashboardService";
import { format } from "date-fns";

interface CheckFeedTableProps {
  data: CheckResult[];
}

export function CheckFeedTable({ data }: CheckFeedTableProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-gray-900">Recent Checks</h3>
        <span className="text-[11px] text-gray-400">Last {data.length} observations</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">Status</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">Dependency</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">Response</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">Code</th>
              <th className="text-right px-5 py-2.5 text-[10px] font-medium uppercase tracking-wider text-gray-400">Checked At</th>
            </tr>
          </thead>
          <tbody>
            {data.map((check) => (
              <tr key={check.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-2.5">
                  <StatusBadge status={check.status} />
                </td>
                <td className="px-3 py-2.5 text-[13px] text-gray-900 font-medium">{check.dependency_name}</td>
                <td className="px-3 py-2.5 text-[13px] text-gray-900 font-mono tabular-nums text-right">
                  {check.status === "down" ? "—" : `${check.response_time_ms}ms`}
                </td>
                <td className="px-3 py-2.5 text-[13px] font-mono tabular-nums text-right">
                  <span className={check.status_code >= 500 ? "text-red-600" : check.status_code >= 400 ? "text-amber-600" : "text-gray-900"}>
                    {check.status_code}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-[12px] text-gray-400 font-mono text-right">
                  {format(new Date(check.checked_at), "HH:mm:ss")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}