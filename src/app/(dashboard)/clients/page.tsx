"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Users, Plus, ChevronRight } from "lucide-react";
import { ConsoleCard } from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useClients } from "@/hooks/useApi";

export default function ClientsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: clientsData, isLoading: loading, isError: error, refetch } = useClients();

  // Normalize response
  const clients = Array.isArray(clientsData)
    ? clientsData
    : (clientsData as any)?.items ?? [];

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 bg-[#1A1A20]" />
            <Skeleton className="h-4 w-48 bg-[#1A1A20]" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg bg-[#1A1A20]" />
        </div>
        <ConsoleCard>
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <div className="grid grid-cols-[1fr_80px_120px_120px_100px_40px] gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16 bg-[#1A1A20]" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-t border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md bg-[#1A1A20]" />
                <Skeleton className="h-3.5 w-36 bg-[#1A1A20]" />
              </div>
            </div>
          ))}
        </ConsoleCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">Clients</h1>
          <p className="text-[12px] text-[#A1A1AA] mt-1">
            Manage and monitor your client infrastructure
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all">
          <Plus className="h-3.5 w-3.5" />
          Add client
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
          <p className="text-sm text-[#FAFAFA] flex-1">Unable to load clients.</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium text-[#0891B2]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && clients.length === 0 && (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start monitoring their infrastructure reliability and track dependencies across sites."
          actionLabel="Add client"
          onAction={() => {}}
        />
      )}

      {/* Table */}
      {!error && clients.length > 0 && (
        <ConsoleCard>
          {/* Table Header */}
          <div className="px-5 py-3 grid grid-cols-[1fr_80px_120px_120px_100px_40px] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
            <span>Client</span>
            <span className="text-right">Sites</span>
            <span className="text-right">Dependencies</span>
            <span className="text-right">Active incidents</span>
            <span className="text-right">Reliability</span>
            <span></span>
          </div>

          {/* Rows */}
          {clients.map((client: any) => {
            const hasIncidents = client.open_incidents_count > 0;
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="px-5 py-3.5 grid grid-cols-[1fr_80px_120px_120px_100px_40px] gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center group"
              >
                {/* Client Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(255,255,255,0.08)] text-xs font-medium shrink-0"
                    style={{ backgroundColor: "#1A1A20", color: "#A1A1AA" }}
                  >
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          client.status === "active" ? "bg-[#16A34A]" : "bg-[#52525B]"
                        )}
                      />
                      <span className="text-[11px] text-[#A1A1AA] capitalize">
                        {client.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sites */}
                <span className="text-[13px] font-medium font-mono text-[#FAFAFA] text-right tabular-nums">
                  {client.sites_count}
                </span>

                {/* Dependencies */}
                <span className="text-[13px] font-medium font-mono text-[#FAFAFA] text-right tabular-nums">
                  {client.dependencies_count}
                </span>

                {/* Active Incidents */}
                <span
                  className={cn(
                    "text-[13px] font-medium font-mono text-right tabular-nums",
                    hasIncidents ? "text-[#D97706]" : "text-[#A1A1AA]"
                  )}
                >
                  {client.open_incidents_count}
                </span>

                {/* Reliability */}
                <span className="text-[13px] font-mono text-[#A1A1AA] text-right tabular-nums">
                  --
                </span>

                {/* Chevron */}
                <ChevronRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 ml-auto transition-colors" />
              </Link>
            );
          })}
        </ConsoleCard>
      )}
    </div>
  );
}
