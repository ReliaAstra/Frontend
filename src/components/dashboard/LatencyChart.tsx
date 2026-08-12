"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from "recharts";
import type { LatencyPoint } from "@/services/dashboardService";

interface LatencyChartProps {
  data: LatencyPoint[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2.5 shadow-lg">
      <p className="text-[11px] text-gray-400 mb-1.5 font-mono">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.dataKey}:</span>
          <span className="text-gray-900 font-medium font-mono">{entry.value.toFixed(0)}ms</span>
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

  // Identify incident windows: find contiguous periods where any region exceeds 1.5x baseline
  const baseline = data.reduce((acc, d) => ({
    us: acc.us + d.us_east_1,
    eu: acc.eu + d.eu_west_1,
    ap: acc.ap + d.ap_southeast_1,
  }), { us: 0, eu: 0, ap: 0 });
  const threshold = {
    us: (baseline.us / data.length) * 1.5,
    eu: (baseline.eu / data.length) * 1.5,
    ap: (baseline.ap / data.length) * 1.5,
  };

  // Find incident windows (simplified: hours where any region exceeds threshold)
  const incidentWindows: Array<{ start: number; end: number }> = [];
  let inIncident = false;
  let incidentStart = 0;
  data.forEach((d, i) => {
    const isIncident = d.us_east_1 > threshold.us || d.eu_west_1 > threshold.eu || d.ap_southeast_1 > threshold.ap;
    if (isIncident && !inIncident) {
      incidentStart = i;
      inIncident = true;
    } else if (!isIncident && inIncident) {
      incidentWindows.push({ start: incidentStart, end: i - 1 });
      inIncident = false;
    }
  });
  if (inIncident) {
    incidentWindows.push({ start: incidentStart, end: data.length - 1 });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[13px] font-semibold text-gray-900">Response Latency</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Multi-region latency over 24 hours</p>
        </div>
        {incidentWindows.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600">
            <span className="h-2 w-2 rounded-sm bg-amber-100 border border-amber-300" />
            Incident window{incidentWindows.length > 1 ? "s" : ""} detected
          </div>
        )}
      </div>
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gradUS" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891B2" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradEU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6B7280" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#6B7280" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradAP" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9CA3AF" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#9CA3AF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            {/* Incident window markers */}
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
              tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              axisLine={false}
              tickLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "ui-monospace, monospace" }}
              axisLine={false}
              tickLine={false}
              unit="ms"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={5}
              wrapperStyle={{ fontSize: 11, color: "#6B7280", paddingTop: 8 }}
            />
            <Area type="monotone" dataKey="US East" stroke="#0891B2" strokeWidth={1.5} fill="url(#gradUS)" dot={false} />
            <Area type="monotone" dataKey="EU West" stroke="#6B7280" strokeWidth={1.5} fill="url(#gradEU)" dot={false} />
            <Area type="monotone" dataKey="AP Southeast" stroke="#9CA3AF" strokeWidth={1.5} fill="url(#gradAP)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
