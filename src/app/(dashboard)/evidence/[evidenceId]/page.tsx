"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  ExternalLink,
  Hash,
  Clock,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { evidenceService } from "@/services/evidenceService";
import { useEvidenceDetail, useRegenerateEvidence } from "@/hooks/useApi";
import { ConsoleCard, ConsoleCardBody, ConsoleCardHeader } from "@/components/dashboard/ConsoleLayout";
import { LockedFeature } from "@/components/dashboard/LockedFeature";
import { useBillingPlan } from "@/hooks/useApi";

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function safeDate(value: string | null | undefined, fmt = "MMM d, yyyy HH:mm:ss"): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : format(d, fmt);
}

function MetaRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const display = value ?? "—";
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
      <span className="text-xs text-[#52525B] shrink-0 pt-0.5">{label}</span>
      <span
        className={cn(
          "text-xs text-right text-[#FAFAFA] break-all",
          mono && "font-mono"
        )}
      >
        {display}
        {copyable && value && (
          <button
            className="ml-2 inline-flex align-middle text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              toast.success("Copied to clipboard");
              setTimeout(() => setCopied(false), 1500);
            }}
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
      </span>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function EvidenceDetailPage() {
  const params = useParams();
  const evidenceId = params.evidenceId as string;

  const { data: evidence, isLoading: loading, isError, refetch } = useEvidenceDetail(evidenceId);
  const regenerate = useRegenerateEvidence();
  const { data: billingPlan } = useBillingPlan();
  const [downloading, setDownloading] = useState(false);

  const currentPlan = billingPlan?.plan || "free";

  async function handleDownload() {
    if (!evidence) return;
    setDownloading(true);
    try {
      const url = evidence.download_url || (await evidenceService.getDownloadUrl(evidence.id));
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not download this report.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleRegenerate() {
    if (!evidence) return;
    try {
      await regenerate.mutateAsync(evidence.id);
      toast.success("Evidence report regenerated.");
    } catch {
      toast.error("Failed to regenerate the report.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-40 bg-[#1C1C22]" />
        <Skeleton className="h-8 w-72 bg-[#1C1C22]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="h-64 rounded-xl bg-[#1C1C22] lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl bg-[#1C1C22]" />
        </div>
      </div>
    );
  }

  if (isError || !evidence) {
    return (
      <div className="space-y-5">
        <Link
          href="/evidence"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Evidence
        </Link>
        <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-5 py-4 flex items-center gap-3">
          <p className="text-sm text-[#FAFAFA] flex-1">
            Unable to load this evidence report. It may have expired or been removed.
          </p>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium text-[#0891B2] hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isExpired = evidence.expires_at ? new Date(evidence.expires_at) < new Date() : false;

  return (
    <LockedFeature
      currentPlan={currentPlan as "free" | "starter" | "standard" | "professional" | "agency"}
      feature="evidence"
      onUpgrade={() => {}}
    >
      <div className="space-y-6">
        {/* Breadcrumb + header */}
        <div>
          <Link
            href="/evidence"
            className="inline-flex items-center gap-1.5 text-[13px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Evidence
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.12)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#FAFAFA] font-mono">
                  {evidence.id}
                </h1>
                <p className="text-[11px] text-[#52525B]">
                  Report generated {formatDistanceToNow(new Date(evidence.generated_at), { addSuffix: true })}
                  {isExpired && <span className="text-[#D97706]"> · expired</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerate.isPending}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#131318] text-xs font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", regenerate.isPending && "animate-spin")} />
                Regenerate
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FAFAFA] text-[#0A0A0F] text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                {downloading ? "Preparing…" : "Download"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Report metadata */}
          <ConsoleCard className="lg:col-span-2">
            <ConsoleCardHeader className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0891B2]" />
              <h2 className="text-sm font-semibold text-[#FAFAFA]">Report Metadata</h2>
            </ConsoleCardHeader>
            <ConsoleCardBody>
              <MetaRow label="Report ID" value={evidence.id} mono copyable />
              <MetaRow
                label="Incident"
                value={evidence.incident_id}
                mono
                copyable
              />
              <MetaRow label="Organization" value={evidence.org_id} mono />
              <MetaRow label="Generated at" value={safeDate(evidence.generated_at)} />
              <MetaRow
                label="Expires at"
                value={evidence.expires_at ? safeDate(evidence.expires_at) : "Never"}
              />
              <MetaRow label="Created" value={safeDate(evidence.created_at)} />
              <MetaRow label="Last updated" value={safeDate(evidence.updated_at)} />
            </ConsoleCardBody>
          </ConsoleCard>

          {/* Integrity + actions */}
          <div className="space-y-5">
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-[#16A34A]" />
                <h2 className="text-sm font-semibold text-[#FAFAFA]">Integrity</h2>
              </ConsoleCardHeader>
              <ConsoleCardBody className="space-y-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B] mb-1.5">
                    SHA-256 Checksum
                  </p>
                  <p className="text-[11px] font-mono text-[#A1A1AA] break-all leading-relaxed bg-[#0F0F14] rounded-lg px-3 py-2.5 border border-[rgba(255,255,255,0.05)]">
                    {evidence.checksum || "—"}
                  </p>
                  {evidence.checksum && (
                    <button
                      className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#0891B2] hover:underline"
                      onClick={() => {
                        navigator.clipboard.writeText(evidence.checksum);
                        toast.success("Checksum copied");
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      Copy checksum
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#52525B] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    File size
                  </span>
                  <span className="font-mono text-[#FAFAFA]">{formatBytes(evidence.file_size_bytes)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#52525B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Age
                  </span>
                  <span className="text-[#FAFAFA]">
                    {formatDistanceToNow(new Date(evidence.generated_at), { addSuffix: true })}
                  </span>
                </div>
              </ConsoleCardBody>
            </ConsoleCard>

            {/* Linked incident */}
            {evidence.incident_id && (
              <ConsoleCard>
                <ConsoleCardHeader>
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">Linked Incident</h2>
                </ConsoleCardHeader>
                <ConsoleCardBody>
                  <p className="text-xs text-[#52525B] mb-3">
                    This report captures the observation window and check snapshots for the incident below.
                  </p>
                  <Link
                    href={`/incidents/${evidence.incident_id}`}
                    className="inline-flex items-center gap-2 text-xs font-medium text-[#0891B2] hover:underline"
                  >
                    View incident INC-{evidence.incident_id.slice(0, 8)}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </ConsoleCardBody>
              </ConsoleCard>
            )}
          </div>
        </div>
      </div>
    </LockedFeature>
  );
}
