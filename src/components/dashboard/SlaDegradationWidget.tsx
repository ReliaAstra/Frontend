"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SlaDegradation } from "@/services/dashboardService";

interface SlaDegradationWidgetProps {
  data: SlaDegradation;
}

export function SlaDegradationWidget({ data }: SlaDegradationWidgetProps) {
  const pct = (data.current_sla / data.target_sla) * 100;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference * (1 - Math.min(pct, 100) / 100);

  const trendIcon = data.trend === "improving" ? TrendingUp : data.trend === "degrading" ? TrendingDown : Minus;
  const trendColor = data.trend === "improving" ? "text-emerald-600" : data.trend === "degrading" ? "text-red-600" : "text-amber-600";
  const trendLabel = data.trend === "improving" ? "Improving" : data.trend === "degrading" ? "Degrading" : "Stable";
  const TrendIcon = trendIcon;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="text-[13px] font-semibold text-gray-900 mb-4">SLA Compliance</h3>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="96" height="96" className="-rotate-90">
            <circle cx="48" cy="48" r="36" fill="none" stroke="#F3F4F6" strokeWidth="6" />
            <circle
              cx="48" cy="48" r="36" fill="none"
              stroke={pct >= 99.9 ? "#10B981" : pct >= 99.5 ? "#F59E0B" : "#EF4444"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[17px] font-bold text-gray-900 font-mono tabular-nums">{data.current_sla.toFixed(2)}%</span>
            <span className="text-[9px] text-gray-400 uppercase">current</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5 min-w-0">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Target</span>
            <span className="text-gray-900 font-medium font-mono">{data.target_sla.toFixed(2)}%</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Gap</span>
            <span className={pct >= 100 ? "text-emerald-600 font-mono" : "text-amber-600 font-mono"}>
              {pct >= 100 ? "On target" : `-${data.degradation_pct.toFixed(2)}%`}
            </span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-500">Affected</span>
            <span className="text-gray-900 font-medium">{data.affected_services} services</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] pt-0.5">
            <TrendIcon className={`h-3.5 w-3.5 ${trendColor}`} />
            <span className={trendColor}>{trendLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}