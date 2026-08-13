"use client";

import { ExternalLink, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Dependency } from "@/services/dependencyService";

interface DependencyCardProps {
  dependency: Dependency;
  history?: { uptime_percentage: number; avg_latency_ms: number } | null;
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
}

function statusFromActive(dep: Dependency): "up" | "down" | "unknown" {
  if (!dep.is_active) return "unknown";
  return "up";
}

export function DependencyCard({ dependency, history, onToggle, onDelete }: DependencyCardProps) {
  const status = statusFromActive(dependency);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{dependency.name}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
              status === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
              status === "down" ? "bg-red-50 text-red-600 border-red-200" :
              "bg-gray-50 text-gray-500 border-gray-200"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${
                status === "up" ? "bg-emerald-500" : status === "down" ? "bg-red-500" : "bg-gray-400"
              }`} />
              {status === "up" ? "Active" : status === "down" ? "Down" : "Paused"}
            </span>
          </div>
          <p className="text-xs text-gray-400 font-mono truncate flex items-center gap-1">
            <ExternalLink className="h-3 w-3 shrink-0" />
            {dependency.endpoint_url}
          </p>
        </div>
        <button
          onClick={() => onToggle?.(dependency.id, !dependency.is_active)}
          className="shrink-0 ml-2 text-gray-400 hover:text-gray-900 transition-colors"
          title={dependency.is_active ? "Pause monitoring" : "Resume monitoring"}
        >
          {dependency.is_active ? <ToggleRight className="h-5 w-5 text-emerald-500" /> : <ToggleLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Method</p>
          <p className="text-sm font-medium text-gray-900">{dependency.method.toUpperCase()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Check Interval</p>
          <p className="text-sm font-medium text-gray-900">{dependency.check_interval_seconds}s</p>
        </div>
        {history && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Uptime 24h</p>
              <p className={`text-sm font-medium ${history.uptime_percentage >= 99.9 ? "text-emerald-600" : history.uptime_percentage >= 99 ? "text-amber-600" : "text-red-600"}`}>
                {history.uptime_percentage.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Avg Latency</p>
              <p className={`text-sm font-medium ${history.avg_latency_ms > 500 ? "text-red-600" : history.avg_latency_ms > 200 ? "text-amber-600" : "text-gray-900"}`}>
                {Math.round(history.avg_latency_ms)}ms
              </p>
            </div>
          </>
        )}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Regions</p>
          <p className="text-sm font-medium text-gray-500 capitalize">
            {dependency.regions?.join(", ") || "default"}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Timeout</p>
          <p className="text-sm font-medium text-gray-900">{dependency.timeout_seconds}s</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-200">
        <button
          onClick={() => onDelete?.(dependency.id)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove
        </button>
      </div>
    </div>
  );
}
