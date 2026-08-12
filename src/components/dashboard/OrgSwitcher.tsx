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
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] hover:bg-gray-50 transition-colors"
      >
        <Building2 className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.8} />
        <span className="text-gray-900 font-medium">{currentOrg?.name || "Select Org"}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-md border border-gray-200 bg-white shadow-lg py-1 z-50">
          <div className="px-3 py-2 text-[11px] text-gray-400 uppercase tracking-wider">Organizations</div>
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-3 py-2 text-[13px] text-gray-900 bg-[#0891B2]/8"
          >
            <Building2 className="h-3.5 w-3.5 text-[#0891B2]" />
            {currentOrg?.name || "Acme Corp"}
          </button>
        </div>
      )}
    </div>
  );
}
