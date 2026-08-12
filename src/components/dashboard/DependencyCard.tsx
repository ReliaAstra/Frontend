"use client";

import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import { ExternalLink, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";
import type { Dependency } from "@/services/dependencyService";

interface DependencyCardProps {
  dependency: Dependency;
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
}

export function DependencyCard({ dependency, onToggle, onDelete }: DependencyCardProps) {
  const sparkData = dependency.recent_response_times.map((v) => ({ v }));
  const maxVal = Math.max(...dependency.recent_response_times, 1);

  return (
    <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[#F1F5F9] truncate">{dependency.name}</h3>
            <StatusBadge status={dependency.status} />
          </div>
          <p className="text-xs text-[#64748B] font-mono truncate flex items-center gap-1">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {dependency.target_url}
          </p>
        </div>
        <button
          onClick={() => onToggle?.(dependency.id, !dependency.is_active)}
          className="shrink-0 ml-2 text-[#64748B] hover:text-[#F1F5F9] transition-colors"
          title={dependency.is_active ? "Pause monitoring" : "Resume monitoring"}
        >
          {dependency.is_active ? <ToggleRight className="h-5 w-5 text-[#10B981]" /> : <ToggleLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-0.5">Response Time</p>
          <p className="text-sm font-medium text-[#F1F5F9]">
            {dependency.status === "down" ? "—" : `${dependency.last_response_time_ms}ms`}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-0.5">Check Interval</p>
          <p className="text-sm font-medium text-[#F1F5F9]">{dependency.check_interval_seconds}s</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-0.5">Uptime 24h</p>
          <p className={`text-sm font-medium ${dependency.uptime_24h >= 99.9 ? "text-emerald-400" : dependency.uptime_24h >= 99 ? "text-amber-400" : "text-red-400"}`}>
            {dependency.uptime_24h.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-0.5">Last Check</p>
          <p className="text-sm font-medium text-[#94A3B8]">
            {formatDistanceToNow(new Date(dependency.last_check_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {sparkData.length > 0 && (
        <div className="h-[40px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sparkData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Bar dataKey="v" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                {sparkData.map((_, i) => {
                  const val = sparkData[i].v;
                  let color = "#10B981";
                  if (val > maxVal * 0.8) color = "#EF4444";
                  else if (val > maxVal * 0.5) color = "#F59E0B";
                  if (val === 0) color = "#EF4444";
                  return <Cell key={i} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#2A2D3A]">
        <button
          onClick={() => onDelete?.(dependency.id)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
