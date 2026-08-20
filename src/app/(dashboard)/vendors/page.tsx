"use client";

import * as React from "react";
import { Plus, Radio } from "lucide-react";
import { toast } from "sonner";
import { vendorService, type VendorResponse } from "@/services/vendorService";
import { usePublicVendors } from "@/hooks/useApi";
import { Card, EmptyState, PageHeader, Skeleton, statusMeta } from "@/components/rs/ui";

interface VendorCardData extends VendorResponse {
  uptime?: number;
  latency?: number;
}

export default function VendorsPage() {
  const { data: vendorList = [], isLoading, isError, refetch } = usePublicVendors();
  const [vendors, setVendors] = React.useState<VendorCardData[]>([]);
  const [monitoring, setMonitoring] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!vendorList.length) return;
    let cancelled = false;
    const enrich = async () => {
      const enriched = await Promise.allSettled(
        vendorList.slice(0, 12).map(async (v) => {
          try {
            const history = await vendorService.getVendorHistory(v.vendor_name);
            return { ...v, uptime: history.uptime_percentage_24h, latency: history.avg_latency_ms_24h };
          } catch {
            return { ...v };
          }
        }),
      );
      if (cancelled) return;
      setVendors(enriched.filter((r) => r.status === "fulfilled").map((r) => (r as PromiseFulfilledResult<VendorCardData>).value));
    };
    enrich();
    return () => {
      cancelled = true;
    };
  }, [vendorList]);

  const handleMonitor = (vendor: VendorCardData) => {
    setMonitoring(vendor.vendor_name);
    toast.info(`${vendor.display_name || vendor.vendor_name} added to monitoring (demo).`);
    setTimeout(() => setMonitoring(null), 1500);
  };

  const statusFromUptime = (uptime: number | undefined): string => {
    if (uptime == null) return "unknown";
    if (uptime >= 99.9) return "operational";
    if (uptime >= 99) return "degraded";
    return "down";
  };

  return (
    <div>
      <PageHeader title="Vendors" subtitle="Independent observations from our global monitoring network." />

      {isError && (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">
            Unable to load vendors.{" "}
            <button onClick={() => refetch()} className="text-[#3B82F6] hover:underline">
              Retry
            </button>
          </p>
        </Card>
      )}

      {isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      )}

      {!isLoading && !isError && vendors.length === 0 && (
        <Card>
          <EmptyState icon={Radio} title="No vendors available" body="Public vendor reliability data will appear here." />
        </Card>
      )}

      {!isLoading && !isError && vendors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((vendor) => {
            const status = statusFromUptime(vendor.uptime);
            const meta = statusMeta(status);
            return (
              <Card key={vendor.id} hover className="p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F9FAFB] truncate">
                      {vendor.display_name || vendor.vendor_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-block rounded-full" style={{ width: 8, height: 8, backgroundColor: meta.dot }} />
                      <span className="text-xs" style={{ color: meta.text }}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded bg-[#1F2937] text-[#9CA3AF] shrink-0">
                    {vendor.category}
                  </span>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Uptime</p>
                    <p className="text-sm text-[#F9FAFB] mt-0.5" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {vendor.uptime != null ? `${vendor.uptime.toFixed(2)}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#6B7280]">Avg latency</p>
                    <p className="text-sm text-[#F9FAFB] mt-0.5" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {vendor.latency != null ? `${Math.round(vendor.latency)}ms` : "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleMonitor(vendor)}
                  disabled={monitoring === vendor.vendor_name}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#3B82F6] text-white px-4 py-2 rounded-lg text-xs font-medium hover:brightness-110 transition-[filter] disabled:opacity-50"
                >
                  {monitoring === vendor.vendor_name ? (
                    <>Adding…</>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Monitor this vendor
                    </>
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
