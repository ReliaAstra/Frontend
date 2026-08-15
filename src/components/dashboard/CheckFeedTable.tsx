"use client";

import { StatusBadge } from "./StatusBadge";
import type { CheckResultResponse } from "@/services/dashboardService";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CheckFeedTableProps {
  data: CheckResultResponse[];
}

export function CheckFeedTable({ data }: CheckFeedTableProps) {
  return (
    <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-[#09090B]">Recent Observations</h3>
        <span className="text-[11px] text-[#A1A1AA]">Last {data.length} checks</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F0F0F0]">
              <th className="text-left px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Status</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Dependency</th>
              <th className="text-left px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden sm:table-cell">Region</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Latency</th>
              <th className="text-right px-3 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Code</th>
              <th className="text-right px-5 py-2.5 text-[10px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">Observed</th>
            </tr>
          </thead>
          <tbody>
            {data.map((check) => (
              <tr key={check.id} className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                <td className="px-5 py-2.5">
                  <StatusBadge status={check.is_up ? "up" : check.error_message ? "degraded" : "down"} />
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[13px] text-[#09090B] font-mono">{check.dependency_id.slice(0, 8)}</span>
                </td>
                <td className="px-3 py-2.5 text-[12px] text-[#52525B] hidden sm:table-cell">
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#F0F0F0]">
                    {check.region}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-[13px] text-[#09090B] font-mono tabular-nums text-right">
                  {check.is_up ? `${Math.round(check.latency_ms)}ms` : "N/A"}
                </td>
                <td className="px-3 py-2.5 text-[13px] font-mono tabular-nums text-right">
                  <span className={cn(
                    check.status_code >= 500 ? "text-red-600" : check.status_code >= 400 ? "text-amber-600" : "text-[#09090B]"
                  )}>
                    {check.status_code}
                  </span>
                </td>
                <td className="px-5 py-2.5 text-[12px] text-[#A1A1AA] font-mono text-right">
                  {format(new Date(check.executed_at), "HH:mm:ss")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
