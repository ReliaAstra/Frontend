"use client";

import { formatDistanceToNow } from "date-fns";
import { usePublicVendorLive, statusTone } from "@/hooks/usePublicVendorLive";

function formatCheck(iso: string | null): string {
  if (!iso) return "Awaiting first check";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}

export function IncidentCorrelationCard() {
  const { data: vendors, isLoading, isError, refetch } = usePublicVendorLive(5);

  return (
    <div className="bg-white rounded-2xl border border-[#E4E4E7] shadow-[0_4px_24px_rgba(0,0,0,0.06)] w-full max-w-[440px] mx-auto md:mx-0 p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#A1A1AA]">
        Live public checks
      </p>
      <h3 className="text-[18px] font-bold text-[#09090B] mt-1 leading-tight">
        Independent vendor latency
      </h3>
      <p className="text-[13px] text-[#A1A1AA] mt-1 font-mono">
        From Reliastra probes · refreshes every 15s
      </p>

      <hr className="border-0 h-px bg-[#E4E4E7] my-4" />

      {isLoading && (
        <p className="text-sm text-[#71717A]">Loading live measurements…</p>
      )}
      {isError && (
        <div className="text-sm text-[#52525B]">
          Unable to reach the public vendor API.{" "}
          <button type="button" onClick={() => refetch()} className="text-[#0891B2] font-medium">
            Retry
          </button>
        </div>
      )}
      {!isLoading && !isError && (!vendors || vendors.length === 0) && (
        <p className="text-sm text-[#71717A]">No public vendors published yet.</p>
      )}

      <ul className="space-y-3">
        {vendors?.map((v) => {
          const tone = statusTone(v.status);
          const color =
            tone === "ok" ? "text-[#16A34A]" : tone === "warn" ? "text-[#D97706]" : tone === "down" ? "text-[#DC2626]" : "text-[#71717A]";
          return (
            <li key={v.vendor_name} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-[#09090B] truncate">{v.display_name}</p>
                <p className="text-[12px] text-[#A1A1AA] font-mono mt-0.5">
                  {formatCheck(v.last_check_at)}
                  {v.status_code != null ? ` · HTTP ${v.status_code}` : ""}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-[15px] font-semibold text-[#09090B]">
                  {v.latency_ms != null ? `${v.latency_ms}ms` : "—"}
                </p>
                <p className={`text-[11px] font-medium capitalize ${color}`}>{v.status.replace(/_/g, " ")}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <a
        href="/track"
        className="mt-5 block w-full bg-[#0891B2] text-white py-3 rounded-[10px] font-semibold text-[14px] text-center hover:bg-[#0E7490] transition-colors"
      >
        Open public tracking
      </a>
    </div>
  );
}
