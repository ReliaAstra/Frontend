"use client";

import { format } from "date-fns";
import { BrowserMockup } from "@/components/BrowserMockup";
import { usePublicVendorLive } from "@/hooks/usePublicVendorLive";

export function EvidenceReportPreview() {
  const { data: vendors, isLoading, isError } = usePublicVendorLive(1);
  const vendor = vendors?.[0];
  const points = vendor?.points.slice(-6) ?? [];

  return (
    <BrowserMockup
      url={vendor ? `reliastra.com/track/${vendor.vendor_name}` : "reliastra.com/track"}
      className="max-w-md"
    >
      <div className="relative p-5 space-y-4 bg-white">
        <div className="border-b border-[#E4E4E7] pb-3">
          <p className="text-[10px] text-[#A1A1AA] font-mono uppercase tracking-wider">
            Live observation
          </p>
          <p className="text-sm font-bold text-[#09090B]">
            {vendor?.display_name ?? "Public vendor"}
          </p>
        </div>

        {isLoading && <p className="text-sm text-[#71717A]">Loading latest check…</p>}
        {isError && <p className="text-sm text-[#71717A]">Public vendor API unavailable.</p>}

        {vendor && (
          <>
            <div className="bg-[#F8F9FA] rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#52525B]">Status</span>
                <span className="font-semibold text-[#09090B] capitalize">
                  {vendor.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#52525B]">Latency</span>
                <span className="font-semibold text-[#09090B]">
                  {vendor.latency_ms != null ? `${vendor.latency_ms} ms` : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#52525B]">24h uptime</span>
                <span className="font-semibold text-[#09090B]">
                  {vendor.uptime_24h != null ? `${vendor.uptime_24h.toFixed(2)}%` : "—"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Recent 1h samples
              </p>
              {points.length === 0 && (
                <p className="text-[11px] text-[#71717A]">No timeline samples yet.</p>
              )}
              {points.map((p) => (
                <div key={p.timestamp} className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-[#A1A1AA] w-28 shrink-0">
                    {format(new Date(p.timestamp), "HH:mm:ss")} UTC
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      p.is_up ? "bg-[#16A34A]" : "bg-[#DC2626]"
                    }`}
                  />
                  <span className="text-[#52525B]">{p.latency_ms} ms</span>
                </div>
              ))}
            </div>

            <a
              href={`/track/${vendor.vendor_name}`}
              className="block text-center text-xs font-semibold text-[#0891B2] hover:underline"
            >
              View full public history
            </a>
          </>
        )}
      </div>
    </BrowserMockup>
  );
}
