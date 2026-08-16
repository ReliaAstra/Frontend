"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { buildTimeline, type TimelineEvent, type CorrelatedSignal, buildCorrelatedSignals } from "@/services/incidentService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle, XCircle, AlertTriangle, Clock, ArrowLeft, ShieldCheck, Lock } from "lucide-react";
import { ConsoleCard, ConsoleCardBody } from "@/components/dashboard/ConsoleLayout";
import { LockedFeature } from "@/components/dashboard/LockedFeature";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import type { Plan } from "@/services/billingService";
import { useIncident, useUpdateIncident } from "@/hooks/useApi";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function LiveTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState(Date.now() - new Date(startedAt).getTime());

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - new Date(startedAt).getTime());
    }, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return <span className="font-mono text-sm text-[#FAFAFA]">{formatDuration(elapsed)}</span>;
}

function StaticDuration({ start, end }: { start: string; end: string }) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return <span className="font-mono text-sm text-[#FAFAFA]">{formatDuration(ms)}</span>;
}

// ── Timeline event dot color ─────────────────────────────────────────────────

const timelineDotColor: Record<string, string> = {
  status_change: "#DC2626",
  correlation: "#0891B2",
  evidence_generated: "#16A34A",
  resolved: "#16A34A",
  acknowledged: "#D97706",
  note: "#52525B",
};

