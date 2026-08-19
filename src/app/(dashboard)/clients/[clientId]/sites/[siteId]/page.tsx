"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AppWindow, Layers, RefreshCw, ChevronRight, Globe } from "lucide-react";
import {
  ConsoleCard,
  ConsoleCardBody,
  StatusDot,
} from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import {
  useClients,
  useClientApplications,
  useDependencies,
  useDependencyHealth,
} from "@/hooks/useApi";
import { formatDistanceToNow } from "date-fns";

/**
 * Application detail page ( routed as /clients/[clientId]/sites/[siteId] for
 * backwards compatibility — "sites" were renamed to "applications" when the
 * backend moved to the v1 flat API ).
 *
 * Shows the application record plus the dependencies linked to it via
 * `application_id`.
 */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const applicationId = params.siteId as string;

  const clientsQuery = useClients();
  const applicationsQuery = useClientApplications(clientId);
  const dependenciesQuery = useDependencies(100);
  const healthQuery = useDependencyHealth();

  const client = (clientsQuery.data ?? []).find((c) => c.id === clientId) ?? null;
  const application =
    (applicationsQuery.data ?? []).find((a) => a.id === applicationId) ?? null;

  const linkedDeps = (dependenciesQuery.data ?? []).filter(
    (d) => d.application_id === applicationId
  );
  const healthByDepId = new Map(
    (healthQuery.data ?? []).map((h) => [h.dependency_id, h])
  );

  const loading =
    clientsQuery.isLoading || applicationsQuery.isLoading || dependenciesQuery.isLoading;
  const error = clientsQuery.isError || applicationsQuery.isError || dependenciesQuery.isError;

  const refetch = () => {
    clientsQuery.refetch();
    applicationsQuery.refetch();
    dependenciesQuery.refetch();
    healthQuery.refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-56 bg-[#1A1A20]" />
          <Skeleton className="h-6 w-48 bg-[#1A1A20]" />
        </div>
        <Skeleton className="h-[300px] rounded-xl bg-[#1A1A20]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
          <p className="text-sm text-[#FAFAFA] flex-1">Unable to load application data.</p>
          <button onClick={refetch} className="text-xs font-medium text-[#0891B2]">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Application not found.</p>
        <button
          onClick={() => router.push(`/clients/${clientId}`)}
          className="mt-4 text-xs text-[#0891B2] hover:underline"
        >
          Back to Client
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/clients" className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
          Clients
        </Link>
        <span className="text-[#52525B]">/</span>
        <Link
          href={`/clients/${clientId}`}
          className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          {client?.name ?? "Client"}
        </Link>
        <span className="text-[#52525B]">/</span>
        <span className="text-[#FAFAFA] font-medium">{application.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] shrink-0"
            style={{ backgroundColor: "#1A1A20" }}
          >
            <AppWindow className="w-5 h-5 text-[#0891B2]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight truncate">
              {application.name}
            </h1>
            <p className="text-[12px] text-[#A1A1AA] mt-0.5 truncate">
              {application.description || "No description"} · Added{" "}
              {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <button
          onClick={refetch}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#A1A1AA] shrink-0"
          style={{ backgroundColor: "#131318" }}
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "rgba(8,145,178,0.12)" }}
            >
              <Layers className="h-5 w-5" style={{ color: "#0891B2" }} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Linked dependencies
              </p>
              <p className="font-mono text-2xl font-semibold text-[#FAFAFA]">
                {linkedDeps.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "rgba(22,163,74,0.12)" }}
            >
              <Globe className="h-5 w-5" style={{ color: "#16A34A" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Application ID
              </p>
              <p className="font-mono text-sm text-[#A1A1AA] truncate">{application.id}</p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
      </div>

      {/* Linked dependencies */}
      {linkedDeps.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No linked dependencies"
          description="Dependencies can be linked to this application from the Dependencies page using its application ID."
          actionLabel="Open Dependencies"
          actionHref="/dependencies"
        />
      ) : (
        <ConsoleCard>
          <div className="px-5 py-3 grid grid-cols-[1fr_2fr_120px_120px_40px] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
            <span>Dependency</span>
            <span>Endpoint</span>
            <span>Status</span>
            <span className="text-right">Uptime 24h</span>
            <span></span>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {linkedDeps.map((dep) => {
              const health = healthByDepId.get(dep.id);
              const status = (health?.current_status ?? "unknown") as
                | "up"
                | "down"
                | "degraded"
                | "unknown";
              return (
                <Link
                  key={dep.id}
                  href="/dependencies"
                  className="px-5 py-3.5 grid grid-cols-[1fr_2fr_120px_120px_40px] gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                >
                  <span className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                    {dep.name}
                  </span>
                  <span className="text-[12px] font-mono text-[#A1A1AA] truncate">
                    {dep.endpoint_url}
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusDot
                      status={
                        status === "up"
                          ? "operational"
                          : status === "down"
                            ? "down"
                            : status === "degraded"
                              ? "degraded"
                              : "unknown"
                      }
                    />
                    <span className="text-[12px] text-[#A1A1AA] capitalize">{status}</span>
                  </span>
                  <span className="text-[12px] font-mono text-[#A1A1AA] text-right tabular-nums">
                    {health ? `${health.uptime_percentage_24h.toFixed(2)}%` : "—"}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 ml-auto transition-colors" />
                </Link>
              );
            })}
          </div>
        </ConsoleCard>
      )}
    </div>
  );
}
