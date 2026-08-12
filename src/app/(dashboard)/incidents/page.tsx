"use client";

import { useEffect, useState } from "react";
import { IncidentList } from "@/components/dashboard/IncidentList";
import { incidentService, type Incident } from "@/services/incidentService";
import { Skeleton } from "@/components/ui/skeleton";

const statusFilters = ["all", "open", "investigating", "resolved"] as const;
const statusLabels: Record<string, string> = { all: "All", open: "Open", investigating: "Investigating", resolved: "Resolved" };

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    incidentService.list(statusFilter).then((data) => {
      setIncidents(data);
      setLoading(false);
    });
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Incidents</h1>
        <p className="text-sm text-gray-400 mt-1">Track and manage dependency incidents</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1 w-fit">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-md px-4 py-2 text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-gray-100 text-gray-900"
                : "text-gray-400 hover:text-gray-500"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl bg-white" />
          ))}
        </div>
      ) : (
        <IncidentList incidents={incidents} />
      )}
    </div>
  );
}