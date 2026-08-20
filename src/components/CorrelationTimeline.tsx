"use client";

import { usePublicVendorLive, statusTone } from "@/hooks/usePublicVendorLive";

export function CorrelationTimeline() {
  const { data: vendors, isLoading, isError, refetch } = usePublicVendorLive(4);
  const maxLatency = Math.max(1, ...(vendors ?? []).map((v) => v.latency_ms ?? 0));

  return (
    <div className="relative w-full max-w-2xl mx-auto py-4 px-2">
      <p className="text-center text-xs text-white/40 mb-6 font-mono">
        Live 1-hour averages from public vendor endpoints
      </p>

      {isLoading && <p className="text-center text-sm text-white/50">Loading live probes…</p>}
      {isError && (
        <p className="text-center text-sm text-white/50">
          Could not load vendor timelines.{" "}
          <button type="button" onClick={() => refetch()} className="text-[#67E8F9]">
            Retry
          </button>
        </p>
      )}

      <div className="space-y-4">
        {vendors?.map((v) => {
          const tone = statusTone(v.status);
          const bar =
            tone === "down" ? "bg-[#DC2626]" : tone === "warn" ? "bg-[#D97706]" : "bg-[#0891B2]";
          const width = v.latency_ms != null ? Math.max(8, (v.latency_ms / maxLatency) * 100) : 8;
          return (
            <div key={v.vendor_name} className="flex items-center gap-4">
              <div className="w-28 text-right text-xs text-[#A1A1AA] truncate">{v.display_name}</div>
              <div className="flex-1 relative h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <div
                  className={`absolute inset-y-1 left-1 rounded-md ${bar} opacity-80`}
                  style={{ width: `${width}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-[10px] text-white/70 font-mono capitalize">
                    {v.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-[12px] text-[#67E8F9] font-mono">
                    {v.latency_ms != null ? `${v.latency_ms}ms` : "—"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
