"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoAutoEntry() {
  const router = useRouter();
  const [status, setStatus] = useState("Opening demo workspace...");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { enableDemoMode } = await import("@/lib/demo");
        enableDemoMode();
        try { window.dispatchEvent(new Event("reliastra:demo-change")); } catch {}
        setStatus("Demo ready — redirecting to dashboard…");
        await new Promise((r) => setTimeout(r, 300));
        if (!cancelled) router.replace("/dashboard");
      } catch {
        if (!cancelled) setStatus("Could not start demo. Try the button on the login page.");
      }
    })();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-10 h-10 rounded-xl bg-[#0891B2]/15 border border-[#0891B2]/20 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-5 h-5 text-[#0891B2] animate-spin" />
        </div>
        <h1 className="text-lg font-semibold text-[#FAFAFA]">Demo Workspace</h1>
        <p className="text-sm text-[#A1A1AA] mt-1">{status}</p>
        <p className="text-xs text-[#52525B] mt-3 font-mono">demo@reliastra.design / demo · no backend · mocked data</p>
      </div>
    </div>
  );
}
