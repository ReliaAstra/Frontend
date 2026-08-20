"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, ShieldCheck } from "lucide-react";
import { useIncidents, useDependencies } from "@/hooks/useApi";
import type { Incident, IncidentStatus, IncidentSeverity } from "@/services/incidentService";
import { Card, EmptyState, PageHeader, Skeleton, severityMeta } from "@/components/rs/ui";
import { incidentRef } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: Array<{ value: IncidentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "false_positive", label: "False positive" },
];

const SEVERITY_OPTIONS: Array<{ value: IncidentSeverity | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
];

function statusPill(status: IncidentStatus) {
  if (status === "open") {
    return { label: "Open", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)" };
  }
  if (status === "resolved") {
    return { label: "Resolved", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.2)" };
  }
  return { label: "False positive", color: "#6B7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)" };
}

export default function IncidentsPage() {
  const [statusFilter, setStatusFilter] = React.useState<IncidentStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = React.useState<IncidentSeverity | "all">("all");

  const { data: incidents = [], isLoading, isError, refetch } = useIncidents({
    status: statusFilter === "all" ? undefined : statusFilter,
    severity: severityFilter === "all" ? undefined : severityFilter,
    limit: 100,
  });
  const { data: depsList } = useDependencies();

  const deps = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of depsList || []) map[d.id] = d.name;
    return map;
  }, [depsList]);

  const filtered = incidents;

  return (
    <div>
      <PageHeader title="Incidents" subtitle="Track and manage dependency incidents across your stack." />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#6B7280] mr-1">Status</span>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors border",
                statusFilter === opt.value
                  ? "bg-[#111827] border-[#374151] text-[#F9FAFB]"
                  : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#6B7280] mr-1">Severity</span>
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSeverityFilter(opt.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors border",
                severityFilter === opt.value
                  ? "bg-[#111827] border-[#374151] text-[#F9FAFB]"
                  : "border-transparent text-[#6B7280] hover:text-[#9CA3AF]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-[#EF4444] shrink-0" />
          <p className="text-sm text-[#EF4444] flex-1">Unable to load incidents.</p>
          <button onClick={() => refetch()} className="text-xs font-medium text-[#3B82F6] hover:underline">
            Retry
          </button>
        </Card>
      )}

      {/* Loading */}
      {isLoading && !isError && (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={ShieldCheck}
            title="No active incidents"
            body={
              statusFilter === "all" && severityFilter === "all"
                ? "Your dependencies are stable."
                : "No incidents match the selected filters."
            }
          />
        </Card>
      )}

      {/* Table (desktop) */}
      {!isLoading && !isError && filtered.length > 0 && (
        <>
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hidden md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
                  <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 110, letterSpacing: "0.05em" }}>
                    Severity
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
                    Incident
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                    Title
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 160, letterSpacing: "0.05em" }}>
                    Dependency
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 140, letterSpacing: "0.05em" }}>
                    Status
                  </th>
                  <th className="text-right px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 110, letterSpacing: "0.05em" }}>
                    Started
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc: Incident, i: number) => {
                  const sev = severityMeta(inc.severity);
                  const st = statusPill(inc.status);
                  return (
                    <tr
                      key={inc.id}
                      className={cn("cursor-pointer hover:bg-[#1F2937] transition-colors", i < filtered.length - 1 && "border-b border-[#1F2937]")}
                      style={{ height: 52 }}
                      onClick={() => (window.location.href = `/incidents/${inc.id}`)}
                    >
                      <td className="px-4">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: `${sev.color}1a`, color: sev.color, border: `1px solid ${sev.color}33` }}
                        >
                          {sev.label}
                        </span>
                      </td>
                      <td className="text-xs text-[#3B82F6]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {incidentRef(inc.id)}
                      </td>
                      <td className="text-sm text-[#F9FAFB] truncate max-w-[320px]">
                        {inc.description || `Incident ${inc.id}`}
                      </td>
                      <td className="text-sm text-[#9CA3AF] truncate">{deps[inc.dependency_id] || inc.dependency_id.slice(0, 8)}</td>
                      <td>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="text-right px-4 text-xs text-[#6B7280] whitespace-nowrap">
                        {new Date(inc.started_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-3">
            {filtered.map((inc: Incident) => {
              const sev = severityMeta(inc.severity);
              const st = statusPill(inc.status);
              return (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="block bg-[#111827] border border-[#1F2937] rounded-xl p-4"
                  style={{ borderLeft: `3px solid ${sev.color}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[#3B82F6]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {incidentRef(inc.id)}
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: st.bg, color: st.color, border: `1px solid ${st.border}` }}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-[#F9FAFB] mt-2">{inc.description || inc.id}</p>
                  <div className="flex items-center justify-between mt-2 text-xs text-[#6B7280]">
                    <span>{deps[inc.dependency_id] || inc.dependency_id.slice(0, 8)}</span>
                    <ChevronRight className="h-4 w-4 text-[#374151]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
