"use client";

import { useEffect, useState, useCallback } from "react";
import { IncidentList } from "@/components/dashboard/IncidentList";
import { incidentService, type Incident, type IncidentStatus } from "@/services/incidentService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const statusFilters: Array<{ value: IncidentStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "false_positive", label: "False Positive" },
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await incidentService.list(
        statusFilter === "all" ? undefined : statusFilter
      );
      setIncidents(data);
    } catch {
      setError("Unable to load incidents.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">INCIDENTS</h1>
          <p className="text-[12px] text-[#A1A1AA] mt-1">
            Track and manage dependency incidents
          </p>
        </div>
        <button
          onClick={() => fetchIncidents(true)}
          disabled={refreshing || loading}
          className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-white border border-[#E4E4E7] p-1 w-fit">
        {statusFilters.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              "rounded-md px-4 py-2 text-xs font-medium transition-colors",
              statusFilter === s.value
                ? "bg-[#F8F9FA] text-[#09090B]"
                : "text-[#A1A1AA] hover:text-[#52525B]"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchIncidents()} className="text-xs font-medium text-red-600 ml-auto">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-lg bg-white" />
          ))}
        </div>
      ) : incidents.length === 0 ? (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
          <p className="text-sm text-[#09090B] font-medium">No incidents</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            {statusFilter === "all"
              ? "No incidents have been recorded."
              : `No ${statusFilters.find(s => s.value === statusFilter)?.label?.toLowerCase() || statusFilter} incidents.`}
          </p>
        </div>
      ) : (
        <IncidentList incidents={incidents} />
      )}
    </div>
  );
}
