"use client";

import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Incident } from "@/services/incidentService";

interface IncidentListProps {
  incidents: Incident[];
}

const statusMap: Record<string, "up" | "down" | "degraded"> = {
  open: "down",
  resolved: "up",
  false_positive: "up",
};

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
        <p className="text-[#A1A1AA]">No incidents found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-lg border border-[#E4E4E7] bg-white p-5 hover:border-[#D4D4D8] transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={statusMap[incident.status] || "degraded"} />
                <span className="text-xs text-[#A1A1AA] font-mono">{incident.id.slice(0, 12)}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#09090B] mb-1">
                {incident.description || `Incident ${incident.id.slice(0, 8)}`}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#52525B]">
                <span className="font-mono">{incident.dependency_id.slice(0, 12)}</span>
                <span className="flex items-center gap-1">
                  <span className="text-[#A1A1AA]">Root cause:</span>
                  <span className="text-[#09090B] font-medium capitalize">{incident.root_cause?.replace(/_/g, " ") || "Unknown"}</span>
                </span>
                {(() => {
                  const withCorr = incident as Incident & { correlations?: unknown[] };
                  return withCorr.correlations ? (
                    <span className="flex items-center gap-1">
                      <span className="text-[#A1A1AA]">Correlations:</span>
                      <span className="text-[#09090B] font-medium">{withCorr.correlations.length}</span>
                    </span>
                  ) : null;
                })()}
                <span>{formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Link
              href={`/incidents/${incident.id}`}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-[#52525B] border border-[#E4E4E7] hover:bg-[#F8F9FA] hover:text-[#09090B] transition-colors shrink-0"
            >
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
