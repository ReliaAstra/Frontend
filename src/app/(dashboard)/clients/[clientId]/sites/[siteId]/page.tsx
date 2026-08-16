"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clientService, type Site, type SiteDependency } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Zap, Clock, RefreshCw, ExternalLink, AlertTriangle } from "lucide-react";
import {
  ConsoleCard,
  ConsoleCardBody,
  ConsoleCardHeader,
  ConsoleTableHeader,
  ConsoleTableRow,
  StatusDot,
  MonoSmall,
} from "@/components/dashboard/ConsoleLayout";

function depStatusColor(status: SiteDependency["status"]): string {
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

function depStatusLabel(status: SiteDependency["status"]): string {
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

export default function SiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const siteId = params.siteId as string;

  const [clientName, setClientName] = useState<string>("");
  const [site, setSite] = useState<Site | null>(null);
  const [deps, setDeps] = useState<SiteDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      clientService.getById(clientId),
      clientService.getSiteById(clientId, siteId),
      clientService.getSiteDependencies(clientId, siteId),
    ])
      .then(([c, s, d]) => {
        if (cancelled) return;
        setClientName(c.name);
        setSite(s);
        setDeps(d);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load site data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, siteId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-56 bg-[#1A1A20]" />
          <Skeleton className="h-6 w-48 bg-[#1A1A20]" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  if (!site) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Site not found.</p>
        <button
          onClick={() => router.push("/clients")}
          className="mt-4 text-xs text-[#0891B2] hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const depsByStatus = {
    up: deps.filter((d) => d.status === "up"),
    degraded: deps.filter((d) => d.status === "degraded"),
    down: deps.filter((d) => d.status === "down"),
    unknown: deps.filter((d) => d.status === "unknown"),
  };

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
        <Link
          href={`/clients/${clientId}`}
          className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          {clientName || "..."}
        </Link>
        <span className="text-[#52525B]">/</span>
        <span className="text-[#FAFAFA] font-medium">{site.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)]"
            style={{ backgroundColor: "#1A1A20" }}
          >
            <Globe className="h-5 w-5" style={{ color: "#A1A1AA" }} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">
                {site.name}
              </h1>
              <StatusDot
                status={depStatusLabel(site.status) as "operational" | "degraded" | "down" | "unknown"}
                pulse={site.status === "down"}
              />
              <span
                className="text-[12px] capitalize"
                style={{ color: depStatusColor(site.status) }}
              >
                {site.status}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#A1A1AA]">
              {site.url && (
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[#0891B2] hover:underline flex items-center gap-1"
                >
                  {site.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span>{deps.length} dependencies</span>
              <span
                className="font-mono font-medium"
                style={{
                  color:
                    site.uptime_percentage_24h >= 99.9
                      ? "#16A34A"
                      : site.uptime_percentage_24h >= 99
                      ? "#D97706"
                      : "#DC2626",
                }}
              >
                {site.uptime_percentage_24h.toFixed(2)}% uptime
              </span>
              <span className="font-mono">
                {site.avg_latency_ms_24h != null
                  ? `${Math.round(site.avg_latency_ms_24h)}ms avg latency`
                  : "--"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#A1A1AA]"
          style={{ backgroundColor: "#131318" }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status Overview Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "#16A34A" }} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Operational
              </p>
              <p
                className="text-xl font-semibold font-mono tabular-nums leading-none mt-1"
                style={{ color: "#16A34A" }}
              >
                {depsByStatus.up.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>

        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "#D97706" }} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Degraded
              </p>
              <p
                className="text-xl font-semibold font-mono tabular-nums leading-none mt-1"
                style={{ color: "#D97706" }}
              >
                {depsByStatus.degraded.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>

        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "#DC2626" }} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Down
              </p>
              <p
                className="text-xl font-semibold font-mono tabular-nums leading-none mt-1"
                style={{ color: "#DC2626" }}
              >
                {depsByStatus.down.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>

        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: "#52525B" }} />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Unknown
              </p>
              <p
                className="text-xl font-semibold font-mono tabular-nums leading-none mt-1"
                style={{ color: "#52525B" }}
              >
                {depsByStatus.unknown.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
      </div>

      {/* Dependency List */}
      <ConsoleCard>
        <ConsoleCardHeader className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold text-[#FAFAFA]">
            External Dependencies
          </h2>
          <MonoSmall className="ml-auto">{deps.length} monitored</MonoSmall>
        </ConsoleCardHeader>

        {deps.length === 0 ? (
          <ConsoleCardBody className="py-12 text-center">
            <Zap
              className="h-8 w-8 mx-auto mb-3"
              style={{ color: "#52525B" }}
              strokeWidth={1.5}
            />
            <p className="text-sm text-[#FAFAFA] font-medium">
              No dependencies configured
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              External service dependencies for this site will appear here.
            </p>
          </ConsoleCardBody>
        ) : (
          <>
            <ConsoleTableHeader
              columns={[
                { label: "Dependency", className: "" },
                { label: "Status", className: "text-right" },
                { label: "Uptime (24h)", className: "text-right" },
                { label: "Latency", className: "text-right" },
                { label: "Last Check", className: "text-right" },
              ]}
            />
            {deps.map((dep, idx) => (
              <ConsoleTableRow key={dep.id} index={idx}>
                {/* Name & URL */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium text-[#FAFAFA] truncate">
                      {dep.name}
                    </p>
                    {!dep.is_active && (
                      <span
                        className="text-[10px] font-medium rounded px-1.5 py-0.5"
                        style={{
                          backgroundColor: "#1A1A20",
                          color: "#A1A1AA",
                        }}
                      >
                        Paused
                      </span>
                    )}
                  </div>
                  <MonoSmall className="truncate block max-w-[320px] mt-0.5">
                    {dep.endpoint_url}
                  </MonoSmall>
                </div>

                {/* Status */}
                <div className="flex items-center justify-end gap-1.5">
                  <StatusDot
                    status={depStatusLabel(dep.status) as "operational" | "degraded" | "down" | "unknown"}
                    pulse={dep.status === "down"}
                  />
                  <span
                    className="text-[12px] capitalize"
                    style={{ color: depStatusColor(dep.status) }}
                  >
                    {dep.status}
                  </span>
                </div>

                {/* Uptime */}
                <span
                  className="text-[13px] font-medium font-mono text-right tabular-nums"
                  style={{
                    color:
                      dep.uptime_percentage_24h >= 99.9
                        ? "#16A34A"
                        : dep.uptime_percentage_24h >= 99
                        ? "#D97706"
                        : "#DC2626",
                  }}
                >
                  {dep.uptime_percentage_24h.toFixed(2)}%
                </span>

                {/* Latency */}
                <span className="text-[13px] font-medium font-mono text-[#FAFAFA] text-right tabular-nums">
                  {dep.avg_latency_ms_24h != null
                    ? `${Math.round(dep.avg_latency_ms_24h)}ms`
                    : "--"}
                </span>

                {/* Last Check */}
                <div className="flex items-center justify-end gap-1.5 text-[#A1A1AA]">
                  <Clock className="h-3 w-3" />
                  <span className="text-[11px]">
                    {dep.last_check_at
                      ? new Date(dep.last_check_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Never"}
                  </span>
                </div>
              </ConsoleTableRow>
            ))}
          </>
        )}
      </ConsoleCard>

      {/* Incident History */}
      <ConsoleCard>
        <ConsoleCardHeader className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold text-[#FAFAFA]">Incident History</h2>
        </ConsoleCardHeader>
        <ConsoleCardBody className="py-12 text-center">
          <AlertTriangle
            className="h-8 w-8 mx-auto mb-3"
            style={{ color: "#52525B" }}
            strokeWidth={1.5}
          />
          <p className="text-sm text-[#FAFAFA] font-medium">No incidents recorded</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Incidents affecting this site&apos;s dependencies will appear here.
          </p>
        </ConsoleCardBody>
      </ConsoleCard>
    </div>
  );
}
