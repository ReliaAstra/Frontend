"use client";

import { TrendingUp } from "lucide-react";
import type { SlaDegradation } from "@/services/dashboardService";

interface SlaDegradationWidgetProps {
  data: SlaDegradation;
}

export function SlaDegradationWidget({ data }: SlaDegradationWidgetProps) {
  const pct = (data.current_sla / data.target_sla) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - Math.min(pct, 100) / 100);

  const trendColor = data.trend === "improving" ? "text-emerald-400" : data.trend === "degrading" ? "text-red-400" : "text-amber-400";
  const trendLabel = data.trend === "improving" ? "Improving" : data.trend === "degrading" ? "Degrading" : "Stable";

  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
      <h3 className="text-sm font-semibold text-[#F1F5F9] mb-4">SLA Compliance</h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg width="120" height="120" className="-rotate-90">
            <circle cx="60" cy="60" r="45" fill="none" stroke="#2A2D3A" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="45" fill="none"
              stroke={pct >= 99.9 ? "#10B981" : pct >= 99.5 ? "#F59E0B" : "#EF4444"}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-[#F1F5F9]">{data.current_sla.toFixed(2)}%</span>
            <span className="text-[10px] text-[#64748B]">current</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Target SLA</span>
          <span className="text-[#F1F5F9] font-medium">{data.target_sla.toFixed(2)}%</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Gap</span>
          <span className={pct >= 100 ? "text-emerald-400" : "text-amber-400"}>
            {pct >= 100 ? "On target" : `-${data.degradation_pct.toFixed(2)}%`}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#94A3B8]">Affected</span>
          <span className="text-[#F1F5F9] font-medium">{data.affected_services} services</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs pt-1">
          <TrendingUp className={`h-3.5 w-3.5 ${trendColor}`} />
          <span className={trendColor}>{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}
