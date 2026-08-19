"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Beaker, LogOut, ExternalLink } from "lucide-react";
import { isDemoMode, disableDemoMode } from "@/lib/demo";

export function DemoBanner() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setShow(isDemoMode());
    const onStorage = () => setShow(isDemoMode());
    window.addEventListener("storage", onStorage);
    // also poll for same-tab changes via custom event
    const onDemoChange = () => setShow(isDemoMode());
    window.addEventListener("reliastra:demo-change" as any, onDemoChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("reliastra:demo-change" as any, onDemoChange);
    };
  }, []);

  if (!show) return null;

  const handleExit = () => {
    disableDemoMode();
    window.dispatchEvent(new Event("reliastra:demo-change"));
    router.push("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0891B2] to-[#0E7490] text-white border-b border-[rgba(255,255,255,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
            <Beaker className="w-3 h-3" />
            Demo Mode
          </span>
          <span className="hidden sm:inline text-xs text-white/90 truncate">
            Offline workspace — no backend calls. All data is mocked for design testing.
          </span>
          <span className="sm:hidden text-xs text-white/90 truncate">Offline · mocked data</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-white/80 font-mono bg-black/10 rounded px-2 py-1">
            demo@reliastra.design / demo
          </span>
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 bg-white text-[#0891B2] hover:bg-white/90 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Exit demo
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoLoginCard({ onEnter }: { onEnter?: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const enterDemo = async () => {
    setLoading(true);
    try {
      const { enableDemoMode } = await import("@/lib/demo");
      enableDemoMode();
      window.dispatchEvent(new Event("reliastra:demo-change"));
      if (onEnter) onEnter();
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#0891B2]/20 bg-gradient-to-br from-[#0891B2]/[0.08] to-[#0E7490]/[0.06] p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#0891B2]/15 border border-[#0891B2]/20 flex items-center justify-center shrink-0">
          <Beaker className="w-4 h-4 text-[#0891B2]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#09090B]">Try the demo workspace</h3>
          <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
            Explore the full dashboard with a demo org. No password, no backend — all data is mocked locally so you can test designs instantly.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={enterDemo}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-[#09090B] text-white hover:bg-[#1C1C22] rounded-lg px-4 py-2 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Opening..." : "Open demo workspace"}
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[11px] text-[#A1A1AA] font-mono">demo@reliastra.design / demo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
