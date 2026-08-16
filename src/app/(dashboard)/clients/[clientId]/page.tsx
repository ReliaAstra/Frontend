"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientService, type Client, type Site } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, ArrowLeft, ChevronRight, Globe, Layers, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { formatDistanceToNow } from "date-fns";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s] = await Promise.all([
        clientService.getById(clientId),
        clientService.listSites(clientId),
      ]);
      setClient(c);
      setSites(s);
    } catch {
      setError("Unable to load client data.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg bg-white" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
        <button onClick={() => fetchClient()} className="text-xs font-medium text-red-600">Retry</button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Client not found.</p>
        <button onClick={() => router.push("/clients")} className="mt-4 text-xs text-[#0891B2] hover:underline">
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
      <button
        onClick={() => router.push("/clients")}
        className="flex items-center gap-2 text-sm text-[#52525B] hover:text-[#09090B] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Clients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8F9FA] border border-[#E4E4E7] text-sm font-semibold text-[#52525B]">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">{client.name}</h1>
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                client.status === "active" ? "bg-emerald-500" : "bg-[#71717A]"
              )} />
            </div>
            <p className="text-[12px] text-[#A1A1AA] mt-0.5">
              {sites.length} site{sites.length !== 1 ? "s" : ""} · {client.dependencies_count} dependencies
              {client.open_incidents_count > 0 && (
                <> · <span className="text-amber-600">{client.open_incidents_count} open incidents</span></>
              )}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchClient()}
          className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Status Summary */}
      <div className="border border-[#E4E4E7] bg-white rounded-lg overflow-hidden">
        <div className="divide-x divide-[#E4E4E7] grid grid-cols-2 sm:grid-cols-4">
          <div className="px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA] mb-1.5">Sites</p>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-[#09090B]">
              {sites.length}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Operational</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-emerald-600">
              {statusCounts["up"] || 0}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Degraded</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-amber-600">
              {statusCounts["degraded"] || 0}
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">Down</p>
            </div>
            <p className="text-xl font-semibold font-mono tabular-nums leading-none text-red-600">
              {statusCounts["down"] || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#E4E4E7] flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-[#A1A1AA]" strokeWidth={1.8} />
          <h2 className="text-[13px] font-semibold text-[#09090B]">Sites & Applications</h2>
          <span className="text-[11px] text-[#A1A1AA] ml-auto">{sites.length} total</span>
        </div>

        {sites.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="h-8 w-8 text-[#E4E4E7] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-[#09090B] font-medium">No sites configured</p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Sites and applications for this client will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0F0F0]">
            {sites.map((site) => (
              <Link
                key={site.id}
                href={`/clients/${clientId}/sites/${site.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
              >
                <StatusBadge status={site.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors truncate">
                    {site.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#A1A1AA]">
                    {site.url && (
                      <span className="font-mono truncate max-w-[240px]">{site.url}</span>
                    )}
                    <span>{site.dependencies_count} deps</span>
                    <span className={cn(
                      "font-mono",
                      site.uptime_percentage_24h >= 99.9 ? "text-emerald-600" : site.uptime_percentage_24h >= 99 ? "text-amber-600" : "text-red-600"
                    )}>
                      {site.uptime_percentage_24h.toFixed(2)}% uptime
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-[#A1A1AA]">
                    {site.avg_latency_ms_24h != null ? `${Math.round(site.avg_latency_ms_24h)}ms avg` : "--"}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
