"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { OrgSwitcher } from "./OrgSwitcher";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const { user, currentOrg } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#1E2433] bg-[#0F1117]/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <OrgSwitcher currentOrg={currentOrg} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <Input
            placeholder="Search dependencies, incidents..."
            className="w-64 h-9 bg-[#1A1D27] border-[#2A2D3A] text-[#F1F5F9] placeholder:text-[#64748B] rounded-lg text-sm pl-9"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-[#1A1D27] border border-[#2A2D3A] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
            1
          </span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6366F1] text-white text-sm font-medium">
          {user?.full_name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}
