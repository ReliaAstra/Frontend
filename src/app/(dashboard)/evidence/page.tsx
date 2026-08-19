"use client";

import * as React from "react";
import Link from "next/link";
import { FileX, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { useEvidence, useBillingPlan } from "@/hooks/useApi";
import { evidenceService } from "@/services/evidenceService";
import { canAccessFeature } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/rs/ui";
import { reportRef, incidentRef } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || Number.isNaN(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function EvidencePage() {
  const { data: evidence = [], isLoading, isError, refetch } = useEvidence();
  const { data: billingPlan } = useBillingPlan();

  const plan = (billingPlan?.plan || "free") as Plan;
  const allowed = canAccessFeature(plan, "evidence").allowed;

  const handleDownload = async (reportId: string) => {
    try {
      const url = await evidenceService.getDownloadUrl(reportId);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not get a download link for this report.");
    }
  };

  return (
    <div>
      <PageHeader title="Evidence" subtitle="Tamper-proof SLA evidence reports for vendor incidents." />

      {isError && (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">
            Unable to load evidence records.{" "}
            <button onClick={() => refetch()} className="text-[#3B82F6] hover:underline">
              Retry
            </button>
          </p>
        </Card>
      )}

      {!allowed && !isLoading && (
        <Card>
          <EmptyState
            icon={FileX}
            title="Evidence reports require a Standard plan"
            body="Upgrade your plan to generate and share SLA evidence reports."
            actionLabel="View plans"
            actionHref="/settings/billing"
          />
        </Card>
      )}

      {allowed && isLoading && (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      )}

      {allowed && !isLoading && !isError && evidence.length === 0 && (
        <Card>
          <EmptyState
            icon={FileX}
            title="No reports generated"
            body="Generate a report from an incident page."
            actionLabel="View incidents"
            actionHref="/incidents"
          />
        </Card>
      )}

      {allowed && !isLoading && !isError && evidence.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hidden md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
                  <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 160, letterSpacing: "0.05em" }}>
                    Report
                  </th>
                  <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 160, letterSpacing: "0.05em" }}>
                    Incident
                  </th>
                  <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
                    Size
                  </th>
                  <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                    Generated
                  </th>
                  <th className="text-right pr-4" style={{ width: 110 }} />
                </tr>
              </thead>
              <tbody>
                {evidence.map((ev, i) => (
                  <tr
                    key={ev.id}
                    className={cn("hover:bg-[#1F2937] transition-colors", i < evidence.length - 1 && "border-b border-[#1F2937]")}
                    style={{ height: 52 }}
                  >
                    <td className="px-4">
                      <Link href={`/evidence/${ev.id}`} className="text-sm text-[#3B82F6] hover:underline" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {reportRef(ev.id)}
                      </Link>
                    </td>
                    <td>
                      {ev.incident_id ? (
                        <Link href={`/incidents/${ev.incident_id}`} className="text-sm text-[#9CA3AF] hover:text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                          {incidentRef(ev.incident_id)}
                        </Link>
                      ) : (
                        <span className="text-sm text-[#6B7280]">—</span>
                      )}
                    </td>
                    <td className="text-right text-xs text-[#9CA3AF]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {formatBytes(ev.file_size_bytes)}
                    </td>
                    <td className="px-4 text-xs text-[#6B7280]">
                      {new Date(ev.generated_at || ev.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/evidence/${ev.id}`} className="p-1.5 rounded-md text-[#374151] hover:text-[#9CA3AF] transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDownload(ev.id)}
                          className="p-1.5 rounded-md text-[#374151] hover:text-[#9CA3AF] transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {evidence.map((ev) => (
              <div key={ev.id} className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/evidence/${ev.id}`} className="text-sm text-[#3B82F6] hover:underline" style={{ fontFamily: "var(--font-geist-mono)" }}>
                    {reportRef(ev.id)}
                  </Link>
                  <span className="text-xs text-[#6B7280]">{formatBytes(ev.file_size_bytes)}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-[#6B7280]">
                    {new Date(ev.generated_at || ev.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-1">
                    <Link href={`/evidence/${ev.id}`} className="p-1.5 rounded-md text-[#374151] hover:text-[#9CA3AF]">
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDownload(ev.id)} className="p-1.5 rounded-md text-[#374151] hover:text-[#9CA3AF]">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
