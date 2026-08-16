"use client";

import { useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Shield, Check, AlertTriangle } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────

interface LiveVendor {
  vendor: string;
  slug: string;
  status: "operational" | "degraded" | "down";
  latency_ms: number;
  status_code: number;
}

// ── Canvas Sparkline ─────────────────────────────────────────────────────

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

    // Gradient fill
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

    // Line
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

// ── Status Dot with Pulse ──────────────────────────────────────────────

function StatusDot({ status, size = 8 }: { status: "operational" | "degraded" | "down"; size?: number }) {
  const color =
    status === "operational" ? "#16A34A" : status === "degraded" ? "#D97706" : "#DC2626";

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {status === "operational" && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color, animationDuration: "2s" }}
        />
      )}
    </span>
  );
}

// ── Live Left Panel ────────────────────────────────────────────────────

function LiveLeftPanel() {
  const [vendors, setVendors] = useState<LiveVendor[]>([]);
  const [mounted, setMounted] = useState(false);
  const [counter, setCounter] = useState(0);
  const [showIncident, setShowIncident] = useState(false);
  const fetchedRef = useRef(false);

  // Generate initial vendor data
  const initVendors = useCallback(() => {
    return [
      { vendor: "auth0", slug: "auth0", status: "operational" as const, latency_ms: 128, status_code: 200 },
      { vendor: "cloudflare", slug: "cloudflare", status: "operational" as const, latency_ms: 244, status_code: 200 },
      { vendor: "openai", slug: "openai", status: "operational" as const, latency_ms: 312, status_code: 200 },
      { vendor: "stripe", slug: "stripe", status: "operational" as const, latency_ms: 186, status_code: 200 },
      { vendor: "twilio", slug: "twilio", status: "operational" as const, latency_ms: 209, status_code: 200 },
    ];
  }, []);

  // Tick latencies every 3s
  useEffect(() => {
    const v = initVendors();
    setVendors(v);
    setMounted(true);

    const tickInterval = setInterval(() => {
      setVendors((prev) =>
        prev.map((v) => {
          const base: Record<string, number> = {
            auth0: 128,
            cloudflare: 244,
            openai: 312,
            stripe: 186,
            twilio: 209,
          };
          const variance = (Math.random() - 0.5) * 0.3;
          const newLatency = Math.round(base[v.slug] * (1 + variance));
          return { ...v, latency_ms: Math.max(20, newLatency) };
        })
      );
    }, 3000);

    // Status dot changes every 5-10s
    const statusInterval = setInterval(() => {
      setVendors((prev) =>
        prev.map((v) => {
          if (v.slug === "openai") {
            // 8% chance of degraded
            if (Math.random() < 0.08) return { ...v, status: "degraded" as const, status_code: 502 };
            return { ...v, status: "operational" as const, status_code: 200 };
          }
          return v;
        })
      );
    }, 7000);

    return () => {
      clearInterval(tickInterval);
      clearInterval(statusInterval);
    };
  }, [initVendors]);

  // Counter animation
  useEffect(() => {
    const target = 12847;
    const duration = 2000;
    const start = Date.now();
    const step = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      // Spring easing
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounter(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  // Incident card loop: 6s
  useEffect(() => {
    const timeout = setTimeout(() => setShowIncident(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  // Sparkline data (deterministic)
  const sparkAuth0 = [120, 135, 118, 142, 128, 125, 140, 132, 118, 130];
  const sparkCloudflare = [230, 260, 240, 250, 244, 255, 235, 248, 260, 244];

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0A0A0F]">
      {/* Grid background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Wordmark */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-8 left-8 z-20"
      >
        <span className="text-xl font-bold tracking-[-0.02em] text-[#FAFAFA]">
          reliastra<span style={{ color: "#0891B2", fontSize: "24px", verticalAlign: "super" }}>.</span>
        </span>
      </motion.div>

      {/* Live Counter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute top-8 right-8 z-20 text-right"
      >
        <p className="text-2xl font-bold text-[#FAFAFA] tabular-nums">{counter.toLocaleString()}<span className="text-[#0891B2]">.</span></p>
        <p className="text-xs text-[#52525B] mt-1">incidents correlated this month</p>
      </motion.div>

      {/* Cards Grid */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between py-24 px-8">

        {/* Card 1 — Vendor Status (auth0) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[380px]"
          style={{ animation: "float 4s ease-in-out infinite", animationDelay: "0s" }}
        >
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#52525B] uppercase tracking-wider">auth0 API</p>
              <StatusDot status={vendors[0]?.status || "operational"} />
            </div>
            <p className="font-mono text-2xl font-bold text-[#FAFAFA]">{vendors[0]?.latency_ms || 128}<span className="text-sm text-[#52525B]">ms</span></p>
            <p className="text-[11px] text-[#52525B] font-mono mt-0.5">
              HTTP {vendors[0]?.status_code || 200} · 01:26 AM PDT
            </p>
            <div className="mt-2">
              <SparklineCanvas data={sparkAuth0} color="rgb(8, 145, 178)" />
            </div>
          </div>
        </motion.div>

        {/* Card 2 — Evidence Record */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-[380px] ml-16"
          style={{ animation: "float 4s ease-in-out infinite", animationDelay: "0.5s" }}
        >
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 backdrop-blur-sm p-4">
            <p className="text-xs text-[#52525B] uppercase tracking-wider">Evidence Record</p>
            <p className="font-mono text-lg font-bold text-[#FAFAFA] mt-1">INC-3761</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Check className="h-3.5 w-3.5 text-[#16A34A]" />
              <p className="text-[11px] text-[#16A34A] font-mono">SHA-256 · Verified</p>
            </div>
          </div>
        </motion.div>

        {/* Card 3 — Vendor Status (cloudflare) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-[380px] ml-8"
          style={{ animation: "float 4s ease-in-out infinite", animationDelay: "1s" }}
        >
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#52525B] uppercase tracking-wider">cloudflare API</p>
              <StatusDot status={vendors[1]?.status || "operational"} />
            </div>
            <p className="font-mono text-2xl font-bold text-[#FAFAFA]">{vendors[1]?.latency_ms || 244}<span className="text-sm text-[#52525B]">ms</span></p>
            <p className="text-[11px] text-[#52525B] font-mono mt-0.5">
              HTTP {vendors[1]?.status_code || 200} · 01:26 AM PDT
            </p>
            <div className="mt-2">
              <SparklineCanvas data={sparkCloudflare} color="rgb(8, 145, 178)" />
            </div>
          </div>
        </motion.div>

        {/* Card 4 — Incident (animated in/out on 6s loop) */}
        <AnimatePresence>
          {showIncident && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="max-w-[380px] ml-auto mr-8"
            >
              <div className="rounded-xl border border-[#DC2626]/20 bg-[#131318]/90 backdrop-blur-sm p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">INCIDENT DETECTED</p>
                <p className="text-sm font-semibold text-[#FAFAFA] mt-1">Stripe EU — Latency spike</p>
                <p className="text-[11px] text-[#A1A1AA] font-mono mt-1">14:02 UTC · Confidence 94%</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card 5 — Case Study */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.0 }}
          className="max-w-[380px] ml-4"
          style={{ animation: "float 4s ease-in-out infinite", animationDelay: "1.5s" }}
        >
          <div className="rounded-xl border border-[#0891B2]/15 bg-[#131318]/90 backdrop-blur-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0891B2]">CASE STUDY</p>
            <p className="text-sm font-semibold text-[#FAFAFA] mt-2">How Vercel recovered $12K in SLA credits</p>
            <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
              Reliastra identified 14 vendor-caused outages that internal monitoring missed.
            </p>
            <p className="text-lg font-bold text-[#67E8F9] mt-3">$12,400 recovered</p>
          </div>
        </motion.div>

        {/* Card 6 — Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 3.0 }}
          className="max-w-[380px] ml-auto mr-8"
          style={{ animation: "float 4s ease-in-out infinite", animationDelay: "2s" }}
        >
          <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#131318]/90 backdrop-blur-sm p-5">
            <p className="text-sm text-[#FAFAFA]/80 italic leading-relaxed">
              &ldquo;We recovered $4,200 in SLA credits in our first month. The evidence reports are bulletproof.&rdquo;
            </p>
            <p className="text-xs text-[#52525B] mt-3">— Sarah Chen, VP Engineering</p>
          </div>
        </motion.div>

        {/* Live Observations Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#52525B]">
            LIVE OBSERVATIONS
          </p>
          <div className="flex flex-wrap gap-2">
            {mounted && vendors.length > 0 ? (
              vendors.map((v) => (
                <div
                  key={v.slug}
                  className="flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-3 py-1.5"
                >
                  <StatusDot status={v.status} size={6} />
                  <span className="text-[11px] font-medium text-[#A1A1AA]">{v.vendor}</span>
                  <span
                    className={cn(
                      "text-[11px] font-mono tabular-nums transition-colors duration-300",
                      v.status === "operational" ? "text-[#67E8F9]" : v.status === "degraded" ? "text-amber-400" : "text-red-400"
                    )}
                  >
                    {v.latency_ms}ms
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-3 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/20" />
                <span className="text-[11px] font-medium text-[#52525B]">Connecting...</span>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#52525B] mt-2 font-mono">
            Independent monitoring from 12 global locations
          </p>
        </motion.div>
      </div>

      {/* Floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes float {
            0%, 100% { transform: none; }
          }
        }
      `}</style>
    </div>
  );
}

// ── Mobile Header Strip ────────────────────────────────────────────────

function MobileHeaderStrip() {
  const [vendors, setVendors] = useState<LiveVendor[]>([]);

  useEffect(() => {
    setVendors([
      { vendor: "auth0", slug: "auth0", status: "operational", latency_ms: 128, status_code: 200 },
      { vendor: "cloudflare", slug: "cloudflare", status: "operational", latency_ms: 244, status_code: 200 },
      { vendor: "stripe", slug: "stripe", status: "operational", latency_ms: 186, status_code: 200 },
      { vendor: "openai", slug: "openai", status: "operational", latency_ms: 312, status_code: 200 },
      { vendor: "twilio", slug: "twilio", status: "operational", latency_ms: 209, status_code: 200 },
    ]);

    const tick = setInterval(() => {
      setVendors((prev) =>
        prev.map((v) => ({
          ...v,
          latency_ms: Math.max(20, v.latency_ms + Math.round((Math.random() - 0.5) * 30)),
        }))
      );
    }, 3000);
    return () => clearInterval(tick);
  }, []);

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
              key={v.slug}
              className="flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[#131318]/80 px-2.5 py-1 shrink-0"
            >
              <StatusDot status={v.status} size={6} />
              <span className="text-[10px] font-medium text-[#A1A1AA]">{v.vendor}</span>
              <span className={cn(
                "text-[10px] font-mono tabular-nums",
                v.status === "operational" ? "text-[#67E8F9]" : v.status === "degraded" ? "text-amber-400" : "text-red-400"
              )}>
                {v.latency_ms}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Auth Card Shell ──────────────────────────────────────────────────────

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

// ── Main Layout ──────────────────────────────────────────────────────────

export default function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Left panel: dense product demo (desktop) */}
      <div className="hidden lg:flex lg:w-[45%]">
        <LiveLeftPanel />
      </div>

      {/* Mobile: compact strip */}
      <MobileHeaderStrip />

      {/* Right panel: form */}
      <div className="flex flex-1 items-center justify-center px-6 py-10 lg:py-0">
        <div className="relative w-full">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
          {/* Terms links: outside form card, bottom-right */}
          <p className="hidden lg:block absolute -bottom-6 right-0 text-xs text-[#A1A1AA] hover:text-[#52525B] transition-colors">
            <a href="/privacy" className="hover:underline">Privacy Policy</a>{" · "}
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}
