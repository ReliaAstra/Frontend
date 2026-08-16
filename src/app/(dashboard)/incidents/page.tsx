"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { type Incident, type IncidentSeverity, type IncidentStatus } from "@/services/incidentService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Filter, ChevronRight } from "lucide-react";
import { ConsoleCard, ConsoleCardHeader, StatusDot } from "@/components/dashboard/ConsoleLayout";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useIncidents } from "@/hooks/useApi";

const statusOptions: Array<{ value: IncidentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
];

const severityOptions: Array<{ value: IncidentSeverity | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
];

export default function IncidentsPage() {
  const { currentOrg } = useAuth();
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "all">("all");

  const { data: incidents = [], isLoading: loading, isError: error, refetch } = useIncidents({
    status: statusFilter === "all" ? undefined : statusFilter,
    severity: severityFilter === "all" ? undefined : severityFilter,
  });

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">Incidents</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Track and manage dependency incidents across your stack.
        </p>
      </div>

      {/* ── Filter Row ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-6">
        {/* Status pills */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#52525B]" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mr-1">
            Status
          </span>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === opt.value
                  ? "bg-[#0891B2] text-white"
                  : "bg-[rgba(255,255,255,0.05)] text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#FAFAFA]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Severity pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] mr-1">
            Severity
          </span>
          {severityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSeverityFilter(opt.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                severityFilter === opt.value
                  ? "bg-[#0891B2] text-white"
                  : "bg-[rgba(255,255,255,0.05)] text-[#A1A1AA] hover:bg-[rgba(255,255,255,0.08)] hover:text-[#FAFAFA]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-300">Unable to load incidents.</p>
          <button onClick={() => refetch()} className="text-xs text-[#0891B2] hover:underline ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* ── Loading Skeletons ─────────────────────────────── */}
      {loading && !error ? (
        <ConsoleCard>
          <div className="p-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 bg-[rgba(255,255,255,0.04)] rounded-lg" />
            ))}
          </div>
        </ConsoleCard>
      ) : /* ── Empty State ──────────────────────────────────── */
      !error && incidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents recorded"
          description={
            statusFilter === "all" && severityFilter === "all"
              ? "Your dependencies are healthy. Incidents will appear here when failures are detected."
              : "No incidents match the selected filters. Try adjusting your criteria."
          }
        />
      ) : (
        /* ── Incidents Table ─────────────────────────────── */
        <ConsoleCard>
          <ConsoleCardHeader>
            <div
              className="grid gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]"
              style={{ gridTemplateColumns: "auto 1fr auto auto auto auto" }}
            >
              <span className="w-[80px]">Severity</span>
              <span>Title</span>
              <span className="w-[120px]">Dependency</span>
              <span className="w-[90px]">Status</span>
              <span className="w-[100px]">Opened</span>
              <span className="w-[60px] text-right">Action</span>
            </div>
          </ConsoleCardHeader>

          {/* Rows */}
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {incidents.map((inc, idx) => (
              <div
                key={inc.id}
                className="px-5 py-3.5 grid gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                style={{
                  gridTemplateColumns: "auto 1fr auto auto auto auto",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                {/* Severity */}
                <span className="w-[80px]">
                  <SeverityBadge severity={inc.severity} />
                </span>

                {/* Title */}
                <span className="text-sm font-medium text-[#FAFAFA] truncate">
                  {inc.description || `Incident ${inc.id.slice(0, 8)}`}
                </span>

                {/* Dependency */}
                <span className="w-[120px] font-mono text-xs text-[#A1A1AA] truncate">
                  {inc.dependency_id.slice(0, 8)}
                </span>

                {/* Status */}
                <span className="w-[90px]">
                  {inc.status === "open" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
                      </span>
                      Open
                    </span>
                  ) : inc.status === "resolved" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#16A34A]" />
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA]">
                      <span className="inline-flex h-2 w-2 rounded-full bg-[#52525B]" />
                      {inc.status.replace(/_/g, " ")}
                    </span>
                  )}
                </span>

                {/* Opened */}
                <span className="w-[100px] text-xs text-[#A1A1AA] whitespace-nowrap">
                  {formatDistanceToNow(new Date(inc.started_at), { addSuffix: true })}
                </span>

                {/* Action */}
                <span className="w-[60px] text-right">
                  <Link
                    href={`/incidents/${inc.id}`}
                    className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0891B2] hover:text-[#06B6D4] transition-colors"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </span>
              </div>
            ))}
          </div>
        </ConsoleCard>
      )}
    </div>
  );
}
