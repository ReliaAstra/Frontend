"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientService, type Site, type SiteDependency } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ArrowLeft, Globe, ExternalLink, Clock, Zap, Shield, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistanceToNow, format } from "date-fns";

export default function SiteViewPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const siteId = params.siteId as string;
  const [site, setSite] = useState<Site | null>(null);
  const [deps, setDeps] = useState<SiteDependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSite = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, d] = await Promise.all([
        clientService.getSiteById(clientId, siteId),
        clientService.getSiteDependencies(clientId, siteId),
      ]);
      setSite(s);
      setDeps(d);
    } catch {
      setError("Unable to load site data.");
    } finally {
      setLoading(false);
    }
  }, [clientId, siteId]);

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-20 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button onClick={() => fetchSite()} className="text-xs font-medium text-red-600 ml-auto">Retry</button>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Site not found.</p>
        <button onClick={() => router.push("/clients")} className="mt-4 text-xs text-[#0891B2] hover:underline">
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
        <Link href="/clients" className="text-[#52525B] hover:text-[#09090B] transition-colors">
          Clients
        </Link>
        <span className="text-[#D4D4D8]">/</span>
        <button onClick={() => router.push(`/clients/${clientId}`)} className="text-[#52525B] hover:text-[#09090B] transition-colors">
          {site.name}
        </button>
        <span className="text-[#D4D4D8]">/</span>
        <span className="text-[#09090B] font-medium">Dependencies</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-[#F8F9FA] border border-[#E4E4E7]">
            <Globe className="h-5 w-5 text-[#52525B]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">{site.name}</h1>
              <StatusBadge status={site.status} />
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
              <span className={cn(
                "font-mono font-medium",
                site.uptime_percentage_24h >= 99.9 ? "text-emerald-600" : site.uptime_percentage_24h >= 99 ? "text-amber-600" : "text-red-600"
              )}>
                {site.uptime_percentage_24h.toFixed(2)}% uptime
              </span>
              <span className="font-mono">
                {site.avg_latency_ms_24h != null ? `${Math.round(site.avg_latency_ms_24h)}ms avg latency` : "--"}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchSite()}
          className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dependency Status Summary */}
      <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
        <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Operational</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-emerald-600">
              {depsByStatus.up.length}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Degraded</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-amber-600">
              {depsByStatus.degraded.length}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Down</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-red-600">
              {depsByStatus.down.length}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#71717A]" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Unknown</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-[#71717A]">
              {depsByStatus.unknown.length}
            </p>
          </div>
        </div>
      </div>

      {/* Dependencies List */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold text-[#09090B]">External Dependencies</h2>
          <span className="text-[11px] text-[#A1A1AA] ml-auto">{deps.length} monitored</span>
        </div>

        {deps.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-8 w-8 text-[#E4E4E7] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-[#09090B] font-medium">No dependencies configured</p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              External service dependencies for this site will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {deps.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors"
              >
                <StatusBadge status={dep.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#09090B] truncate">{dep.name}</p>
                  <p className="text-[11px] text-[#A1A1AA] font-mono truncate mt-0.5">{dep.endpoint_url}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <p className="text-[10px] text-[#A1A1AA] uppercase">Uptime</p>
                    <p className={cn(
                      "text-[13px] font-medium font-mono tabular-nums",
                      dep.uptime_percentage_24h >= 99.9 ? "text-emerald-600" : dep.uptime_percentage_24h >= 99 ? "text-amber-600" : "text-red-600"
                    )}>
                      {dep.uptime_percentage_24h.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A1A1AA] uppercase">Latency</p>
                    <p className="text-[13px] font-medium font-mono tabular-nums text-[#09090B]">
                      {dep.avg_latency_ms_24h != null ? `${Math.round(dep.avg_latency_ms_24h)}ms` : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#A1A1AA] uppercase">Last Check</p>
                    <p className="text-[11px] text-[#52525B]">
                      {dep.last_check_at
                        ? formatDistanceToNow(new Date(dep.last_check_at), { addSuffix: true })
                        : "Never"}
                    </p>
                  </div>
                </div>
                {!dep.is_active && (
                  <span className="text-[10px] font-medium text-[#A1A1AA] bg-[#F8F9FA] rounded px-1.5 py-0.5">
                    Paused
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
