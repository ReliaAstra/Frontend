"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from "recharts";
import type { LatencyDataPoint } from "@/services/dashboardService";

interface LatencyChartProps {
  data: LatencyDataPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-md border border-[#E4E4E7] bg-white px-3 py-2.5 shadow-lg">
      <p className="text-[11px] text-[#A1A1AA] mb-1.5 font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#52525B] capitalize">{entry.dataKey}:</span>
          <span className="text-[#09090B] font-medium font-mono">{entry.value.toFixed(0)}ms</span>
        </div>
      ))}
    </div>
  );
}

export function LatencyChart({ data }: LatencyChartProps) {
  // The backend returns data as flat array with region field
  // Pivot into columns per region for Recharts
  const regions = [...new Set(data.map(d => d.region))];
  const timeSlots = [...new Set(data.map(d => d.timestamp))].sort();

  const chartData = timeSlots.map(ts => {
    const point: Record<string, string | number> = {
      time: new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    data.filter(d => d.timestamp === ts).forEach(d => {
      point[d.region] = d.latency_ms;
    });
    return point;
  });

  // Identify incident windows: where latency exceeds 1.5x median
  const allLatencies = data.map(d => d.latency_ms);
  const median = allLatencies.length > 0 ? allLatencies.sort((a, b) => a - b)[Math.floor(allLatencies.length / 2)] : 0;
  const threshold = median * 1.5;

  const incidentWindows: Array<{ start: number; end: number }> = [];
  let inIncident = false;
  let incidentStart = 0;
  chartData.forEach((d, i) => {
    const maxLatency = Math.max(...regions.map(r => (d[r] as number) || 0));
    const isIncident = maxLatency > threshold && threshold > 0;
    if (isIncident && !inIncident) {
      incidentStart = i;
      inIncident = true;
    } else if (!isIncident && inIncident) {
      incidentWindows.push({ start: incidentStart, end: i - 1 });
      inIncident = false;
    }
  });
  if (inIncident) {
    incidentWindows.push({ start: incidentStart, end: chartData.length - 1 });
  }

  const regionColors: Record<string, string> = {
    "us-east": "#0891B2",
    "us-east-1": "#0891B2",
    "eu-west": "#6B7280",
    "eu-west-1": "#6B7280",
    "ap-southeast": "#9CA3AF",
    "ap-southeast-1": "#9CA3AF",
  };

  return (
    <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-[#09090B]">Response Latency</h3>
          <p className="text-[11px] text-[#A1A1AA] mt-0.5">Multi-region observations · 24 hours</p>
        </div>
        {incidentWindows.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
            <span className="h-2 w-2 rounded-sm bg-amber-100 border border-amber-300" />
            Elevated period{incidentWindows.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              {regions.map((r, i) => (
                <linearGradient key={r} id={`grad-${r}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={regionColors[r] || "#0891B2"} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={regionColors[r] || "#0891B2"} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            {incidentWindows.map((w, i) => (
              <ReferenceArea
                key={i}
                x1={chartData[w.start]?.time}
                x2={chartData[Math.min(w.end, chartData.length - 1)]?.time}
                fill="#FEF3C7"
                fillOpacity={0.5}
                stroke="#F59E0B"
                strokeOpacity={0.3}
                strokeDasharray="4 4"
              />
            ))}
            <XAxis
              dataKey="time"
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              axisLine={false}
              tickLine={false}
              interval={Math.max(Math.floor(timeSlots.length / 8), 1)}
            />
            <YAxis
              tick={{ fill: "#A1A1AA", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              axisLine={false}
              tickLine={false}
              unit="ms"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={5}
              wrapperStyle={{ fontSize: 11, color: "#52525B", paddingTop: 8 }}
            />
            {regions.map((r) => (
              <Area
                key={r}
                type="monotone"
                dataKey={r}
                stroke={regionColors[r] || "#0891B2"}
                strokeWidth={1.5}
                fill={`url(#grad-${r})`}
                dot={false}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
