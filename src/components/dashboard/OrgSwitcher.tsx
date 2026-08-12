"use client";

import { ChevronDown, Building2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { Org } from "@/lib/auth-context";

export function OrgSwitcher({ currentOrg }: { currentOrg: Org | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#1A1D27] transition-colors"
      >
        <Building2 className="h-4 w-4 text-[#64748B]" />
        <span className="text-[#F1F5F9] font-medium">{currentOrg?.name || "Select Org"}</span>
        <ChevronDown className="h-4 w-4 text-[#64748B]" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-[#2A2D3A] bg-[#1A1D27] shadow-xl py-1 z-50">
          <div className="px-3 py-2 text-xs text-[#64748B] uppercase tracking-wider">Organizations</div>
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#F1F5F9] bg-[#141B2D]"
          >
            <Building2 className="h-4 w-4 text-[#3B82F6]" />
            {currentOrg?.name || "Acme Corp"}
          </button>
        </div>
      )}
    </div>
  );
}
