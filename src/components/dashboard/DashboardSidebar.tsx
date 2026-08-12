"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Layers, AlertTriangle, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "OVERVIEW",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
    ],
  },
  {
    section: "MONITORING",
    items: [
      { label: "Dependencies", href: "/dependencies", icon: Layers },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
    ],
  },
  {
    section: "SYSTEM",
    items: [
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, currentOrg, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-[#0B0F1A] border-r border-[#1E2433]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-[#1E2433]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366F1]">
          <Shield className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="text-lg font-semibold text-[#F1F5F9] tracking-tight">Reliastra</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-[#64748B]">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors relative",
                      active
                        ? "bg-[#141B2D] text-[#F1F5F9]"
                        : "text-[#94A3B8] hover:bg-[#141B2D] hover:text-[#F1F5F9]"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#3B82F6]" />
                    )}
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-[#1E2433] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6366F1] text-white text-sm font-medium">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F1F5F9] truncate">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-[#64748B] truncate capitalize">
              {currentOrg?.role || "Member"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#94A3B8] hover:bg-[#141B2D] hover:text-[#F1F5F9] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
