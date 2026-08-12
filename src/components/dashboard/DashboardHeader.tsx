"use client";

import { Bell, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { OrgSwitcher } from "./OrgSwitcher";
import { Input } from "@/components/ui/input";

export function DashboardHeader() {
  const { user, currentOrg } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        <OrgSwitcher currentOrg={currentOrg} />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search dependencies, incidents..."
            className="w-64 h-9 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-lg text-sm pl-9"
          />
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-gray-500 hover:text-gray-900 transition-colors">
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
