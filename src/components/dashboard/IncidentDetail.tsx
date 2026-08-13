"use client";

import { SeverityBadge } from "./SeverityBadge";
import { IncidentTimeline } from "./IncidentTimeline";
import { format } from "date-fns";
import { Link2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncidentDetail as IncidentDetailType, TimelineEvent, CorrelatedSignal } from "@/services/incidentService";

interface IncidentDetailProps {
  incident: IncidentDetailType;
  timeline: TimelineEvent[];
  signals: CorrelatedSignal[];
  onStatusUpdate?: (status: "open" | "resolved" | "false_positive") => void;
}

const statusSteps = ["open", "resolved"] as const;
const statusLabels: Record<string, string> = { open: "Open", resolved: "Resolved", false_positive: "False Positive" };

export function IncidentDetail({ incident, timeline, signals, onStatusUpdate }: IncidentDetailProps) {
  const currentStep = statusSteps.indexOf(incident.status as "open" | "resolved");

  const duration = incident.resolved_at
    ? (() => {
        const ms = new Date(incident.resolved_at!).getTime() - new Date(incident.started_at).getTime();
        if (ms < 60000) return `${Math.round(ms / 1000)}s`;
        if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
      })()
    : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SeverityBadge severity={incident.severity} />
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border-blue-200">
            <span className={`h-1.5 w-1.5 rounded-full ${incident.status === "open" ? "bg-amber-500" : incident.status === "resolved" ? "bg-emerald-500" : "bg-[#71717A]"}`} />
            {statusLabels[incident.status] || incident.status}
          </span>
          <span className="text-xs text-[#A1A1AA] font-mono ml-auto">{incident.id}</span>
        </div>
        <h1 className="text-xl font-semibold text-[#09090B] mb-2">
          {incident.description || `Incident ${incident.id.slice(0, 8)}`}
        </h1>
        <div className="flex flex-wrap gap-4 text-xs text-[#52525B]">
          <span>Started: {format(new Date(incident.started_at), "MMM d, yyyy HH:mm")}</span>
          {incident.resolved_at && (
            <span>Resolved: {format(new Date(incident.resolved_at), "MMM d, yyyy HH:mm")}</span>
          )}
          {duration && <span>Duration: {duration}</span>}
        </div>

        {/* Status Pipeline */}
        <div className="flex items-center gap-0 mt-6">
          {statusSteps.map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={
                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-colors " +
                    (idx <= currentStep
                      ? "bg-[#0891B2] border-[#0891B2] text-white"
                      : "bg-transparent border-[#E4E4E7] text-[#A1A1AA]")
                  }
                >
                  {idx < currentStep ? "\u2713" : (idx + 1)}
                </div>
                <span className={"text-[10px] mt-1.5 " + (idx <= currentStep ? "text-[#09090B]" : "text-[#A1A1AA]")}>
                  {statusLabels[step]}
                </span>
              </div>
              {idx < statusSteps.length - 1 && (
                <div className={"h-0.5 w-12 sm:w-20 mx-1 mb-4 " + (idx < currentStep ? "bg-[#0891B2]" : "bg-[#E4E4E7]")} />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        {onStatusUpdate && incident.status === "open" && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              onClick={() => onStatusUpdate("resolved")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
            >
              Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate("false_positive")}
              className="text-xs border-[#E4E4E7] text-[#52525B]"
            >
              Mark False Positive
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      {incident.description && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-3">Description</h3>
          <div className="prose prose-sm max-w-none text-[#52525B] text-sm leading-relaxed whitespace-pre-wrap">
            {incident.description}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">Timeline</h3>
            <IncidentTimeline events={timeline} />
          </div>

          {/* Correlated Signals */}
          {signals.length > 0 && (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">Correlated Dependencies</h3>
              <div className="space-y-4">
                {signals.map((signal) => (
                  <div key={signal.id} className="border border-[#E4E4E7] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#09090B]">{signal.name}</span>
                      <span className="text-xs text-[#52525B]">{(signal.correlation * 100).toFixed(0)}% confidence</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] font-mono mt-1">{signal.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Metadata */}
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">Incident Metadata</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Link2 className="h-4 w-4 text-[#A1A1AA]" />
                <span className="text-[#52525B]">Dependency:</span>
                <span className="text-[#09090B] font-mono text-xs">{incident.dependency_id.slice(0, 12)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-[#A1A1AA]" />
                <span className="text-[#52525B]">Root Cause:</span>
                <span className="text-[#09090B] font-medium capitalize">{incident.root_cause?.replace(/_/g, " ") || "Unknown"}</span>
              </div>
              {incident.evidence_report_id && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[#52525B]">Evidence:</span>
                  <span className="text-[#0891B2] font-mono text-xs">{incident.evidence_report_id.slice(0, 12)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Evidence */}
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">Evidence Reports</h3>
            {incident.evidence_report_id ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#F8F9FA] border border-[#E4E4E7]">
                  <div>
                    <p className="text-xs font-medium text-[#09090B]">SLA Evidence Report</p>
                    <p className="text-[10px] text-[#A1A1AA]">Report ID: {incident.evidence_report_id.slice(0, 16)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Available
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#A1A1AA]">No evidence reports generated yet. Evidence is created when incidents are resolved.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
