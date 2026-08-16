"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, FileSearch, Download, CheckCircle, Clock, Shield, Copy, ExternalLink, Loader2 } from "lucide-react";
import { evidenceService, type EvidenceDetail } from "@/services/evidenceService";
import { Skeleton } from "@/components/ui/skeleton";
import { ContributorCard } from "@/components/dashboard/ContributorCard";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const strengthConfig: Record<string, { label: string; color: string; bg: string }> = {
  strong: { label: "Strong", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  moderate: { label: "Moderate", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  weak: { label: "Weak", color: "text-[#52525B]", bg: "bg-[#F8F9FA] border-[#E4E4E7]" },
};

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string }> = {
  verified: { label: "Verified", icon: CheckCircle, color: "text-emerald-600" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-600" },
  failed: { label: "Failed", icon: Shield, color: "text-red-600" },
};

export default function EvidencePage() {
  const params = useParams();
  const router = useRouter();
  const evidenceId = params.evidenceId as string;
  const [evidence, setEvidence] = useState<EvidenceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [jsonView, setJsonView] = useState(false);
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [jsonLoading, setJsonLoading] = useState(false);

  const fetchEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ev = await evidenceService.getById(evidenceId);
      setEvidence(ev);
    } catch {
      setError("Unable to load evidence.");
    } finally {
      setLoading(false);
    }
  }, [evidenceId]);

  useEffect(() => {
    fetchEvidence();
  }, [fetchEvidence]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const result = await evidenceService.verify(evidenceId);
      if (evidence) {
        setEvidence({ ...evidence, status: "verified", verified_at: result.verified_at });
      }
      toast.success("Evidence verified successfully.");
    } catch {
      toast.error("Verification failed. Try again later.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await evidenceService.downloadPdf(evidenceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `evidence-${evidenceId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded.");
    } catch {
      toast.error("Failed to download PDF.");
    } finally {
      setDownloading(false);
    }
  };

  const handleViewJson = async () => {
    if (jsonView && jsonData) {
      setJsonView(false);
      return;
    }
    setJsonLoading(true);
    try {
      const data = await evidenceService.getJson(evidenceId);
      setJsonData(data);
      setJsonView(true);
    } catch {
      toast.error("Failed to load JSON data.");
    } finally {
      setJsonLoading(false);
    }
  };

  const handleCopyHash = () => {
    if (evidence?.data_hash) {
      navigator.clipboard.writeText(evidence.data_hash);
      toast.success("Hash copied to clipboard.");
    }
  };

  const handleGenerateReport = async () => {
    try {
      const result = await evidenceService.generateClientReport(evidenceId);
      toast.success("Client report generated.");
      if (result.report_url) {
        window.open(result.report_url, "_blank");
      }
    } catch {
      toast.error("Failed to generate client report.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-[200px] rounded-lg bg-white" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-[300px] rounded-lg bg-white" />
          <Skeleton className="h-[300px] rounded-lg bg-white" />
        </div>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">{error || "Evidence not found."}</p>
        <button onClick={() => router.push("/incidents")} className="mt-4 text-xs text-[#0891B2] hover:underline">
          Back to Incidents
        </button>
      </div>
    );
  }

  const strength = strengthConfig[evidence.evidence_strength] || strengthConfig.moderate;
  const status = statusConfig[evidence.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <button
        onClick={() => evidence.incident_id ? router.push(`/incidents/${evidence.incident_id}`) : router.push("/incidents")}
        className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {evidence.incident_id ? "Back to Incident" : "Back to Incidents"}
      </button>

      {/* Header Card */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium", strength.bg, strength.color)}>
            <Shield className="h-3 w-3" />
            {strength.label} Evidence
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", status.color)}>
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </span>
          <span className="text-[11px] text-[#A1A1AA] font-mono ml-auto">{evidence.id}</span>
        </div>

        <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight mb-1">
          Evidence Report
        </h1>
        <p className="text-[12px] text-[#A1A1AA]">
          {evidence.incident_id ? `Incident ${evidence.incident_id.slice(0, 12)}` : "Standalone evidence"}
          {" · "}
          Created {format(new Date(evidence.created_at), "MMM d, yyyy HH:mm")}
          {evidence.verified_at && (
            <> · Verified {format(new Date(evidence.verified_at), "MMM d, HH:mm")}</>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            onClick={handleVerify}
            disabled={verifying || evidence.status === "verified"}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {evidence.status === "verified" ? "Verified" : "Verify"}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white text-[#52525B] text-xs font-medium px-3.5 py-2 hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Download PDF
          </button>
          <button
            onClick={handleViewJson}
            disabled={jsonLoading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white text-[#52525B] text-xs font-medium px-3.5 py-2 hover:bg-[#F8F9FA] transition-colors disabled:opacity-50"
          >
            {jsonLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSearch className="h-3.5 w-3.5" />}
            {jsonView ? "Hide JSON" : "View JSON"}
          </button>
          <button
            onClick={handleCopyHash}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E4E4E7] bg-white text-[#52525B] text-xs font-medium px-3.5 py-2 hover:bg-[#F8F9FA] transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Hash
          </button>
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#0891B2]/30 bg-[#0891B2]/5 text-[#0891B2] text-xs font-medium px-3.5 py-2 hover:bg-[#0891B2]/10 transition-colors ml-auto"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Generate Client Report
          </button>
        </div>
      </div>

      {/* JSON Viewer */}
      {jsonView && jsonData && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="px-5 py-2.5 border-b border-[#E4E4E7] bg-[#FAFAFA] flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wider">Raw JSON</span>
            <button onClick={() => setJsonView(false)} className="text-[11px] text-[#52525B] hover:text-[#09090B]">
              Close
            </button>
          </div>
          <pre className="p-5 overflow-x-auto text-xs font-mono text-[#52525B] leading-relaxed max-h-[300px] overflow-y-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}

      {/* Main Grid: Snapshot + Observation Window */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Snapshot */}
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
            Snapshot
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Status Code</span>
              <span className={cn(
                "text-sm font-mono font-medium",
                evidence.snapshot.status_code >= 200 && evidence.snapshot.status_code < 400 ? "text-emerald-600" : "text-red-600"
              )}>
                {evidence.snapshot.status_code}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Response Time</span>
              <span className="text-sm font-mono font-medium text-[#09090B]">
                {evidence.snapshot.response_time_ms}ms
              </span>
            </div>
            {evidence.snapshot.error_message && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-[10px] text-red-500 uppercase tracking-wider mb-1">Error</p>
                <p className="text-xs text-red-700 font-mono">{evidence.snapshot.error_message}</p>
              </div>
            )}
            {evidence.snapshot.body_preview && (
              <div className="rounded-md bg-[#F8F9FA] border border-[#E4E4E7] p-3">
                <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">Body Preview</p>
                <pre className="text-xs font-mono text-[#52525B] overflow-x-auto max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                  {evidence.snapshot.body_preview.slice(0, 500)}
                  {evidence.snapshot.body_preview.length > 500 ? "..." : ""}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Observation Window */}
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA] mb-4">
            Observation Window
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Start</span>
              <span className="text-xs font-mono text-[#09090B]">
                {format(new Date(evidence.observation_window.start), "MMM d, HH:mm:ss")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">End</span>
              <span className="text-xs font-mono text-[#09090B]">
                {format(new Date(evidence.observation_window.end), "MMM d, HH:mm:ss")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Duration</span>
              <span className="text-sm font-mono font-medium text-[#09090B]">
                {formatDuration(evidence.observation_window.duration_seconds)}
              </span>
            </div>
            <div className="h-px bg-[#E4E4E7]" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Total Checks</span>
              <span className="text-sm font-mono font-medium text-[#09090B]">
                {evidence.observation_window.total_checks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Failed Checks</span>
              <span className={cn(
                "text-sm font-mono font-medium",
                evidence.observation_window.failed_checks > 0 ? "text-red-600" : "text-emerald-600"
              )}>
                {evidence.observation_window.failed_checks}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A1A1AA]">Failure Rate</span>
              <span className={cn(
                "text-sm font-mono font-medium",
                evidence.observation_window.total_checks > 0
                  ? (evidence.observation_window.failed_checks / evidence.observation_window.total_checks) > 0.5 ? "text-red-600" : "text-amber-600"
                  : "text-[#09090B]"
              )}>
                {evidence.observation_window.total_checks > 0
                  ? `${((evidence.observation_window.failed_checks / evidence.observation_window.total_checks) * 100).toFixed(1)}%`
                  : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Hash */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">Data Integrity Hash</h3>
          <button onClick={handleCopyHash} className="text-[11px] text-[#0891B2] hover:underline flex items-center gap-1">
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
        <p className="text-xs font-mono text-[#52525B] break-all leading-relaxed">
          {evidence.data_hash}
        </p>
      </div>

      {/* Contributors */}
      {evidence.contributors && evidence.contributors.length > 0 && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">
              Likely Contributors
            </h3>
            <span className="text-[11px] text-[#A1A1AA]">{evidence.contributors.length} identified</span>
          </div>
          <div className="space-y-3">
            {evidence.contributors.map((c) => (
              <ContributorCard key={c.dependency_id} contributor={c} />
            ))}
          </div>
        </div>
      )}

      {/* AI Assessment */}
      {evidence.ai_assessment && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#A1A1AA]">AI Assessment</h3>
            <span className="text-[10px] rounded bg-[#F8F9FA] px-1.5 py-0.5 text-[#52525B]">Evidence-first</span>
          </div>
          <p className="text-sm text-[#52525B] leading-relaxed">{evidence.ai_assessment}</p>
          <p className="text-[10px] text-[#A1A1AA] mt-3">
            This assessment is AI-assisted and based on evidence data. Always verify with raw evidence before making decisions.
          </p>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