// ── Component ────────────────────────────────────────────────────────────────

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentOrg } = useAuth();
  const id = params.id as string;

  const { data: incident, isLoading, isError, refetch } = useIncident(id);
  const updateMutation = useUpdateIncident();

  // Build derived data from incident
  const timeline: TimelineEvent[] = incident ? buildTimeline(incident) : [];
  const signals: CorrelatedSignal[] = incident ? buildCorrelatedSignals(incident) : [];

  const handleStatusUpdate = async (status: "open" | "resolved" | "false_positive") => {
    try {
      await updateMutation.mutateAsync({ id, data: { status } });
    } catch {
      /* toast could be added later */
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48 bg-[rgba(255,255,255,0.04)]" />
        <Skeleton className="h-8 w-[420px] bg-[rgba(255,255,255,0.04)]" />
        <Skeleton className="h-[200px] bg-[rgba(255,255,255,0.04)] rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
          <Skeleton className="h-[400px] bg-[rgba(255,255,255,0.04)] rounded-xl" />
          <Skeleton className="h-[400px] bg-[rgba(255,255,255,0.04)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!incident || isError) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-8 h-8 text-[#52525B] mx-auto mb-3" />
        <p className="text-[#A1A1AA]">Incident not found.</p>
        <button
          onClick={() => router.push("/incidents")}
          className="mt-4 text-xs text-[#0891B2] hover:text-[#06B6D4] transition-colors"
        >
          Back to Incidents
        </button>
      </div>
    );
  }

  const shortId = id.slice(0, 6);
  const currentPlan = (currentOrg?.plan as Plan) || "free";

  // Top correlation (if any)
  const topCorrelation =
    incident.correlations.length > 0
      ? incident.correlations.reduce((a, b) =>
          a.correlation_confidence > b.correlation_confidence ? a : b
        )
      : null;

  const confidencePct = topCorrelation
    ? Math.round(topCorrelation.correlation_confidence * 100)
    : null;

  // Evidence strength label
  const evidenceLabel =
    confidencePct === null
      ? null
      : confidencePct >= 80
        ? "Strong"
        : confidencePct >= 50
          ? "Moderate"
          : "Weak";

  const evidenceLabelColor =
    evidenceLabel === "Strong"
      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
      : evidenceLabel === "Moderate"
        ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
        : "text-[#A1A1AA] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.08)]";

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <button
        onClick={() => router.push("/incidents")}
        className="inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Incidents
        <span className="text-[#52525B]">/</span>
        <span className="text-[#FAFAFA] font-mono text-xs">INC-{shortId}</span>
      </button>

      {/* ── Title + Badges ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-[#FAFAFA] tracking-tight">
          {incident.description || incident.id}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <SeverityBadge severity={incident.severity} />
          {incident.status === "open" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]" />
              </span>
              Open
            </span>
          ) : incident.status === "resolved" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Resolved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] px-2.5 py-0.5 text-xs font-medium text-[#A1A1AA]">
              <XCircle className="w-3.5 h-3.5" />
              {incident.status.replace(/_/g, " ")}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            <Clock className="w-3.5 h-3.5" />
            {incident.resolved_at ? (
              <StaticDuration start={incident.started_at} end={incident.resolved_at} />
            ) : (
              <LiveTimer startedAt={incident.started_at} />
            )}
          </span>
        </div>
      </div>

      {/* ── Two-Column Layout ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        {/* ── LEFT COLUMN ────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* 1. Likely Contributor Card */}
          <ConsoleCard>
            <ConsoleCardBody className="space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Likely Contributor
              </h3>
              {topCorrelation ? (
                <div className="rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#FAFAFA] font-mono">
                      {topCorrelation.correlated_dependency_id.slice(0, 8)}
                    </span>
                    {evidenceLabel && (
                      <span
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          evidenceLabelColor
                        )}
                      >
                        {evidenceLabel}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Confidence</span>
                      <span className="font-mono text-[#FAFAFA]">
                        {confidencePct}%
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                      <div
                        className={cn(
                          "h-1.5 rounded-full transition-all",
                          confidencePct && confidencePct >= 80
                            ? "bg-emerald-500"
                            : confidencePct && confidencePct >= 50
                              ? "bg-amber-500"
                              : "bg-[#A1A1AA]"
                        )}
                        style={{ width: `${confidencePct || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Method</span>
                      <span className="text-[#FAFAFA] capitalize">
                        {topCorrelation.correlation_method}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Time window</span>
                      <span className="text-[#FAFAFA] font-mono">
                        {topCorrelation.time_window_seconds}s
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#52525B]">
                  No correlated dependency identified yet.
                </p>
              )}
            </ConsoleCardBody>
          </ConsoleCard>

          {/* 2. Observed Signals */}
          <ConsoleCard>
            <ConsoleCardBody className="space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Observed Signals
              </h3>
              {signals.length > 0 ? (
                <ul className="space-y-2.5">
                  {signals.map((sig) => (
                    <li
                      key={sig.id}
                      className="flex items-start gap-3 rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] p-3"
                    >
                      <span
                        className="mt-0.5 inline-flex h-2 w-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            sig.correlation >= 0.8
                              ? "#16A34A"
                              : sig.correlation >= 0.5
                                ? "#D97706"
                                : "#52525B",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-[#FAFAFA] truncate">
                            {sig.name}
                          </span>
                          <span className="text-xs font-mono text-[#A1A1AA] shrink-0">
                            {(sig.correlation * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#52525B] font-mono mt-0.5 truncate">
                          {sig.metric}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#52525B]">
                  No correlated signals detected for this incident.
                </p>
              )}
            </ConsoleCardBody>
          </ConsoleCard>

          {/* 3. Timeline */}
          <ConsoleCard>
            <ConsoleCardBody className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                  Timeline
                </h3>
                <span className="text-[11px] text-[#52525B] font-mono">
                  {timeline.length} events
                </span>
              </div>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(255,255,255,0.08)]" />

                <div className="space-y-5">
                  {timeline.map((evt) => (
                    <div key={evt.id} className="relative flex gap-3">
                      {/* Dot */}
                      <span
                        className="absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0F] shrink-0"
                        style={{
                          backgroundColor:
                            timelineDotColor[evt.type] || "#52525B",
                        }}
                      />
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#FAFAFA]">
                          {evt.action}
                        </p>
                        <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
                          {evt.details}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[11px] text-[#52525B]">
                            {evt.actor}
                          </span>
                          <span className="text-[11px] text-[#52525B] font-mono">
                            {format(new Date(evt.timestamp), "MMM d, HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        </div>

        {/* ── RIGHT COLUMN ───────────────────────────────────────── */}
        <div className="space-y-6">
          {/* 1. Actions Card */}
          <ConsoleCard>
            <ConsoleCardBody className="space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Actions
              </h3>

              <div className="space-y-2.5">
                {/* Acknowledge */}
                {incident.status === "open" && (
                  <button
                    onClick={() => handleStatusUpdate("open")}
                    disabled={updateMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2.5 text-sm font-medium text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.08)] transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D97706]" />
                    Acknowledge
                  </button>
                )}

                {/* Resolve */}
                {incident.status === "open" && (
                  <button
                    onClick={() => handleStatusUpdate("resolved")}
                    disabled={updateMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                )}

                {/* Generate Evidence (locked on free) */}
                <LockedFeature currentPlan={currentPlan} feature="evidence">
                  <button
                    disabled={updateMutation.isPending}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0891B2] hover:bg-[#0E7490] px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Generate Evidence
                  </button>
                </LockedFeature>
              </div>
            </ConsoleCardBody>
          </ConsoleCard>

          {/* 2. Metadata Card */}
          <ConsoleCard>
            <ConsoleCardBody className="space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Metadata
              </h3>
              <div className="space-y-3">
                <MetaRow label="Incident ID" value={incident.id} mono />
                <MetaRow
                  label="Opened at"
                  value={format(
                    new Date(incident.started_at),
                    "MMM d, yyyy HH:mm:ss"
                  )}
                />
                <MetaRow
                  label="Dependency"
                  value={incident.dependency_id.slice(0, 12)}
                  mono
                />
                <MetaRow
                  label="Region"
                  value={"—"}
                />
                <MetaRow
                  label="Check interval"
                  value={"—"}
                />
                <MetaRow
                  label="Confidence"
                  value={
                    confidencePct !== null
                      ? `${confidencePct}%`
                      : "—"
                  }
                />
                {incident.resolved_at && (
                  <MetaRow
                    label="Resolved at"
                    value={format(
                      new Date(incident.resolved_at),
                      "MMM d, yyyy HH:mm:ss"
                    )}
                  />
                )}
                <MetaRow
                  label="Root cause"
                  value={
                    incident.root_cause !== "unknown"
                      ? incident.root_cause.replace(/_/g, " ")
                      : "Unknown"
                  }
                  capitalize
                />
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function MetaRow({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[#A1A1AA]">{label}</span>
      <span
        className={cn(
          "text-[#FAFAFA] text-xs",
          mono && "font-mono",
          capitalize && "capitalize"
        )}
      >
        {value}
      </span>
    </div>
  );
}
