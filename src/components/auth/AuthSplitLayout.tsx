"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { usePublicVendorLive, statusTone, type VendorSnapshot } from "@/hooks/usePublicVendorLive";

function asDotStatus(status: string): "operational" | "degraded" | "down" {
  const t = statusTone(status);
  if (t === "down") return "down";
  if (t === "warn") return "degraded";
  return "operational";
}

function checkedAgo(iso: string | null): string {
  if (!iso) return "pending";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "recent";
  }
}

function SparklineCanvas({ data, color }: { data: number[]; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const pad = 2;

    ctx.clearRect(0, 0, w, h);

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color.replace(")", ",0.2)").replace("rgb", "rgba"));
    grad.addColorStop(1, color.replace(")", ",0.0)").replace("rgb", "rgba"));

    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((data[i] - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / (data.length - 1)) * w;
      const y = h - pad - ((data[i] - min) / range) * (h - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [data, color]);

  return <canvas ref={canvasRef} className="w-full h-5" style={{ display: "block" }} />;
}

function StatusDot({ status, size = 8 }: { status: "operational" | "degraded" | "down"; size?: number }) {
  const color =
    status === "operational" ? "#16A34A" : status === "degraded" ? "#D97706" : "#DC2626";

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full" style={{ backgroundColor: color }} />
      {status === "operational" && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color, animationDuration: "2s" }}
        />
      )}
    </span>
  );
}

function VendorCard({ vendor, className }: { vendor: VendorSnapshot; className?: string }) {
  const spark = vendor.points.map((p) => p.latency_ms);
  return (
    <div className={cn("max-w-[380px]", className)}>
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-[#52525B] uppercase tracking-wider truncate">{vendor.display_name}</p>
          <StatusDot status={asDotStatus(vendor.status)} />
        </div>
        <p className="font-mono text-2xl font-bold text-[#FAFAFA]">
          {vendor.latency_ms ?? "—"}
          {vendor.latency_ms != null && <span className="text-sm text-[#52525B]">ms</span>}
        </p>
        <p className="text-[11px] text-[#52525B] font-mono mt-0.5">
          {vendor.status_code != null ? `HTTP ${vendor.status_code} · ` : ""}
          {checkedAgo(vendor.last_check_at)}
        </p>
        {spark.length > 1 && (
          <div className="mt-2">
            <SparklineCanvas data={spark} color="rgb(8, 145, 178)" />
          </div>
        )}
      </div>
    </div>
  );
}

function LiveLeftPanel() {
  const { data: vendors = [], isLoading } = usePublicVendorLive(5);
  const featured = vendors.slice(0, 2);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0A0F]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-8 left-8 z-20">
        <span className="text-xl font-bold tracking-[-0.02em] text-[#FAFAFA]">
          reliastra<span style={{ color: "#0891B2", fontSize: "24px", verticalAlign: "super" }}>.</span>
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-8 right-8 z-20 text-right"
      >
        <p className="text-2xl font-bold text-[#FAFAFA] tabular-nums">
          {isLoading ? "—" : vendors.length}
          <span className="text-[#0891B2]">.</span>
        </p>
        <p className="text-xs text-[#52525B] mt-1">public vendors monitored</p>
      </motion.div>

      <div className="absolute inset-0 z-10 flex flex-col justify-between py-24 px-8">
        {featured[0] && <VendorCard vendor={featured[0]} />}
        {featured[1] && <VendorCard vendor={featured[1]} className="ml-10" />}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#52525B]">
            Live observations
          </p>
          <div className="flex flex-wrap gap-2">
            {isLoading && (
              <div className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/20" />
                <span className="text-[11px] font-medium text-[#52525B]">Connecting…</span>
              </div>
            )}
            {vendors.map((v) => (
              <div
                key={v.vendor_name}
                className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-3 py-1.5"
              >
                <StatusDot status={asDotStatus(v.status)} size={6} />
                <span className="text-[11px] font-medium text-[#A1A1AA]">{v.display_name}</span>
                <span
                  className={cn(
                    "text-[11px] font-mono tabular-nums",
                    asDotStatus(v.status) === "operational"
                      ? "text-[#67E8F9]"
                      : asDotStatus(v.status) === "degraded"
                        ? "text-amber-400"
                        : "text-red-400",
                  )}
                >
                  {v.latency_ms != null ? `${v.latency_ms}ms` : "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[#52525B] mt-2 font-mono">
            Public Reliastra checks · updates every 15s
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function MobileHeaderStrip() {
  const { data: vendors = [] } = usePublicVendorLive(5);

  return (
    <div className="lg:hidden relative h-[180px] overflow-hidden bg-[#0A0A0F]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between p-6 pb-4">
        <span className="text-xl font-bold tracking-[-0.02em] text-[#FAFAFA]">
          reliastra<span style={{ color: "#0891B2", fontSize: "24px", verticalAlign: "super" }}>.</span>
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {vendors.map((v) => (
            <div
              key={v.vendor_name}
              className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-2.5 py-1 shrink-0"
            >
              <StatusDot status={asDotStatus(v.status)} size={6} />
              <span className="text-[10px] font-medium text-[#A1A1AA]">{v.display_name}</span>
              <span
                className={cn(
                  "text-[10px] font-mono tabular-nums",
                  asDotStatus(v.status) === "operational"
                    ? "text-[#67E8F9]"
                    : asDotStatus(v.status) === "degraded"
                      ? "text-amber-400"
                      : "text-red-400",
                )}
              >
                {v.latency_ms != null ? `${v.latency_ms}ms` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-[440px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] p-10 sm:p-10"
    >
      {children}
    </motion.div>
  );
}

export default function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div className="hidden lg:flex lg:w-[45%]">
        <LiveLeftPanel />
      </div>
      <MobileHeaderStrip />
      <div className="flex flex-1 items-center justify-center px-6 py-10 lg:py-0">
        <div className="relative w-full">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
          <p className="hidden lg:block absolute -bottom-6 right-0 text-xs text-[#A1A1AA] hover:text-[#52525B] transition-colors">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            {" · "}
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
