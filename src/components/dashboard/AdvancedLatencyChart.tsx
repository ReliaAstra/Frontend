"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface LatencyDataPoint {
  timestamp: string;
  region: string;
  latency_ms: number;
  dependency_id: string | null;
}

export interface DependencyOption {
  id: string;
  name: string;
}

interface AdvancedLatencyChartProps {
  data: LatencyDataPoint[] | undefined | null;
  isLoading?: boolean;
  dependencies?: DependencyOption[];
  className?: string;
  height?: number;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Group data points by timestamp and compute median + P95 */
function computeAggregated(
  data: LatencyDataPoint[],
  selectedDependencies: string[] | null,
  selectedRegion: string | null
): { timestamp: string; median_ms: number; p95_ms: number; count: number }[] {
  if (!data || data.length === 0) return [];

  // Filter data
  const filtered = data.filter((p) => {
    if (selectedDependencies && selectedDependencies.length > 0 && p.dependency_id) {
      if (!selectedDependencies.includes(p.dependency_id)) return false;
    }
    if (selectedRegion && p.region !== selectedRegion) return false;
    return true;
  });

  if (filtered.length === 0) return [];

  // Group by timestamp
  const grouped = new Map<string, number[]>();
  for (const point of filtered) {
    const existing = grouped.get(point.timestamp);
    if (existing) {
      existing.push(point.latency_ms);
    } else {
      grouped.set(point.timestamp, [point.latency_ms]);
    }
  }

  return Array.from(grouped.entries())
    .map(([timestamp, latencies]) => {
      const sorted = [...latencies].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      const p95Index = Math.ceil(sorted.length * 0.95) - 1;
      const p95 = sorted[Math.min(p95Index, sorted.length - 1)];
      return {
        timestamp,
        median_ms: Math.round(median * 100) / 100,
        p95_ms: Math.round(p95 * 100) / 100,
        count: sorted.length,
      };
    })
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

/** Extract unique regions from data */
function extractRegions(data: LatencyDataPoint[]): string[] {
  if (!data) return [];
  const regions = new Set(data.map((p) => p.region));
  return Array.from(regions).sort();
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────

function LatencyChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const timeStr = label
    ? new Date(label).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  const medianEntry = payload.find((p) => p.dataKey === "median_ms");
  const p95Entry = payload.find((p) => p.dataKey === "p95_ms");

  return (
    <div className="bg-[#1C1C24] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2.5 shadow-lg">
      <p className="text-[11px] text-[#A1A1AA] mb-1.5">{timeStr}</p>
      {medianEntry && (
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: medianEntry.color }} />
          <span className="text-[11px] text-[#A1A1AA]">Median:</span>
          <span className="text-sm font-mono font-semibold" style={{ color: medianEntry.color }}>
            {medianEntry.value.toFixed(1)} ms
          </span>
        </div>
      )}
      {p95Entry && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p95Entry.color }} />
          <span className="text-[11px] text-[#A1A1AA]">P95:</span>
          <span className="text-sm font-mono font-semibold" style={{ color: p95Entry.color }}>
            {p95Entry.value.toFixed(1)} ms
          </span>
        </div>
      )}
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export function AdvancedLatencyChart({
  data,
  isLoading,
  dependencies = [],
  className,
  height = 260,
}: AdvancedLatencyChartProps) {
  const [selectedDependencies, setSelectedDependencies] = useState<string[] | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showP95, setShowP95] = useState(true);

  const regions = useMemo(() => extractRegions(data || []), [data]);

  const chartData = useMemo(
    () => computeAggregated(data || [], selectedDependencies, selectedRegion),
    [data, selectedDependencies, selectedRegion]
  );

  // Compute alert threshold (auto-set at 2x median if no data threshold)
  const alertThreshold = useMemo(() => {
    if (chartData.length === 0) return null;
    const medianOfMedians = chartData[Math.floor(chartData.length / 2)]?.median_ms;
    if (!medianOfMedians) return null;
    return Math.round(medianOfMedians * 2);
  }, [chartData]);

  function toggleDependency(depId: string) {
    setSelectedDependencies((prev) => {
      if (prev === null) return [depId];
      if (prev.includes(depId)) {
        const next = prev.filter((id) => id !== depId);
        return next.length === 0 ? null : next;
      }
      return [...prev, depId];
    });
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Filters row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Region selector */}
        {regions.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mr-1">
              Region
            </span>
            <button
              onClick={() => setSelectedRegion(null)}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                !selectedRegion
                  ? "bg-[rgba(8,145,178,0.15)] text-[#0891B2]"
                  : "text-[#52525B] hover:text-[#A1A1AA]"
              )}
            >
              All
            </button>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(selectedRegion === r ? null : r)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                  selectedRegion === r
                    ? "bg-[rgba(8,145,178,0.15)] text-[#0891B2]"
                    : "text-[#52525B] hover:text-[#A1A1AA]"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* P95 toggle */}
        <button
          onClick={() => setShowP95((v) => !v)}
          className={cn(
            "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
            showP95
              ? "bg-[rgba(220,38,38,0.15)] text-[#DC2626]"
              : "text-[#52525B] hover:text-[#A1A1AA]"
          )}
        >
          P95 {showP95 ? "ON" : "OFF"}
        </button>

        {/* Dependency filter (if available) */}
        {dependencies.length > 1 && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[10px] uppercase tracking-wider text-[#52525B] font-semibold mr-1">
              Deps
            </span>
            <button
              onClick={() => setSelectedDependencies(null)}
              className={cn(
                "px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                !selectedDependencies
                  ? "bg-[rgba(139,92,246,0.15)] text-[#8B5CF6]"
                  : "text-[#52525B] hover:text-[#A1A1AA]"
              )}
            >
              All
            </button>
            {dependencies.slice(0, 5).map((dep) => (
              <button
                key={dep.id}
                onClick={() => toggleDependency(dep.id)}
                className={cn(
                  "px-2 py-0.5 rounded text-[11px] font-medium transition-colors max-w-[120px] truncate",
                  selectedDependencies?.includes(dep.id)
                    ? "bg-[rgba(139,92,246,0.15)] text-[#8B5CF6]"
                    : "text-[#52525B] hover:text-[#A1A1AA]"
                )}
              >
                {dep.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center rounded-lg bg-[#131318] border border-[rgba(255,255,255,0.06)]" style={{ height }}>
          <div className="w-full h-full animate-pulse bg-[#1A1A20] rounded-lg" />
        </div>
      ) : !chartData || chartData.length === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg bg-[#131318] border border-[rgba(255,255,255,0.06)]"
          style={{ height }}
        >
          <p className="text-sm text-[#52525B]">No latency data available for this selection.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="medianGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0891B2" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0891B2" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="p95Gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) =>
                new Date(v).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              }
              stroke="#52525B"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#52525B" }}
            />
            <YAxis
              stroke="#52525B"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#52525B" }}
              width={45}
              tickFormatter={(v: number) => `${v.toFixed(0)}ms`}
            />
            <Tooltip content={<LatencyChartTooltip />} />
            <Legend
              verticalAlign="top"
              height={24}
              iconType="line"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: "#A1A1AA" }}
            />

            {/* Alert threshold line */}
            {alertThreshold && (
              <ReferenceLine
                y={alertThreshold}
                stroke="#D97706"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: `Alert: ${alertThreshold}ms`,
                  position: "right",
                  fill: "#D97706",
                  fontSize: 10,
                }}
              />
            )}

            {/* P95 area + line */}
            {showP95 && (
              <Area
                type="monotone"
                dataKey="p95_ms"
                stroke="#DC2626"
                strokeWidth={1.5}
                fill="url(#p95Gradient)"
                isAnimationActive={false}
                dot={false}
                strokeDasharray="4 2"
                name="P95 Latency"
              />
            )}

            {/* Median area + line (primary) */}
            <Area
              type="monotone"
              dataKey="median_ms"
              stroke="#0891B2"
              strokeWidth={2}
              fill="url(#medianGradient)"
              isAnimationActive={false}
              dot={false}
              name="Median Latency"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}

      {/* Stats row */}
      {chartData.length > 0 && (
        <div className="flex items-center gap-6 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0891B2]" />
            <span className="text-[#52525B]">Median:</span>
            <span className="font-mono text-[#FAFAFA]">
              {chartData[chartData.length - 1]?.median_ms.toFixed(1)}ms
            </span>
          </div>
          {showP95 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
              <span className="text-[#52525B]">P95:</span>
              <span className="font-mono text-[#FAFAFA]">
                {chartData[chartData.length - 1]?.p95_ms.toFixed(1)}ms
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[#52525B]">Data points:</span>
            <span className="font-mono text-[#A1A1AA]">{chartData.reduce((a, c) => a + c.count, 0)}</span>
          </div>
          {selectedRegion && (
            <div className="flex items-center gap-1.5">
              <span className="text-[#52525B]">Region:</span>
              <span className="font-mono text-[#0891B2]">{selectedRegion}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
