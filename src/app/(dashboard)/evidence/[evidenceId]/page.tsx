"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  Shield,
  Copy,
  Download,
  FileText,
  ExternalLink,
  Loader2,
  Eye,
  Lock,
  ChevronRight,
} from "lucide-react";
import { evidenceService, type EvidenceDetail } from "@/services/evidenceService";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsoleCard, ConsoleCardHeader } from "@/components/dashboard/ConsoleLayout";
import { toast } from "sonner";

const strengthConfig: Record<string, { label: string; color: string; bg: string }> = {
  strong: { label: "Strong", color: "text-[#16A34A]", bg: "bg-[rgba(22,163,74,0.12)]" },
  moderate: { label: "Moderate", color: "text-[#D97706]", bg: "bg-[rgba(217,119,6,0.12)]" },
  weak: { label: "Weak", color: "text-[#52525B]", bg: "bg-[rgba(255,255,255,0.05)]" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof ShieldCheck }> = {
  verified: { label: "Verified", color: "text-[#16A34A]", bg: "bg-[rgba(22,163,74,0.12)]", icon: ShieldCheck },
  pending: { label: "Pending", color: "text-[#D97706]", bg: "bg-[rgba(217,119,6,0.12)]", icon: Clock },
  failed: { label: "Failed", color: "text-[#DC2626]", bg: "bg-[rgba(220,38,38,0.12)]", icon: Shield },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function EvidenceDetailPage() {
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
  const [generatingReport, setGeneratingReport] = useState(false);

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
    setGeneratingReport(true);
    try {
      const result = await evidenceService.generateClientReport(evidenceId);
      toast.success("Client report generated.");
      if (result.report_url) {
        window.open(result.report_url, "_blank");
      }
    } catch {
      toast.error("Failed to generate client report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48 bg-[#1C1C22]" />
        <Skeleton className="h-[120px] rounded-xl bg-[#1C1C22]" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Skeleton className="h-[320px] rounded-xl bg-[#1C1C22]" />
          <Skeleton className="h-[320px] rounded-xl bg-[#1C1C22]" />
        </div>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">{error || "Evidence not found."}</p>
        <button
          onClick={() => router.push("/evidence")}
          className="mt-4 text-xs text-[#0891B2] hover:underline"
        >
          Back to Evidence
        </button>
      </div>
    );
  }

  const strength = strengthConfig[evidence.evidence_strength] || strengthConfig.moderate;
  const status = statusConfig[evidence.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const failureRate =
    evidence.observation_window.total_checks > 0
      ? (evidence.observation_window.failed_checks / evidence.observation_window.total_checks) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/evidence")}
        className="flex items-center gap-2 text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Evidence
      </button>

      {/* Header Card */}
      <ConsoleCard>
        <div className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#52525B]">
              Evidence Snapshot
            </span>
            <span className="text-[13px] font-mono text-[#A1A1AA] ml-1">
              {evidence.id}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
                status.bg,
                status.color
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium",
                strength.bg,
                strength.color
              )}
            >
              <Shield className="w-3 h-3" />
              {strength.label}
            </span>

            <button
              onClick={handleVerify}
              disabled={verifying || evidence.status === "verified"}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-[11px] font-medium px-3.5 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <ShieldCheck className="h-3 w-3" />
              )}
              {evidence.status === "verified" ? "Verified" : "Verify"}
            </button>
          </div>
        </div>
      </ConsoleCard>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Left: Details */}
        <div className="space-y-5">
          {/* Incident Link */}
          <ConsoleCard>
            <ConsoleCardHeader>
              <span className="text-[13px] font-semibold text-[#FAFAFA]">
                Details
              </span>
            </ConsoleCardHeader>
            <div className="p-5 space-y-4">
              {/* Incident */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A1A1AA]">Incident</span>
                {evidence.incident_id ? (
                  <Link
                    href={`/incidents/${evidence.incident_id}`}
                    className="text-[13px] font-mono text-[#0891B2] hover:underline flex items-center gap-1"
                  >
                    INC-{evidence.incident_id.slice(0, 12)}
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <span className="text-[13px] text-[#52525B]">--</span>
                )}
              </div>

              {/* Observation Window */}
              <div className="h-px bg-[rgba(255,255,255,0.05)]" />
              <div>
                <span className="text-xs text-[#A1A1AA] block mb-3">
                  Observation Window
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                      Start
                    </span>
                    <span className="text-[12px] font-mono text-[#FAFAFA]">
                      {format(new Date(evidence.observation_window.start), "MMM d, HH:mm:ss")}
                    </span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                      End
                    </span>
                    <span className="text-[12px] font-mono text-[#FAFAFA]">
                      {format(new Date(evidence.observation_window.end), "MMM d, HH:mm:ss")}
                    </span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                      Duration
                    </span>
                    <span className="text-[12px] font-mono font-medium text-[#FAFAFA]">
                      {formatDuration(evidence.observation_window.duration_seconds)}
                    </span>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                    <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                      Failure Rate
                    </span>
                    <span
                      className={cn(
                        "text-[12px] font-mono font-medium",
                        failureRate > 50 ? "text-[#DC2626]" : failureRate > 20 ? "text-[#D97706]" : "text-[#16A34A]"
                      )}
                    >
                      {failureRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-[11px] text-[#A1A1AA]">
                  <span>
                    <span className="text-[#FAFAFA] font-mono">
                      {evidence.observation_window.total_checks}
                    </span>{" "}
                    total checks
                  </span>
                  <span>
                    <span
                      className={cn(
                        "font-mono",
                        evidence.observation_window.failed_checks > 0
                          ? "text-[#DC2626]"
                          : "text-[#16A34A]"
                      )}
                    >
                      {evidence.observation_window.failed_checks}
                    </span>{" "}
                    failed
                  </span>
                </div>
              </div>

              {/* Strength */}
              <div className="h-px bg-[rgba(255,255,255,0.05)]" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A1A1AA]">Evidence Strength</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium",
                    strength.bg,
                    strength.color
                  )}
                >
                  {strength.label}
                </span>
              </div>

              {/* Data Hash */}
              <div className="h-px bg-[rgba(255,255,255,0.05)]" />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#A1A1AA]">Data Integrity Hash</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-[11px] text-[#0891B2] hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <p className="text-[11px] font-mono text-[#52525B] break-all leading-relaxed bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                  {evidence.data_hash}
                </p>
              </div>
            </div>
          </ConsoleCard>
        </div>

        {/* Right: Actions */}
        <div className="space-y-5">
          <ConsoleCard>
            <ConsoleCardHeader>
              <span className="text-[13px] font-semibold text-[#FAFAFA]">
                Actions
              </span>
            </ConsoleCardHeader>
            <div className="p-5 space-y-3">
              <button
                onClick={handleViewJson}
                disabled={jsonLoading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-colors text-left disabled:opacity-50"
              >
                {jsonLoading ? (
                  <Loader2 className="w-4 h-4 text-[#A1A1AA] animate-spin" />
                ) : (
                  <Eye className="w-4 h-4 text-[#A1A1AA]" />
                )}
                <div>
                  <span className="text-[13px] font-medium text-[#FAFAFA] block">
                    {jsonView ? "Hide JSON" : "View JSON"}
                  </span>
                  <span className="text-[11px] text-[#52525B]">
                    Raw evidence data
                  </span>
                </div>
              </button>

              <button
                onClick={handleDownloadPdf}
                disabled={downloading}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)] transition-colors text-left disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 text-[#A1A1AA] animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-[#A1A1AA]" />
                )}
                <div>
                  <span className="text-[13px] font-medium text-[#FAFAFA] block">
                    Download PDF
                  </span>
                  <span className="text-[11px] text-[#52525B]">
                    Formatted evidence report
                  </span>
                </div>
              </button>

              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[rgba(8,145,178,0.08)] border border-[rgba(8,145,178,0.2)] hover:bg-[rgba(8,145,178,0.12)] hover:border-[rgba(8,145,178,0.3)] transition-colors text-left disabled:opacity-50"
              >
                {generatingReport ? (
                  <Loader2 className="w-4 h-4 text-[#0891B2] animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 text-[#0891B2]" />
                )}
                <div>
                  <span className="text-[13px] font-medium text-[#FAFAFA] block">
                    Generate Report
                  </span>
                  <span className="text-[11px] text-[#0891B2]/70">
                    Client-facing evidence report
                  </span>
                </div>
              </button>
            </div>
          </ConsoleCard>

          {/* Timestamps */}
          <ConsoleCard>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#A1A1AA]">Created</span>
                <span className="text-[12px] font-mono text-[#FAFAFA]">
                  {formatDistanceToNow(new Date(evidence.created_at), { addSuffix: true })}
                </span>
              </div>
              {evidence.verified_at && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#A1A1AA]">Verified</span>
                  <span className="text-[12px] font-mono text-[#16A34A]">
                    {formatDistanceToNow(new Date(evidence.verified_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </ConsoleCard>
        </div>
      </div>

      {/* JSON Viewer */}
      {jsonView && jsonData && (
        <ConsoleCard>
          <ConsoleCardHeader className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#52525B] uppercase tracking-wider">
              Raw JSON
            </span>
            <button
              onClick={() => setJsonView(false)}
              className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA]"
            >
              Close
            </button>
          </ConsoleCardHeader>
          <pre className="px-5 pb-5 overflow-x-auto text-xs font-mono text-[#A1A1AA] leading-relaxed max-h-[400px] overflow-y-auto">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </ConsoleCard>
      )}

      {/* Evidence Preview Card */}
      <ConsoleCard>
        <ConsoleCardHeader>
          <span className="text-[13px] font-semibold text-[#FAFAFA]">
            Evidence Preview
          </span>
        </ConsoleCardHeader>
        <div className="p-5">
          {/* Snapshot */}
          <div className="mb-5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#52525B] block mb-3">
              Snapshot
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                  Status Code
                </span>
                <span
                  className={cn(
                    "text-lg font-mono font-semibold",
                    evidence.snapshot.status_code >= 200 &&
                      evidence.snapshot.status_code < 400
                      ? "text-[#16A34A]"
                      : "text-[#DC2626]"
                  )}
                >
                  {evidence.snapshot.status_code}
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                  Response Time
                </span>
                <span className="text-lg font-mono font-semibold text-[#FAFAFA]">
                  {evidence.snapshot.response_time_ms}
                  <span className="text-xs text-[#A1A1AA] ml-1">ms</span>
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                  Checks
                </span>
                <span className="text-lg font-mono font-semibold text-[#FAFAFA]">
                  {evidence.observation_window.total_checks}
                </span>
              </div>
              <div className="bg-[rgba(255,255,255,0.03)] rounded-lg p-3">
                <span className="text-[10px] uppercase tracking-wider text-[#52525B] block mb-1">
                  Failed
                </span>
                <span
                  className={cn(
                    "text-lg font-mono font-semibold",
                    evidence.observation_window.failed_checks > 0
                      ? "text-[#DC2626]"
                      : "text-[#16A34A]"
                  )}
                >
                  {evidence.observation_window.failed_checks}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {evidence.snapshot.error_message && (
            <div className="mb-5 rounded-lg bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] p-3">
              <span className="text-[10px] text-[#DC2626] uppercase tracking-wider block mb-1">
                Error
              </span>
              <p className="text-[12px] font-mono text-[#DC2626]">
                {evidence.snapshot.error_message}
              </p>
            </div>
          )}

          {/* Body Preview */}
          {evidence.snapshot.body_preview && (
            <div className="mb-5">
              <span className="text-[10px] text-[#52525B] uppercase tracking-wider block mb-2">
                Body Preview
              </span>
              <pre className="text-[11px] font-mono text-[#A1A1AA] overflow-x-auto max-h-[150px] overflow-y-auto whitespace-pre-wrap bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(255,255,255,0.05)]">
                {evidence.snapshot.body_preview.slice(0, 500)}
                {evidence.snapshot.body_preview.length > 500 ? "..." : ""}
              </pre>
            </div>
          )}

          {/* Contributors */}
          {evidence.contributors && evidence.contributors.length > 0 && (
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#52525B] block mb-3">
                Likely Contributors ({evidence.contributors.length})
              </span>
              <div className="space-y-2">
                {evidence.contributors.map((c) => {
                  const cStrength = strengthConfig[c.evidence_strength] || strengthConfig.moderate;
                  return (
                    <div
                      key={c.dependency_id}
                      className="flex items-center justify-between bg-[rgba(255,255,255,0.03)] rounded-lg p-3 border border-[rgba(255,255,255,0.05)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.role === "primary" ? "#DC2626" : c.role === "contributing" ? "#D97706" : "#52525B" }} />
                        <div className="min-w-0">
                          <span className="text-[13px] font-medium text-[#FAFAFA] block truncate">
                            {c.dependency_name}
                          </span>
                          <span className="text-[11px] text-[#52525B] capitalize">
                            {c.role} · {c.confidence}% confidence
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px] font-medium shrink-0",
                          cStrength.bg,
                          cStrength.color
                        )}
                      >
                        {cStrength.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Assessment */}
          {evidence.ai_assessment && (
            <div className="mt-5 pt-5 border-t border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#52525B]">
                  AI Assessment
                </span>
                <span className="text-[10px] rounded bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 text-[#52525B]">
                  Evidence-first
                </span>
              </div>
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                {evidence.ai_assessment}
              </p>
              <p className="text-[10px] text-[#52525B] mt-2">
                This assessment is AI-assisted and based on evidence data. Always verify with raw evidence before making decisions.
              </p>
            </div>
          )}
        </div>
      </ConsoleCard>
    </div>
  );
}

