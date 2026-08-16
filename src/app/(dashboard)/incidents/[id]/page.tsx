"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileSearch, Loader2, ExternalLink } from "lucide-react";
import { incidentService, type IncidentDetail as IncidentDetailType, type TimelineEvent, type CorrelatedSignal, buildTimeline, buildCorrelatedSignals } from "@/services/incidentService";
import { evidenceService, type EvidenceDetail } from "@/services/evidenceService";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { PrecisionTimeline } from "@/components/dashboard/PrecisionTimeline";
import { ContributorCard } from "@/components/dashboard/ContributorCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

export default function IncidentCommandCenterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [incident, setIncident] = useState<IncidentDetailType | null>(null);
  const [evidence, setEvidence] = useState<EvidenceDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [signals, setSignals] = useState<CorrelatedSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [evidenceLoading, setEvidenceLoading] = useState(true);

  const fetchIncident = useCallback(async () => {
    setLoading(true);
    setEvidenceLoading(true);
    try {
      const inc = await incidentService.getById(id);
      setIncident(inc);
      setTimeline(buildTimeline(inc));
      setSignals(buildCorrelatedSignals(inc));

      // Attempt to fetch evidence
      if (inc.evidence_report_id) {
        try {
          const ev = await evidenceService.getByIncident(id);
          setEvidence(ev);
        } catch {
          setEvidence(null);
        }
      }
    } catch {
      /* handled by null check below */
    } finally {
      setLoading(false);
      setEvidenceLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncident();
  }, [fetchIncident]);

  const handleStatusUpdate = async (status: "open" | "resolved" | "false_positive") => {
    setStatusUpdating(true);
    try {
      await incidentService.update(id, { status });
      if (incident) setIncident({ ...incident, status });
      toast.success(`Incident marked as ${status.replace("_", " ")}.`);
    } catch {
      toast.error("Incident could not be updated.");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[180px] rounded-lg bg-white" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <Skeleton className="h-[400px] rounded-lg bg-white" />
          <Skeleton className="h-[400px] rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Incident not found.</p>
        <button onClick={() => router.push("/incidents")} className="mt-4 text-xs text-[#0891B2] hover:underline">
          Back to Incidents
        </button>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    open: "Open",
    resolved: "Resolved",
    false_positive: "False Positive",
  };

  const duration = incident.resolved_at
    ? (() => {
        const ms = new Date(incident.resolved_at!).getTime() - new Date(incident.started_at).getTime();
        if (ms < 60000) return `${Math.round(ms / 1000)}s`;
        if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
      })()
    : (() => {
        const ms = Date.now() - new Date(incident.started_at).getTime();
        if (ms < 60000) return `${Math.round(ms / 1000)}s (ongoing)`;
        if (ms < 3600000) return `${Math.floor(ms / 60000)}m (ongoing)`;
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m (ongoing)`;
      })();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/incidents")}
        className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Incidents
      </button>

      {/* Command Center Header */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SeverityBadge severity={incident.severity} />
          <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-600 border-blue-200">
            <span className={cn(
              "h-1.5 w-1.5 rounded-full animate-pulse",
              incident.status === "open" ? "bg-amber-500" :
              incident.status === "resolved" ? "bg-emerald-500" : "bg-[#71717A]"
            )} />
            {statusLabels[incident.status] || incident.status}
          </span>
          <span className="text-[11px] text-[#A1A1AA] font-mono ml-auto">{incident.id}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-[#09090B] mb-2">
          {incident.description || `Incident ${incident.id.slice(0, 8)}`}
        </h1>

        {/* Metadata strip */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-[#52525B] mb-5">
          <span className="flex items-center gap-1.5">
            <span className="text-[#A1A1AA]">Started:</span>
            <span className="font-medium">{format(new Date(incident.started_at), "MMM d, yyyy HH:mm:ss")}</span>
          </span>
          {incident.resolved_at && (
            <span className="flex items-center gap-1.5">
              <span className="text-[#A1A1AA]">Resolved:</span>
              <span className="font-medium">{format(new Date(incident.resolved_at), "MMM d, yyyy HH:mm:ss")}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="text-[#A1A1AA]">Duration:</span>
            <span className="font-medium font-mono">{duration}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[#A1A1AA]">Root Cause:</span>
            <span className="font-medium capitalize">{incident.root_cause?.replace(/_/g, " ") || "Unknown"}</span>
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {incident.status === "open" && (
            <>
              <button
                onClick={() => handleStatusUpdate("resolved")}
                disabled={statusUpdating}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-2 transition-colors disabled:opacity-50"
              >
                {statusUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusUpdate("false_positive")}
                disabled={statusUpdating}
                className="inline-flex items-center gap-2 rounded-md border border-[#E4E4E7] bg-white text-[#52525B] text-xs font-medium px-3.5 py-2 hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
              >
                Mark False Positive
              </button>
            </>
          )}
          {incident.evidence_report_id && (
            <Link
              href={`/evidence/${incident.evidence_report_id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#0891B2]/30 bg-[#0891B2]/5 text-[#0891B2] text-xs font-medium px-3.5 py-2 hover:bg-[#0891B2]/10 transition-colors ml-auto"
            >
              <FileSearch className="h-3.5 w-3.5" />
              View Evidence
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* What Happened Summary (from evidence AI assessment if available) */}
      {evidence?.ai_assessment && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-3">Assessment</h3>
          <p className="text-sm text-[#52525B] leading-relaxed">{evidence.ai_assessment}</p>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-[#A1A1AA]">
            <span className="rounded bg-[#F8F9FA] px-1.5 py-0.5 text-[#52525B]">AI-assisted</span>
            <span>Evidence-first, not AI-first. Always verify.</span>
          </div>
        </div>
      )}

      {/* Main Grid: Timeline + Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left: Timeline */}
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">
              Event Timeline
            </h3>
            <span className="text-[11px] text-[#A1A1AA]">
              {timeline.length} events
            </span>
          </div>
          <PrecisionTimeline
            events={timeline}
            incidentStart={incident.started_at}
            incidentEnd={incident.resolved_at}
          />
        </div>

        {/* Right: Contributors + Metadata */}
        <div className="space-y-5">
          {/* Likely Contributors */}
          {evidence && evidence.contributors && evidence.contributors.length > 0 && (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
                Likely Contributors
              </h3>
              <div className="space-y-3">
                {evidence.contributors.map((c) => (
                  <ContributorCard key={c.dependency_id} contributor={c} />
                ))}
              </div>
            </div>
          )}

          {/* Incident Metadata */}
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
              Incident Metadata
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Dependency</span>
                <span className="text-[#09090B] font-mono text-xs">{incident.dependency_id.slice(0, 12)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Root Cause</span>
                <span className="text-[#09090B] font-medium capitalize">{incident.root_cause?.replace(/_/g, " ") || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Evidence</span>
                {incident.evidence_report_id ? (
                  <Link href={`/evidence/${incident.evidence_report_id}`} className="text-[#0891B2] font-mono text-xs hover:underline">
                    {incident.evidence_report_id.slice(0, 16)}
                  </Link>
                ) : (
                  <span className="text-[#A1A1AA]">None</span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Correlations</span>
                <span className="text-[#09090B] font-medium">{incident.correlations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Created</span>
                <span className="text-[#52525B] text-xs">{format(new Date(incident.created_at), "MMM d, yyyy HH:mm")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#A1A1AA]">Updated</span>
                <span className="text-[#52525B] text-xs">{formatDistanceToNow(new Date(incident.updated_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Correlated Dependencies (legacy from signals) */}
          {signals.length > 0 && !evidence?.contributors && (
            <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
              <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
                Correlated Dependencies
              </h3>
              <div className="space-y-3">
                {signals.map((signal) => (
                  <div key={signal.id} className="border border-[#E4E4E7] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#09090B]">{signal.name}</span>
                      <span className="text-xs text-[#52525B]">{(signal.correlation * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[10px] text-[#A1A1AA] font-mono">{signal.metric}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
