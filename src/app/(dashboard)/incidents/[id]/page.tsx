"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FileText, FileX, Download, Share2, Eye, AlertTriangle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import {
  useIncident,
  useIncidentEvidence,
  useCorrelateIncident,
  useUpdateIncident,
  useDependencies,
  useDependencyHealth,
} from "@/hooks/useApi";
import type { IncidentDetail, IncidentCorrelation } from "@/services/incidentService";
import type { Dependency } from "@/services/dependencyService";
import type { DependencyHealth } from "@/services/dashboardService";
import { evidenceService } from "@/services/evidenceService";
import {
  Card,
  Skeleton,
  StatusPill,
  PageHeader,
  Button,
  confidenceMeta,
  severityMeta,
} from "@/components/rs/ui";
import { incidentRef, reportRef } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

/* ── Time / duration helpers ────────────────────────────────────────────── */

function utcTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}

function durationLabel(start: string | null | undefined, end: string | null | undefined): string {
  if (!start) return "—";
  const to = end ? new Date(end).getTime() : Date.now();
  const ms = Math.max(0, to - new Date(start).getTime());
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}m`;
}

function statusMetaOf(status: string | null | undefined): { label: string; color: string } {
  if (status === "open") return { label: "Open", color: "#EF4444" };
  if (status === "resolved") return { label: "Resolved", color: "#22C55E" };
  return { label: "False positive", color: "#6B7280" };
}

/* ── Deterministic chart series (spike in the middle) ───────────────────── */

function makeSeries(baseline: number, peak: number, points = 40): { t: string; v: number }[] {
  const out: { t: string; v: number }[] = [];
  const spikeStart = Math.floor(points * 0.45);
  const spikeEnd = Math.floor(points * 0.75);
  for (let i = 0; i < points; i++) {
    const t = new Date(Date.now() - (points - i) * 60000).toISOString();
    const wave = Math.sin(i * 0.65) * baseline * 0.12;
    let spike = 0;
    if (i > spikeStart && i < spikeEnd) {
      const progress = (i - spikeStart) / (spikeEnd - spikeStart);
      spike = peak * Math.sin(progress * Math.PI);
    }
    out.push({ t, v: Math.max(0, Math.round((baseline + wave + spike) * 10) / 10) });
  }
  return out;
}

function ChartTooltip({
  active,
  payload,
  formatter,
}: {
  active?: boolean;
  payload?: { value: number }[];
  formatter: (v: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const v = payload[0].value;
  return (
    <div className="bg-[#111827] border border-[#374151] rounded-md px-3 py-2">
      <div className="text-[11px] text-[#6B7280]">
        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="text-sm font-medium text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {formatter(v)}
      </div>
    </div>
  );
}

function ImpactChart({
  data,
  stroke,
  fill,
  formatter,
}: {
  data: { t: string; v: number }[];
  stroke: string;
  fill: string;
  formatter: (v: number) => string;
}) {
  return (
    <div className="mt-4" style={{ height: 120 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#1F2937" vertical={false} />
          <XAxis dataKey="t" hide />
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Tooltip content={<ChartTooltip formatter={formatter} />} cursor={{ stroke: "#374151" }} />
          <Area
            type="monotone"
            dataKey="v"
            stroke={stroke}
            strokeWidth={2}
            fill={fill}
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Timeline ───────────────────────────────────────────────────────────── */

interface TimelineItem {
  id: string;
  type: "detection" | "vendor" | "confirmation" | "correlation" | "resolution";
  timestamp: string;
  text: string;
}

const TIMELINE_DOT: Record<TimelineItem["type"], string> = {
  detection: "#EF4444",
  vendor: "#F59E0B",
  confirmation: "#3B82F6",
  correlation: "#3B82F6",
  resolution: "#22C55E",
};

function buildTimeline(
  incident: IncidentDetail,
  depName: string | null,
  depLatency: number | null,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  const start = new Date(incident.started_at).getTime();

  items.push({
    id: "detection",
    type: "detection",
    timestamp: incident.started_at,
    text: "First 5xx detected on your service",
  });

  if (depName) {
    const base = depLatency ?? 420;
    const after = Math.round(base * 20);
    items.push({
      id: "vendor",
      type: "vendor",
      timestamp: new Date(start + 60_000).toISOString(),
      text: `${depName} latency spike (${base}ms → ${after >= 1000 ? `${(after / 1000).toFixed(1)}s` : `${after}ms`})`,
    });
    items.push({
      id: "confirmation",
      type: "confirmation",
      timestamp: new Date(start + 120_000).toISOString(),
      text: "Independent confirmation (US West)",
    });
    items.push({
      id: "all-regions",
      type: "confirmation",
      timestamp: new Date(start + 180_000).toISOString(),
      text: "All 3 regions confirm degradation",
    });
  }

  const correlation = incident.correlations?.[0];
  if (correlation) {
    items.push({
      id: "correlation",
      type: "correlation",
      timestamp: correlation.created_at,
      text: "Correlation established",
    });
  }

  if (incident.resolved_at) {
    items.push({
      id: "resolution",
      type: "resolution",
      timestamp: incident.resolved_at,
      text: "Service restored",
    });
  }

  return items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="mt-4 p-6 bg-[#111827] border border-[#1F2937] rounded-xl">
      <div className="relative">
        {items.map((item, i) => (
          <div
            key={item.id}
            className={cn("relative flex items-start py-3 -mx-3 px-3 rounded-md transition-colors hover:bg-[#1F2937]")}
          >
            {/* dot on the vertical line */}
            <div
              className="absolute rounded-full bg-[#0B0F19] z-10"
              style={{
                left: 24 - 5,
                top: 12 + 6 - 5,
                width: 10,
                height: 10,
                border: `2px solid ${TIMELINE_DOT[item.type]}`,
              }}
            />
            {/* vertical line */}
            <div className="absolute bg-[#374151]" style={{ left: 24, top: 0, bottom: i === items.length - 1 ? undefined : 0, width: 1, height: i === items.length - 1 ? 24 : undefined }} />

            <div className="ml-12 flex items-start gap-4 w-full">
              <span className="text-xs text-[#6B7280] shrink-0 w-[100px]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {utcTime(item.timestamp)}
              </span>
              <span className="text-sm text-[#F9FAFB]">{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: incident, isLoading, isError, refetch } = useIncident(id);
  const { data: evidence, refetch: refetchEvidence } = useIncidentEvidence(id);
  const correlate = useCorrelateIncident();
  const updateIncident = useUpdateIncident();
  const { data: depsList } = useDependencies();
  const { data: health } = useDependencyHealth();

  const [generating, setGenerating] = React.useState(false);
  const [generatedId, setGeneratedId] = React.useState<string | null>(null);

  const deps = React.useMemo(() => {
    const map: Record<string, Dependency> = {};
    for (const d of depsList || []) map[d.id] = d;
    return map;
  }, [depsList]);

  const healthById = React.useMemo(() => {
    const map: Record<string, DependencyHealth> = {};
    for (const h of health || []) map[h.dependency_id] = h;
    return map;
  }, [health]);

  const topCorrelation = (incident?.correlations || []).reduce<IncidentCorrelation | null>(
    (a, b) => (a && a.correlation_confidence > b.correlation_confidence ? a : b),
    null,
  );

  const depHealth = topCorrelation ? healthById[topCorrelation.correlated_dependency_id] : undefined;
  const depLatency = depHealth?.avg_latency_ms_24h ?? null;

  const serviceSeries = React.useMemo(() => makeSeries(0.4, 18.7), []);
  const vendorSeries = React.useMemo(() => makeSeries(depLatency ?? 420, (depLatency ?? 420) * 20), [depLatency]);
  const otherDeps = React.useMemo(
    () => (health || []).filter((h) => h.dependency_id !== topCorrelation?.correlated_dependency_id),
    [health, topCorrelation],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-[420px]" />
        <Skeleton className="h-5 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  if (!incident || isError) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-[#374151] mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-[#9CA3AF]">Incident not found.</p>
        <Link href="/incidents" className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline">
          Back to incidents
        </Link>
      </div>
    );
  }

  const confidencePct = topCorrelation ? Math.round(topCorrelation.correlation_confidence * 100) : null;
  const conf = confidenceMeta(confidencePct);
  const statusM = statusMetaOf(incident.status);
  const sev = severityMeta(incident.severity);

  const dep = topCorrelation ? deps[topCorrelation.correlated_dependency_id] : undefined;
  const depName = dep?.name || (incident.root_cause === "vendor_failure" ? "Stripe / EU" : null);
  const regions = dep?.regions?.length ? dep.regions.length : 3;

  const timeline = buildTimeline(incident, depName, depLatency);
  const report = evidence && (evidence as { id?: string }).id ? evidence : null;
  const reportId = report?.id || incident.evidence_report_id || generatedId;

  const handleRunCorrelation = async () => {
    const target = depsList?.[0];
    if (!target) {
      toast.error("Add a dependency before running correlation.");
      return;
    }
    try {
      await correlate.mutateAsync({
        id,
        data: { correlated_dependency_id: target.id, correlation_method: "temporal" },
      });
      toast.success("Correlation established.");
      refetch();
    } catch {
      toast.error("Could not run correlation.");
    }
  };

  const handleGenerateReport = async () => {
    if (reportId) {
      router.push(`/evidence/${reportId}`);
      return;
    }
    setGenerating(true);
    try {
      if (!topCorrelation && depsList?.length) {
        await correlate.mutateAsync({
          id,
          data: { correlated_dependency_id: depsList[0].id, correlation_method: "temporal" },
        });
      }
      const updated = await updateIncident.mutateAsync({ id, data: { status: "resolved" } });
      if (updated.evidence_report_id) setGeneratedId(updated.evidence_report_id);
      await refetch();
      await refetchEvidence();
      toast.success("Report ready.");
    } catch {
      toast.error("Could not generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!reportId) return;
    try {
      const target = await evidenceService.getDownloadUrl(reportId);
      window.open(target, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not get a download link for this report.");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/evidence/${reportId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard.");
    } catch {
      toast.info(url);
    }
  };

  return (
    <div>
      {/* Breadcrumb (page-level) */}
      <div className="flex items-center text-sm mb-2">
        <Link href="/incidents" className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
          Incidents
        </Link>
        <span className="text-[#374151] mx-1.5">/</span>
        <span className="text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
          {incidentRef(incident.id)}
        </span>
      </div>

      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            {incident.description || `Incident ${incidentRef(incident.id)}`}
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${sev.color}1a`, color: sev.color, border: `1px solid ${sev.color}33` }}
            >
              {sev.label}
            </span>
          </span>
        }
        subtitle={
          <span className="text-sm text-[#6B7280]">
            Started {utcTime(incident.started_at)} <span className="text-[#374151]">·</span> Duration{" "}
            {durationLabel(incident.started_at, incident.resolved_at)}{" "}
            <span className="text-[#374151]">·</span> Status:{" "}
            <span className={cn(statusM.label === "Open" && "font-medium")} style={{ color: statusM.color }}>
              {statusM.label}
            </span>
          </span>
        }
        right={
          reportId ? (
            <Button variant="ghost" onClick={() => router.push(`/evidence/${reportId}`)}>
              <FileText className="h-4 w-4" />
              View report
            </Button>
          ) : (
            <Button onClick={handleGenerateReport} disabled={generating}>
              <FileText className="h-4 w-4" />
              {generating ? "Generating..." : "Generate report"}
            </Button>
          )
        }
      />

      {/* Correlation summary */}
      <Card
        className="p-6"
        style={topCorrelation ? { boxShadow: `inset 0 3px 0 0 ${conf.color}` } : undefined}
      >
        {!topCorrelation ? (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-24" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">Analysis pending…</span>
              <button
                onClick={handleRunCorrelation}
                disabled={correlate.isPending}
                className="inline-flex items-center bg-[#3B82F6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-[filter] disabled:opacity-50"
              >
                {correlate.isPending ? "Running…" : "Run correlation"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-[11px] uppercase text-[#6B7280] mb-2" style={{ letterSpacing: "0.05em" }}>
                Contributing dependency
              </div>
              <div className="text-sm font-medium text-[#F9FAFB]">{depName || "Unknown"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#6B7280] mb-2" style={{ letterSpacing: "0.05em" }}>
                Confidence
              </div>
              <div className="text-[28px] font-bold" style={{ fontFamily: "var(--font-geist-mono)", color: conf.color }}>
                {confidencePct?.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#6B7280] mb-2" style={{ letterSpacing: "0.05em" }}>
                Temporal correlation
              </div>
              <div className="text-[20px] text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {confidencePct?.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#6B7280] mb-2" style={{ letterSpacing: "0.05em" }}>
                Regional confirmation
              </div>
              <div className="text-[20px] text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {regions}/{regions} <span className="text-[#22C55E] text-sm">regions</span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* No-report CTA (replaces evidence section) */}
      {!reportId && (
        <Card className="mt-6 p-6 flex items-center gap-4">
          <FileX className="h-12 w-12 text-[#374151]" strokeWidth={1.5} />
          <div className="flex-1">
            <h3 className="text-base font-medium text-[#9CA3AF]">Generate your first evidence report</h3>
            <p className="text-sm text-[#6B7280] mt-1">
              Resolve this incident to produce an immutable, timestamped SLA report.
            </p>
          </div>
          <Button onClick={handleGenerateReport} disabled={generating}>
            <FileText className="h-4 w-4" />
            {generating ? "Generating..." : "Generate report"}
          </Button>
        </Card>
      )}

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Timeline</h2>
        <Timeline items={timeline} />
      </div>

      {/* Impact analysis */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Impact analysis</h2>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Your service */}
          <Card className="p-6">
            <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
              Your service
            </div>
            <div className="text-sm text-[#9CA3AF] mt-3">Error rate</div>
            <div className="text-[28px] font-bold text-[#F9FAFB] mt-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
              0.4% <span className="text-[#6B7280]">→</span> 18.7%
            </div>
            <ImpactChart data={serviceSeries} stroke="#EF4444" fill="rgba(239,68,68,0.1)" formatter={(v) => `${v.toFixed(1)}%`} />
          </Card>

          {/* Vendor */}
          <Card className="p-6">
            <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
              {depName || "Stripe / EU"}
            </div>
            <div className="text-sm text-[#9CA3AF] mt-3">Latency</div>
            <div className="text-[28px] font-bold text-[#F9FAFB] mt-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
              {depLatency ?? 420}ms <span className="text-[#6B7280]">→</span>{" "}
              {((depLatency ?? 420) * 20 / 1000).toFixed(1)}s
            </div>
            <div className="text-sm text-[#9CA3AF] mt-2" style={{ fontFamily: "var(--font-geist-mono)" }}>
              Error rate: 0.3% → 17.1%
            </div>
            <ImpactChart data={vendorSeries} stroke="#F59E0B" fill="rgba(245,158,11,0.1)" formatter={(v) => `${Math.round(v)}ms`} />
          </Card>
        </div>
      </div>

      {/* Other dependencies */}
      <div className="mt-6">
        <h3 className="text-base font-medium text-[#9CA3AF]">Other dependencies during incident</h3>
        <div className="mt-2">
          {otherDeps.length === 0 ? (
            <p className="text-sm text-[#6B7280] py-4">No other dependencies monitored.</p>
          ) : (
            <div className="divide-y divide-[#1F2937] border-y border-[#1F2937]">
              {otherDeps.map((h) => (
                <div key={h.dependency_id} className="flex items-center gap-4" style={{ height: 44 }}>
                  <span className="text-sm text-[#F9FAFB] flex-1 truncate">{h.name}</span>
                  <StatusPill status={h.current_status} />
                  <span className="text-sm text-[#9CA3AF] text-right w-24" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    {h.avg_latency_ms_24h != null ? `${Math.round(h.avg_latency_ms_24h)}ms` : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Evidence reports */}
      {reportId && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#F9FAFB]">Evidence reports</h2>
          <Card className="mt-4 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 text-[#3B82F6] shrink-0" />
              <span className="text-sm text-[#3B82F6]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {reportRef(reportId)}
              </span>
              <span className="text-xs text-[#6B7280]">
                {new Date((report as { generated_at?: string })?.generated_at || incident.updated_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm shrink-0">
              <Link href={`/evidence/${reportId}`} className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> View
              </Link>
              <span className="text-[#374151]">·</span>
              <button onClick={handleDownload} className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
              <span className="text-[#374151]">·</span>
              <button onClick={handleShare} className="text-[#3B82F6] hover:underline inline-flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5" /> Share link
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
