"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Plus, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  vendorService,
  type VendorResponse,
} from "@/services/vendorService";

interface VendorCardData extends VendorResponse {
  uptime?: number;
  history?: { uptime_percentage_24h: number; avg_latency_ms_24h: number };
}

function vendorStatusColor(vendor: VendorCardData): string {
  if (!vendor.history) return "#52525B";
  const up = vendor.history.uptime_percentage_24h;
  if (up >= 99.9) return "#16A34A";
  if (up >= 99) return "#D97706";
  return "#DC2626";
}

function vendorStatusLabel(vendor: VendorCardData): string {
  if (!vendor.history) return "Unknown";
  const up = vendor.history.uptime_percentage_24h;
  if (up >= 99.9) return "Operational";
  if (up >= 99) return "Degraded";
  return "Down";
}

function SparklinePlaceholder() {
  // Simple SVG sparkline visual placeholder
  const points = [12, 10, 14, 11, 15, 13, 16, 14, 15, 13, 16, 15, 14, 16, 15, 14, 15, 16, 15, 14];
  const w = 120;
  const h = 32;
  const step = w / (points.length - 1);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const pathD = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-8" preserveAspectRatio="none">
      <path
        d={pathD}
        fill="none"
        stroke="#0891B2"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

export default function VendorsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [vendors, setVendors] = useState<VendorCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitoringVendor, setMonitoringVendor] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    vendorService
      .listPublicVendors()
      .then(async (list) => {
        if (cancelled) return;
        // Fetch history for each vendor to get uptime
        const enriched = await Promise.allSettled(
          list.slice(0, 6).map(async (v) => {
            try {
              const history = await vendorService.getVendorHistory(v.vendor_name);
              return { ...v, history };
            } catch {
              return { ...v, history: undefined };
            }
          })
        );
        if (cancelled) return;
        const results = enriched
          .filter((r) => r.status === "fulfilled")
          .map((r) => (r as PromiseFulfilledResult<VendorCardData>).value);
        setVendors(results);
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load vendors.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleMonitor = (vendorName: string) => {
    setMonitoringVendor(vendorName);
    // TODO: Create dependency from vendor — API integration pending
    setTimeout(() => {
      setMonitoringVendor(null);
    }, 1500);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32 bg-[#1A1A20]" />
          <Skeleton className="h-4 w-56 bg-[#1A1A20]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[180px] rounded-xl bg-[#1A1A20]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">Vendors</h1>
        <p className="text-[12px] text-[#A1A1AA] mt-1">
          Monitor public vendor reliability
        </p>
      </div>

      {/* Error */}
      {error && (
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
      )}

      {/* Vendor Grid */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {vendors.map((vendor) => {
            const statusColor = vendorStatusColor(vendor);
            const statusLabel = vendorStatusLabel(vendor);
            const uptime = vendor.history?.uptime_percentage_24h;
            const latency = vendor.history?.avg_latency_ms_24h;

            return (
              <div
                key={vendor.id}
                className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5 flex flex-col gap-4 hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                {/* Top: name + status */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#FAFAFA] truncate">
                      {vendor.display_name || vendor.vendor_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span
                        className="text-[11px]"
                        style={{ color: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-medium uppercase tracking-[0.08em] px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.04)",
                      color: "#A1A1AA",
                    }}
                  >
                    {vendor.category}
                  </span>
                </div>

                {/* Sparkline placeholder */}
                <SparklinePlaceholder />

                {/* Metrics row */}
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                      Uptime
                    </p>
                    <p
                      className="text-[13px] font-mono font-medium tabular-nums mt-0.5"
                      style={{ color: uptime != null ? statusColor : "#52525B" }}
                    >
                      {uptime != null ? `${uptime.toFixed(2)}%` : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                      Avg latency
                    </p>
                    <p className="text-[13px] font-mono font-medium text-[#FAFAFA] tabular-nums mt-0.5">
                      {latency != null ? `${Math.round(latency)}ms` : "--"}
                    </p>
                  </div>
                </div>

                {/* Monitor button */}
                <button
                  onClick={() => handleMonitor(vendor.vendor_name)}
                  disabled={monitoringVendor === vendor.vendor_name}
                  className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {monitoringVendor === vendor.vendor_name ? (
                    <>
                      <Activity
                        className="h-3.5 w-3.5 animate-spin"
                      />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Monitor this vendor
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state fallback */}
      {!error && vendors.length === 0 && !loading && (
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-10 text-center">
          <div
            className="mx-auto mb-4 w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <Activity className="h-8 w-8" style={{ color: "#52525B" }} strokeWidth={1.5} />
          </div>
          <p className="text-sm text-[#FAFAFA] font-medium">No vendors available</p>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-md mx-auto">
            Public vendor reliability data will appear here once available.
          </p>
        </div>
      )}
    </div>
  );
}
