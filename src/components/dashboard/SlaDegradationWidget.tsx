"use client";

import { Shield } from "lucide-react";
import type { SlaDegradationResponse } from "@/services/dashboardService";

interface SlaDegradationWidgetProps {
  data: SlaDegradationResponse;
}

export function SlaDegradationWidget({ data }: SlaDegradationWidgetProps) {
  const degradationPct = data.total_degradation_pct;

  return (
    <div className="rounded-lg border border-[#E4E4E7] bg-white p-5 h-full">
      <h3 className="text-[13px] font-semibold text-[#09090B] mb-4">SLA Degradation</h3>
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] block mb-1">
            {data.period} degradation
          </span>
          <p className={cn(
            "text-2xl font-semibold font-mono tracking-tight",
            degradationPct === 0 ? "text-emerald-600" : degradationPct < 0.5 ? "text-amber-600" : "text-red-600"
          )}>
            {degradationPct.toFixed(2)}%
          </p>
        </div>
        <div className="space-y-2 pt-3 border-t border-[#F0F0F0]">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#52525B]">Affected services</span>
            <span className="text-[#09090B] font-medium">{data.affected_services}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#52525B]">Period</span>
            <span className="text-[#09090B] font-medium">{data.period}</span>
          </div>
        </div>
        {degradationPct === 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-600">
            <Shield className="h-3.5 w-3.5" />
            <span className="font-medium">No SLA degradation</span>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
