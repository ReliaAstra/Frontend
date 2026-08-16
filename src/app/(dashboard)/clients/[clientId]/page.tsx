"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clientService, type Client, type Site } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Globe,
  Layers,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  ConsoleCard,
  ConsoleCardBody,
  ConsoleCardHeader,
  ConsoleTableHeader,
  ConsoleTableRow,
  StatusDot,
  MetricValue,
  MonoSmall,
} from "@/components/dashboard/ConsoleLayout";

function statusColor(status: Site["status"]): string {
  switch (status) {
    case "up":
      return "#16A34A";
    case "degraded":
      return "#D97706";
    case "down":
      return "#DC2626";
    default:
      return "#52525B";
  }
}

function statusLabel(status: Site["status"]): string {
  switch (status) {
    case "up":
      return "operational";
    case "degraded":
      return "degraded";
    case "down":
      return "down";
    default:
      return "unknown";
  }
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      clientService.getById(clientId),
      clientService.listSites(clientId),
    ])
      .then(([c, s]) => {
        if (cancelled) return;
        setClient(c);
        setSites(s);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load client data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 bg-[#1A1A20]" />
          <Skeleton className="h-6 w-56 bg-[#1A1A20]" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-[#1A1A20]" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-[#1A1A20]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/clients" className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
            Clients
          </Link>
          <span className="text-[#52525B]">/</span>
          <span className="text-[#52525B]">...</span>
        </div>
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
          <p className="text-sm text-[#FAFAFA] flex-1">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-medium text-[#0891B2]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Client not found.</p>
        <button
          onClick={() => router.push("/clients")}
          className="mt-4 text-xs text-[#0891B2] hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const statusCounts = sites.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/clients"
          className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          Clients
        </Link>
        <span className="text-[#52525B]">/</span>
        <span className="text-[#FAFAFA] font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-sm font-semibold"
            style={{ backgroundColor: "#1A1A20", color: "#A1A1AA" }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">
                {client.name}
              </h1>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  client.status === "active" ? "bg-[#16A34A]" : "bg-[#52525B]"
                )}
              />
            </div>
            <p className="text-[12px] text-[#A1A1AA] mt-0.5">
              {sites.length} site{sites.length !== 1 ? "s" : ""} · {client.dependencies_count} dependencies
              {client.open_incidents_count > 0 && (
                <>
                  {" "}·{" "}
                  <span style={{ color: "#D97706" }}>
                    {client.open_incidents_count} open incident{client.open_incidents_count !== 1 ? "s" : ""}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#A1A1AA]"
            style={{ backgroundColor: "#131318" }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button className="inline-flex items-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all">
            <FileText className="h-3.5 w-3.5" />
            Generate client report
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sites */}
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "rgba(8,145,178,0.12)" }}
            >
              <Globe className="h-5 w-5" style={{ color: "#0891B2" }} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Sites
              </p>
              <MetricValue value={sites.length} />
            </div>
            <div className="ml-auto flex flex-col items-end gap-0.5">
              <MonoSmall>
                <span style={{ color: "#16A34A" }}>{statusCounts["up"] || 0} up</span>
              </MonoSmall>
              {(statusCounts["degraded"] || 0) > 0 && (
                <MonoSmall>
                  <span style={{ color: "#D97706" }}>{statusCounts["degraded"]} degraded</span>
                </MonoSmall>
              )}
              {(statusCounts["down"] || 0) > 0 && (
                <MonoSmall>
                  <span style={{ color: "#DC2626" }}>{statusCounts["down"]} down</span>
                </MonoSmall>
              )}
            </div>
          </ConsoleCardBody>
        </ConsoleCard>

        {/* Dependencies */}
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
                Dependencies
              </p>
              <MetricValue value={client.dependencies_count} />
            </div>
          </ConsoleCardBody>
        </ConsoleCard>

        {/* Active Incidents */}
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{
                backgroundColor:
                  client.open_incidents_count > 0
                    ? "rgba(217,119,6,0.12)"
                    : "rgba(22,163,74,0.12)",
              }}
            >
              <AlertTriangle
                className="h-5 w-5"
                style={{
                  color: client.open_incidents_count > 0 ? "#D97706" : "#16A34A",
                }}
              />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Active incidents
              </p>
              <MetricValue
                value={client.open_incidents_count}
                color={client.open_incidents_count > 0 ? "#D97706" : "#16A34A"}
              />
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
      </div>

      {/* Sites List */}
      <ConsoleCard>
        <ConsoleCardHeader className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold text-[#FAFAFA]">Sites & Applications</h2>
          <MonoSmall className="ml-auto">{sites.length} total</MonoSmall>
        </ConsoleCardHeader>

        {sites.length === 0 ? (
          <ConsoleCardBody className="py-12 text-center">
            <Globe
              className="h-8 w-8 mx-auto mb-3"
              style={{ color: "#52525B" }}
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#FAFAFA] font-medium">No sites configured</p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Sites and applications for this client will appear here.
            </p>
          </ConsoleCardBody>
        ) : (
          <>
            <ConsoleTableHeader
              columns={[
                { label: "Site", className: "" },
                { label: "Status", className: "text-right" },
                { label: "Dependencies", className: "text-right" },
                { label: "Uptime (24h)", className: "text-right" },
                { label: "Avg latency", className: "text-right" },
                { label: "", className: "w-10" },
              ]}
            />
            {sites.map((site, idx) => (
              <Link
                key={site.id}
                href={`/clients/${clientId}/sites/${site.id}`}
              >
                <ConsoleTableRow index={idx} className="cursor-pointer group">
                  {/* Name */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                      {site.name}
                    </p>
                    {site.url && (
                      <MonoSmall className="truncate block max-w-[240px] mt-0.5">
                        {site.url}
                      </MonoSmall>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-end gap-1.5">
                    <StatusDot
                      status={statusLabel(site.status) as "operational" | "degraded" | "down" | "unknown"}
                      pulse={site.status === "down"}
                    />
                    <span
                      className="text-[12px] capitalize"
                      style={{ color: statusColor(site.status) }}
                    >
                      {site.status}
                    </span>
                  </div>

                  {/* Dependencies */}
                  <span className="text-[13px] font-medium font-mono text-[#FAFAFA] text-right tabular-nums">
                    {site.dependencies_count}
                  </span>

                  {/* Uptime */}
                  <span
                    className="text-[13px] font-medium font-mono text-right tabular-nums"
                    style={{
                      color:
                        site.uptime_percentage_24h >= 99.9
                          ? "#16A34A"
                          : site.uptime_percentage_24h >= 99
                          ? "#D97706"
                          : "#DC2626",
                    }}
                  >
                    {site.uptime_percentage_24h.toFixed(2)}%
                  </span>

                  {/* Latency */}
                  <MonoSmall className="text-right">
                    {site.avg_latency_ms_24h != null
                      ? `${Math.round(site.avg_latency_ms_24h)}ms`
                      : "--"}
                  </MonoSmall>

                  {/* Chevron */}
                  <ChevronRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 transition-colors" />
                </ConsoleTableRow>
              </Link>
            ))}
          </>
        )}
      </ConsoleCard>
    </div>
  );
}
