"use client";

import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { Incident } from "@/services/incidentService";

interface IncidentListProps {
  incidents: Incident[];
}

const statusMap: Record<string, "up" | "down" | "degraded"> = {
  open: "down",
  investigating: "degraded",
  monitoring: "degraded",
  resolved: "up",
};

export function IncidentList({ incidents }: IncidentListProps) {
  if (incidents.length === 0) {
    return (
      <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-12 text-center">
        <p className="text-[#64748B]">No incidents found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-5 hover:border-[#3A3D4A] transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={statusMap[incident.status] || "degraded"} />
                <span className="text-xs text-[#64748B] font-mono">{incident.id}</span>
              </div>
              <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">{incident.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#94A3B8]">
                <span>{incident.dependency_name}</span>
                <span className="flex items-center gap-1">
                  <span className="text-[#64748B]">Correlations:</span>
                  <span className="text-[#F1F5F9] font-medium">{incident.correlation_count}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-[#64748B]">Confidence:</span>
                  <span className="text-[#F1F5F9] font-medium">{(incident.confidence_score * 100).toFixed(0)}%</span>
                </span>
                <span>{formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}</span>
              </div>
            </div>
            <Link
              href={`/incidents/${incident.id}`}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium text-[#94A3B8] border border-[#2A2D3A] hover:bg-[#2A2D3A] hover:text-[#F1F5F9] transition-colors shrink-0"
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
