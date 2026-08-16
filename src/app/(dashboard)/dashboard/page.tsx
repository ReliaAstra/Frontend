"use client";

import { useEffect, useState, useCallback } from "react";
import { dashboardService, type DashboardSummaryResponse } from "@/services/dashboardService";
import { incidentService, type Incident } from "@/services/incidentService";
import { clientService, type Client } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ExternalLink, Users, Globe, Layers, Shield, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface AgencyMetrics {
  clients_count: number;
  sites_count: number;
  active_dependencies_count: number;
  open_incidents_count: number;
  overall_uptime_percentage: number;
  alerts_today_count: number;
}

export default function DashboardPage() {
  const { currentOrg, isLoading: authLoading } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [s, inc] = await Promise.all([
        dashboardService.getSummary(),
        incidentService.list("open"),
      ]);
      setSummary(s);
      setIncidents(inc);

      // Attempt to fetch clients (may not exist yet)
      try {
        const clientRes = await clientService.list({ per_page: 5 });
        setClients(clientRes.items);
      } catch {
        setClients([]);
      }
    } catch {
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [authLoading, fetchDashboard]);

  const metrics: { label: string; value: string; icon: typeof Users; color: string }[] = summary
    ? [
        {
          label: "CLIENTS",
          value: clients.length > 0 ? String(clients.length) : "--",
          icon: Users,
          color: "text-[#09090B]",
        },
        {
          label: "DEPENDENCIES",
          value: String(summary.active_dependencies_count),
          icon: Layers,
          color: "text-[#09090B]",
        },
        {
          label: "OPEN INCIDENTS",
          value: String(summary.open_incidents_count),
          icon: Shield,
          color: summary.open_incidents_count > 0 ? "text-amber-600" : "text-emerald-600",
        },
        {
          label: "RELIABILITY",
          value: `${summary.overall_uptime_percentage.toFixed(2)}%`,
          icon: Globe,
          color: summary.overall_uptime_percentage >= 99.9
            ? "text-emerald-600"
            : summary.overall_uptime_percentage >= 99
              ? "text-amber-600"
              : "text-red-600",
        },
      ]
    : [];

  if (authLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-20 rounded-lg" />
        <Skeleton className="h-[320px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">
              AGENCY OVERVIEW
            </h1>
            <span className="text-[11px] text-[#A1A1AA] font-normal">
              {currentOrg?.name || "No organization"}
            </span>
          </div>
          <p className="text-[12px] text-[#A1A1AA]">
            {summary ? (
              <>
                <span className="text-[#52525B] font-medium">{summary.active_dependencies_count}</span> dependencies monitored
                {" · "}
                <span className={summary.open_incidents_count > 0 ? "text-amber-600" : "text-emerald-600"}>
                  <span className="font-medium">{summary.open_incidents_count}</span>
                </span> open incidents
                {" · "}
                <span className={cn(
                  "font-medium",
                  summary.overall_uptime_percentage >= 99.9 ? "text-emerald-600" : summary.overall_uptime_percentage >= 99 ? "text-amber-600" : "text-red-600"
                )}>
                  {summary.overall_uptime_percentage.toFixed(2)}%
                </span> reliability
              </>
            ) : loading ? "Loading..." : "No data available"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/clients"
            className="flex items-center gap-1.5 rounded-md border border-[#E4E4E7] px-3 py-1.5 text-xs font-medium text-[#52525B] hover:bg-[#F8F9FA] hover:text-[#09090B] transition-colors"
          >
            View Clients
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing || loading}
            className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <p className="text-xs text-red-500 mt-0.5">
              Check that the backend is accessible and your session is valid.
            </p>
          </div>
          <button onClick={() => fetchDashboard()} className="text-xs font-medium text-red-600 hover:text-red-800">
            Retry
          </button>
        </div>
      )}

      {/* KPI Strip */}
      {loading ? (
        <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
          <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 space-y-2">
                <Skeleton className="h-3 w-24 bg-[#F8F9FA]" />
                <Skeleton className="h-6 w-16 bg-[#F8F9FA]" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
          <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
            {metrics.map((m) => (
              <div key={m.label} className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <m.icon className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
                  <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                    {m.label}
                  </p>
                </div>
                <p className={cn("text-xl font-semibold font-mono tabular-nums leading-none", m.color)}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column: Active Incidents + Quick Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Active Incidents Table */}
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center gap-2">
            <div className={cn(
              "h-2 w-2 rounded-full",
              incidents.length > 0 ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <h2 className="text-[13px] font-semibold text-[#09090B]">Active Incidents</h2>
            {incidents.length > 0 && (
              <span className="text-[11px] text-[#A1A1AA] ml-auto">
                {incidents.length} requiring attention
              </span>
            )}
            {incidents.length === 0 && (
              <span className="text-[11px] text-emerald-600 ml-auto">
                All clear
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[60px] bg-[#F8F9FA]" />
              ))}
            </div>
          ) : incidents.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {incidents.slice(0, 5).map((inc) => (
                <Link
                  key={inc.id}
                  href={`/incidents/${inc.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
                >
                  <SeverityBadge severity={inc.severity} />
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors">
                      {inc.description || `Incident ${inc.id.slice(0, 8)}`}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#A1A1AA]">
                      <span className="font-mono text-[#52525B]">{inc.dependency_id.slice(0, 12)}</span>
                      <span className="capitalize">{inc.root_cause?.replace("_", " ") || "Unknown"}</span>
                      <span>{formatDistanceToNow(new Date(inc.started_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Shield className="h-8 w-8 text-emerald-200 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#09090B] font-medium">No active incidents</p>
              <p className="text-xs text-[#A1A1AA] mt-1">
                {summary
                  ? `${summary.active_dependencies_count} dependencies operating normally.`
                  : "Connect to the backend to see operational data."}
              </p>
            </div>
          )}
        </div>

        {/* Quick Clients Panel */}
        <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
            <h2 className="text-[13px] font-semibold text-[#09090B]">Clients</h2>
            {clients.length > 0 && (
              <span className="text-[11px] text-[#A1A1AA] ml-auto">{clients.length} total</span>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[48px] bg-[#F8F9FA]" />
              ))}
            </div>
          ) : clients.length > 0 ? (
            <div className="divide-y divide-[#F0F0F0]">
              {clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F8F9FA] border border-[#E4E4E7] text-xs font-medium text-[#52525B] shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors truncate block">
                      {client.name}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#A1A1AA]">
                      <span>{client.sites_count} sites</span>
                      <span>{client.dependencies_count} deps</span>
                      {client.open_incidents_count > 0 && (
                        <span className="text-amber-600">{client.open_incidents_count} incidents</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="h-8 w-8 text-[#E4E4E7] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-[#09090B] font-medium">No clients yet</p>
              <p className="text-xs text-[#A1A1AA] mt-1">
                Clients will appear once they are added to your organization.
              </p>
            </div>
          )}

          {clients.length > 0 && (
            <div className="px-5 py-2.5 border-t border-[#E4E4E7]">
              <Link
                href="/clients"
                className="text-xs font-medium text-[#0891B2] hover:underline flex items-center gap-1"
              >
                View all clients
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
