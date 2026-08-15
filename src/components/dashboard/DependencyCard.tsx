"use client";

import { useState } from "react";
import { ExternalLink, Trash2, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Dependency } from "@/services/dependencyService";

interface DependencyCardProps {
  dependency: Dependency;
  history?: { uptime_percentage: number; avg_latency_ms: number } | null;
  onToggle?: (id: string, active: boolean) => void;
  onDelete?: (id: string) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
}

function statusFromActive(dep: Dependency): "up" | "down" | "unknown" {
  if (!dep.is_active) return "unknown";
  return "up";
}

export function DependencyCard({ dependency, history, onToggle, onDelete, isToggling, isDeleting }: DependencyCardProps) {
  const status = statusFromActive(dependency);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-[#09090B] truncate">{dependency.name}</h3>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                status === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                status === "down" ? "bg-red-50 text-red-600 border-red-200" :
                "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]"
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  status === "up" ? "bg-emerald-500" : status === "down" ? "bg-red-500" : "bg-[#71717A]"
                }`} />
                {status === "up" ? "Active" : status === "down" ? "Down" : "Paused"}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] font-mono truncate flex items-center gap-1">
              <ExternalLink className="h-3 w-3 shrink-0" />
              {dependency.endpoint_url}
            </p>
          </div>
          <button
            onClick={() => onToggle?.(dependency.id, !dependency.is_active)}
            disabled={isToggling || isDeleting}
            className="shrink-0 ml-2 text-[#A1A1AA] hover:text-[#09090B] transition-colors disabled:opacity-50"
            title={dependency.is_active ? "Pause monitoring" : "Resume monitoring"}
          >
            {isToggling ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : dependency.is_active ? (
              <ToggleRight className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Method</p>
            <p className="text-sm font-medium text-[#09090B]">{dependency.method.toUpperCase()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Check Interval</p>
            <p className="text-sm font-medium text-[#09090B]">{dependency.check_interval_seconds}s</p>
          </div>
          {history && (
            <>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Uptime 24h</p>
                <p className={`text-sm font-medium ${history.uptime_percentage >= 99.9 ? "text-emerald-600" : history.uptime_percentage >= 99 ? "text-amber-600" : "text-red-600"}`}>
                  {history.uptime_percentage.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Avg Latency</p>
                <p className={`text-sm font-medium ${history.avg_latency_ms > 500 ? "text-red-600" : history.avg_latency_ms > 200 ? "text-amber-600" : "text-[#09090B]"}`}>
                  {Math.round(history.avg_latency_ms)}ms
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Regions</p>
            <p className="text-sm font-medium text-[#52525B] capitalize">
              {dependency.regions?.join(", ") || "default"}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#A1A1AA] mb-0.5">Timeout</p>
            <p className="text-sm font-medium text-[#09090B]">{dependency.timeout_seconds}s</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#E4E4E7]">
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={isToggling || isDeleting}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#52525B] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-white border-[#E4E4E7]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#09090B]">Remove {dependency.name}?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#71717A]">
              This will stop monitoring this dependency and remove it from your dashboard.
              Historical data is retained according to your plan&apos;s retention policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#E4E4E7] text-[#52525B]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onDelete?.(dependency.id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
