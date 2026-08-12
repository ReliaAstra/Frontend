"use client";

import { Bell, Search, Command } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { OrgSwitcher } from "./OrgSwitcher";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const { user, currentOrg } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <OrgSwitcher currentOrg={currentOrg} />
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search dependencies, incidents..."
            className="w-72 h-8 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-md text-[13px] pl-9 pr-8"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-0.5 text-[10px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Help */}
        <button className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors" title="Help">
          <Search className="h-4 w-4" strokeWidth={1.8} />
        </button>

        {/* Notifications */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors" title="Notifications">
          <Bell className="h-4 w-4" strokeWidth={1.8} />
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-bold text-white">
            1
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#0891B2] text-white text-xs font-medium">
          {user?.full_name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}
