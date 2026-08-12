"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { LatencyPoint } from "@/services/dashboardService";

interface LatencyChartProps {
  data: LatencyPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-[#2A2D3A] bg-[#1A1D27] px-4 py-3 shadow-xl">
      <p className="text-xs text-[#64748B] mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#94A3B8] capitalize">{entry.dataKey.replace(/_/g, " ")}:</span>
          <span className="text-[#F1F5F9] font-medium">{entry.value.toFixed(0)}ms</span>
        </div>
      ))}
    </div>
  );
}

export function LatencyChart({ data }: LatencyChartProps) {
  const chartData = data.map((d) => ({
    time: new Date(d.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    "US East": d.us_east_1,
    "EU West": d.eu_west_1,
    "AP Southeast": d.ap_southeast_1,
  }));

  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-[#F1F5F9]">Response Latency</h3>
          <p className="text-xs text-[#64748B] mt-1">Multi-region latency over 24 hours</p>
        </div>
      </div>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradUS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2D3A" />
            <XAxis dataKey="time" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} unit="ms" />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ fontSize: 12, color: "#94A3B8" }}
            />
            <Area type="monotone" dataKey="US East" stroke="#3B82F6" strokeWidth={2} fill="url(#gradUS)" />
            <Area type="monotone" dataKey="EU West" stroke="#10B981" strokeWidth={2} fill="url(#gradEU)" />
            <Area type="monotone" dataKey="AP Southeast" stroke="#F59E0B" strokeWidth={2} fill="url(#gradAP)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
