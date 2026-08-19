"use client";

import { cn } from "@/lib/utils";

/**
 * Contributor shape for rendering. Mirrors the incident-correlation model on
 * the live API (previously sourced from the evidence service).
 */
export interface EvidenceContributor {
  dependency_id: string;
  dependency_name: string;
  role: "primary" | "contributing" | "correlated";
  evidence_strength: "strong" | "moderate" | "weak";
  confidence: number;
  observation_window: {
    start: string;
    end: string;
    duration_seconds: number;
    total_checks: number;
    failed_checks: number;
  };
}

interface ContributorCardProps {
  contributor: EvidenceContributor;
}

const roleConfig: Record<string, { label: string; className: string }> = {
  primary: { label: "Primary Cause", className: "bg-red-50 text-red-700 border-red-200" },
  contributing: { label: "Contributing", className: "bg-amber-50 text-amber-700 border-amber-200" },
  correlated: { label: "Correlated", className: "bg-[#F8F9FA] text-[#52525B] border-[#E4E4E7]" },
};

const strengthConfig: Record<string, { label: string; bar: string; bg: string }> = {
  strong: { label: "Strong", bar: "bg-emerald-500", bg: "bg-emerald-100" },
  moderate: { label: "Moderate", bar: "bg-amber-500", bg: "bg-amber-100" },
  weak: { label: "Weak", bar: "bg-[#71717A]", bg: "bg-[#E4E4E7]" },
};

export function ContributorCard({ contributor }: ContributorCardProps) {
  const role = roleConfig[contributor.role] || roleConfig.correlated;
  const strength = strengthConfig[contributor.evidence_strength] || strengthConfig.weak;
  const confidencePct = Math.round(contributor.confidence * 100);

  return (
    <div className="rounded-lg border border-[#E4E4E7] bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            contributor.role === "primary" ? "bg-red-500" :
            contributor.role === "contributing" ? "bg-amber-500" : "bg-[#71717A]"
          )} />
          <p className="text-[13px] font-medium text-[#09090B]">{contributor.dependency_name}</p>
        </div>
        <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium", role.className)}>
          {role.label}
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Confidence</span>
          <span className="text-[11px] font-mono font-medium text-[#09090B]">{confidencePct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", strength.bar)}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Evidence Strength */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Evidence:</span>
        <span className={cn(
          "text-[11px] font-medium",
          contributor.evidence_strength === "strong" ? "text-emerald-600" :
          contributor.evidence_strength === "moderate" ? "text-amber-600" : "text-[#52525B]"
        )}>
          {strength.label}
        </span>
      </div>

      {/* Observation Window */}
      {contributor.observation_window && (
        <div className="rounded-md bg-[#F8F9FA] border border-[#E4E4E7] px-3 py-2">
          <p className="text-[10px] text-[#A1A1AA] uppercase tracking-wider mb-1">Observation Window</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-[#52525B]">
            <span>{formatDuration(contributor.observation_window.duration_seconds)}</span>
            <span className="text-[#D4D4D8]">·</span>
            <span>{contributor.observation_window.total_checks} checks</span>
            <span className="text-[#D4D4D8]">·</span>
            <span className={contributor.observation_window.failed_checks > 0 ? "text-red-600" : "text-emerald-600"}>
              {contributor.observation_window.failed_checks} failed
            </span>
          </div>
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
