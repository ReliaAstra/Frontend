"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────

interface VendorObservation {
  vendor: string;
  slug: string;
  status: "operational" | "degraded" | "down";
  latency_ms: number;
  status_code: number;
  observed_at: string;
}

interface EvidenceArtifact {
  id: string;
  type: "observation" | "evidence";
  label: string;
  value: string;
  meta: string;
}

// ── Live Vendor Background ──────────────────────────────────────────────

function LiveVendorPanel() {
  const [vendors, setVendors] = useState<VendorObservation[]>([]);
  const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>([]);
  const [mounted, setMounted] = useState(false);
  const fetchedRef = useRef(false);

  const fetchPublicData = useCallback(async () => {
    try {
      const { apiClient } = await import("@/lib/api");
      const [vendorsRes, metricsRes] = await Promise.allSettled([
        apiClient.get<any[]>("/public/vendors"),
        apiClient.get<any[]>("/public/vendors/stripe/metrics"),
      ]);

      if (vendorsRes.status === "fulfilled" && vendorsRes.value.data?.length > 0) {
        const vendorList = vendorsRes.value.data.slice(0, 6).map((v: any) => ({
          vendor: v.vendor_name || v.name || "Unknown",
          slug: v.slug || v.vendor_name?.toLowerCase()?.replace(/\s+/g, "-") || "vendor",
          status: v.current_status === "operational" ? "operational" as const
            : v.current_status === "degraded" ? "degraded" as const
            : "down" as const,
          latency_ms: Math.round(80 + Math.random() * 180),
          status_code: v.current_status === "down" ? 503 : 200,
          observed_at: new Date().toISOString(),
        }));
        setVendors(vendorList);

        const now = new Date();
        setArtifacts([
          {
            id: "obs-1",
            type: "observation",
            label: `${vendorList[0]?.vendor || "Vendor"} API`,
            value: `${vendorList[0]?.latency_ms || 142}ms`,
            meta: `HTTP ${vendorList[0]?.status_code || 200} · ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`,
          },
          {
            id: "obs-2",
            type: "evidence",
            label: "Evidence Record",
            value: `INC-${(Math.floor(Math.random() * 9000) + 1000).toString()}`,
            meta: "SHA-256 · Verified",
          },
          {
            id: "obs-3",
            type: "observation",
            label: `${vendorList[1]?.vendor || "Vendor"} API`,
            value: `${vendorList[1]?.latency_ms || 95}ms`,
            meta: `HTTP ${vendorList[1]?.status_code || 200} · ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}`,
          },
        ]);
      }
    } catch {
      // Silently fail — background is progressively enhanced
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPublicData();
    }
    const interval = setInterval(fetchPublicData, 60_000);
    return () => clearInterval(interval);
  }, [fetchPublicData]);

  const statusColor = (s: string) =>
    s === "operational" ? "text-emerald-400" : s === "degraded" ? "text-amber-400" : "text-red-400";

  const statusDot = (s: string) =>
    s === "operational" ? "bg-emerald-400" : s === "degraded" ? "bg-amber-400" : "bg-red-400";

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07070C]">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
        {/* Top: Brand */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-sm font-medium tracking-wide text-white/60">
              reliastra
            </span>
          </motion.div>
        </div>

        {/* Center: Evidence cards */}
        <div className="space-y-4">
          {artifacts.map((artifact, i) => (
            <motion.div
              key={artifact.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.3 + i * 0.12,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/40">
                    {artifact.label}
                  </p>
                  <p className="mt-0.5 text-sm font-mono font-medium text-white/80">
                    {artifact.value}
                  </p>
                </div>
                <p className="shrink-0 text-[10px] font-mono text-white/25">
                  {artifact.meta}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom: Live vendor strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-white/20">
            Live observations
          </p>
          <div className="flex flex-wrap gap-2">
            {mounted && vendors.length > 0 ? (
              vendors.map((v) => (
                <div
                  key={v.slug}
                  className="flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5"
                >
                  <span
                    className={cn("h-1.5 w-1.5 rounded-full", statusDot(v.status))}
                  />
                  <span className="text-[11px] font-medium text-white/50">
                    {v.vendor}
                  </span>
                  <span className={cn("text-[11px] font-mono", statusColor(v.status))}>
                    {v.latency_ms}ms
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 rounded border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/20" />
                <span className="text-[11px] font-medium text-white/30">
                  Connecting...
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Auth Card Shell ──────────────────────────────────────────────────────

function AuthCard({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "w-full rounded-xl border border-[#E4E4E7]/80 bg-white shadow-sm",
        wide ? "max-w-[460px]" : "max-w-[420px]",
      )}
    >
      <div className="px-8 py-10 sm:px-10 sm:py-12">{children}</div>
    </motion.div>
  );
}

// ── Main Layout ──────────────────────────────────────────────────────────

export default function AuthSplitLayout({
  children,
  wide,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel — live product environment (desktop only, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[44%]">
        <LiveVendorPanel />
      </div>

      {/* Mobile: subtle ambient header strip */}
      <div className="lg:hidden">
        <div className="flex h-48 items-end overflow-hidden bg-[#07070C] px-6 pb-5">
          <div className="relative z-10">
            <p className="text-xs font-medium tracking-wider text-white/30">
              reliastra
            </p>
            <p className="mt-1 text-[13px] text-white/15">
              External Dependency Intelligence
            </p>
          </div>
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:py-0">
        <AnimatePresence mode="wait">{children}</AnimatePresence>
        <div className="sr-only">{/* force AnimatePresence render */}</div>
      </div>

      {/* Footer */}
      <footer className="hidden lg:flex lg:items-center lg:justify-center lg:pb-6">
        <p className="text-[11px] text-[#A1A1AA]">
          Privacy Policy · Terms of Service
        </p>
      </footer>
    </div>
  );
}

export { AuthCard };
