"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { evidenceService } from "@/services/evidenceService";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Download, Eye } from "lucide-react";
import { ConsoleCard, ConsoleCardHeader } from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LockedFeature } from "@/components/dashboard/LockedFeature";
import { useEvidence, useBillingPlan } from "@/hooks/useApi";
import { toast } from "sonner";

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EvidencePage() {
  const { isLoading: authLoading } = useAuth();

  const { data: evidence = [], isLoading: loading, isError: error, refetch } = useEvidence();
  const { data: billingPlan } = useBillingPlan();

  const currentPlan = billingPlan?.plan || "free";

  if (authLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48 bg-[#1C1C22]" />
        <Skeleton className="h-[200px] rounded-xl bg-[#1C1C22]" />
      </div>
    );
  }

  const handleDownload = async (reportId: string) => {
    try {
      const url = await evidenceService.getDownloadUrl(reportId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not get a download link for this report.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">
          Evidence
        </h1>
        <p className="text-[12px] text-[#A1A1AA] mt-1">
          Tamper-proof SLA evidence reports for vendor incidents
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-4 py-3 flex items-center gap-3">
          <p className="text-sm text-[#DC2626] flex-1">Unable to load evidence records.</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium text-[#0891B2] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      <LockedFeature
        currentPlan={currentPlan as "free" | "starter" | "standard" | "professional" | "agency"}
        feature="evidence"
        onUpgrade={() => {}}
      >
        {loading ? (
          <ConsoleCard>
            <ConsoleCardHeader>
              <span className="text-[13px] font-semibold text-[#FAFAFA]">
                Recent Evidence
              </span>
            </ConsoleCardHeader>
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[52px] bg-[#1C1C22] rounded-lg" />
              ))}
            </div>
          </ConsoleCard>
        ) : evidence.length > 0 ? (
          <ConsoleCard>
            <ConsoleCardHeader className="grid grid-cols-[110px_1fr_110px_1fr_130px_90px] gap-4 items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Report
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Incident
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Size
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Checksum
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Generated
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] text-right">
                Actions
              </span>
            </ConsoleCardHeader>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="px-5 py-3.5 grid grid-cols-[110px_1fr_110px_1fr_130px_90px] gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  {/* Report ID */}
                  <Link
                    href={`/evidence/${ev.id}`}
                    className="text-[13px] font-mono font-medium text-[#FAFAFA] hover:text-[#0891B2] transition-colors truncate"
                  >
                    {ev.id.slice(0, 8)}
                  </Link>

                  {/* Incident */}
                  {ev.incident_id ? (
                    <Link
                      href={`/incidents/${ev.incident_id}`}
                      className="text-[13px] font-mono text-[#A1A1AA] hover:text-[#0891B2] transition-colors truncate"
                    >
                      INC-{ev.incident_id.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="text-[13px] text-[#52525B]">--</span>
                  )}

                  {/* Size */}
                  <span className="text-[12px] font-mono text-[#A1A1AA]">
                    {formatBytes(ev.file_size_bytes)}
                  </span>

                  {/* Checksum */}
                  <span
                    className="text-[12px] font-mono text-[#52525B] truncate"
                    title={ev.checksum}
                  >
                    {ev.checksum ? `${ev.checksum.slice(0, 12)}…` : "—"}
                  </span>

                  {/* Generated */}
                  <span className="text-[12px] text-[#A1A1AA]">
                    {formatDistanceToNow(new Date(ev.generated_at || ev.created_at), {
                      addSuffix: true,
                    })}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/evidence/${ev.id}`}
                      className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      title="View"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDownload(ev.id)}
                      className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                      title="Download report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ConsoleCard>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="No evidence generated yet"
            description="Evidence reports are automatically generated when incidents are detected and correlated with your monitored dependencies."
            actionLabel="View Incidents"
            actionHref="/incidents"
          />
        )}
      </LockedFeature>
    </div>
  );
}
