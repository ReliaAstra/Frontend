"use client";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { type EvidenceDetail } from "@/services/evidenceService";
import { evidenceService } from "@/services/evidenceService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ShieldCheck, Download, Eye, Lock, ChevronRight } from "lucide-react";
import { ConsoleCard, ConsoleCardHeader } from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { LockedFeature } from "@/components/dashboard/LockedFeature";
import { getPlanConfig } from "@/lib/tierLimits";
import { useEvidence, useBillingPlan } from "@/hooks/useApi";

const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
  verified: {
    label: "Verified",
    color: "text-[#16A34A]",
    bg: "bg-[rgba(22,163,74,0.12)]",
  },
  pending: {
    label: "Pending",
    color: "text-[#D97706]",
    bg: "bg-[rgba(217,119,6,0.12)]",
  },
  failed: {
    label: "Failed",
    color: "text-[#DC2626]",
    bg: "bg-[rgba(220,38,38,0.12)]",
  },
};

const strengthStyles: Record<string, { label: string; color: string; bg: string }> = {
  strong: {
    label: "Strong",
    color: "text-[#16A34A]",
    bg: "bg-[rgba(22,163,74,0.12)]",
  },
  moderate: {
    label: "Moderate",
    color: "text-[#D97706]",
    bg: "bg-[rgba(217,119,6,0.12)]",
  },
  weak: {
    label: "Weak",
    color: "text-[#52525B]",
    bg: "bg-[rgba(255,255,255,0.05)]",
  },
};

export default function EvidencePage() {
  const { isLoading: authLoading, currentOrg } = useAuth();

  const { data: evidence = [], isLoading: loading, isError: error } = useEvidence();
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

  const planConfig = getPlanConfig(currentPlan as "free" | "starter" | "standard" | "professional" | "agency");
  const isFreePlan = currentPlan === "free";

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
        <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-4 py-3">
          <p className="text-sm text-[#DC2626]">Unable to load evidence records.</p>
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
            <ConsoleCardHeader className="grid grid-cols-[1fr_1fr_100px_100px_120px_80px] gap-4 items-center">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                ID
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Incident
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Status
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Strength
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                Created
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B] text-right">
                Actions
              </span>
            </ConsoleCardHeader>
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {evidence.map((ev, idx) => {
                const status = statusStyles[ev.status] || statusStyles.pending;
                const strength = strengthStyles[ev.evidence_strength] || strengthStyles.moderate;

                return (
                  <div
                    key={ev.id}
                    className="px-5 py-3.5 grid grid-cols-[1fr_1fr_100px_100px_120px_80px] gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    {/* ID */}
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

                    {/* Status */}
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[11px] font-medium w-fit",
                        status.bg,
                        status.color
                      )}
                    >
                      {ev.status === "verified" && <ShieldCheck className="w-3 h-3" />}
                      {status.label}
                    </span>

                    {/* Strength */}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium w-fit",
                        strength.bg,
                        strength.color
                      )}
                    >
                      {strength.label}
                    </span>

                    {/* Created */}
                    <span className="text-[12px] text-[#A1A1AA]">
                      {formatDistanceToNow(new Date(ev.created_at), {
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
                        onClick={async () => {
                          try {
                            const blob = await evidenceService.downloadPdf(ev.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `evidence-${ev.id.slice(0, 8)}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                          } catch {
                            // silent fail
                          }
                        }}
                        className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
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
