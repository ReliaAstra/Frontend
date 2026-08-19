import { useQuery } from "@tanstack/react-query";
import {
  vendorService,
  type VendorResponse,
} from "@/services/vendorService";

export interface VendorSnapshot {
  vendor_name: string;
  display_name: string;
  category: string;
  status: string;
  latency_ms: number | null;
  uptime_24h: number | null;
  last_check_at: string | null;
  status_code: number | null;
  points: { timestamp: string; latency_ms: number; is_up: boolean }[];
}

async function loadSnapshot(vendor: VendorResponse): Promise<VendorSnapshot> {
  const [detail, history, timeline] = await Promise.allSettled([
    vendorService.getVendorDetail(vendor.vendor_name),
    vendorService.getVendorHistory(vendor.vendor_name),
    vendorService.getVendorTimeline(vendor.vendor_name, "1h", "1m"),
  ]);

  const d = detail.status === "fulfilled" ? detail.value : null;
  const h = history.status === "fulfilled" ? history.value : null;
  const tl = timeline.status === "fulfilled" ? timeline.value : null;

  const latency =
    tl?.current?.latency_ms ??
    h?.avg_latency_ms_24h ??
    null;

  let status = d?.recent_status || "unknown";
  if (tl?.current?.is_up === false) status = "down";

  return {
    vendor_name: vendor.vendor_name,
    display_name: vendor.display_name,
    category: vendor.category,
    status,
    latency_ms: latency != null ? Math.round(latency) : null,
    uptime_24h: h?.uptime_percentage_24h ?? null,
    last_check_at: vendor.last_check_at ?? tl?.current?.timestamp ?? null,
    status_code: tl?.current?.status_code ?? null,
    points: (tl?.points ?? []).slice(-24).map((p) => ({
      timestamp: p.timestamp,
      latency_ms: Math.round(p.avg_latency_ms),
      is_up: p.is_up,
    })),
  };
}

export function usePublicVendorLive(limit = 6) {
  return useQuery({
    queryKey: ["vendors", "live-snapshots", limit],
    queryFn: async () => {
      const list = await vendorService.listPublicVendors(Math.max(limit, 12));
      const slice = list.slice(0, limit);
      return Promise.all(slice.map(loadSnapshot));
    },
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}

export function statusTone(status: string): "ok" | "warn" | "down" | "unknown" {
  const s = status.toLowerCase();
  if (s === "up" || s === "operational") return "ok";
  if (s.includes("degrad") || s.includes("partial")) return "warn";
  if (s.includes("down") || s.includes("outage") || s === "major_outage") return "down";
  return "unknown";
}
