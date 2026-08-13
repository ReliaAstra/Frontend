"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, Layers, AlertTriangle, Shield, Settings, LogOut, Search,
  HelpCircle, Bell, UserCircle, ChevronDown, Users, Database, FileText, Key,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  section: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
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
    section: "INTELLIGENCE",
    items: [
      { label: "Evidence", href: "#", icon: Shield },
      { label: "Vendors", href: "#", icon: Database },
    ],
  },
  {
    section: "OPERATIONS",
    items: [
      { label: "Notifications", href: "/settings", icon: Bell },
      { label: "API Keys", href: "/settings", icon: Key },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, currentOrg, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col bg-white border-r border-[#E4E4E7]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5 border-b border-[#E4E4E7]">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0891B2]">
          <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-semibold text-[#09090B] tracking-tight">Reliastra</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-[#A1A1AA]">
              {group.section}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors relative",
                      active
                        ? "bg-[#0891B2]/8 text-[#0891B2]"
                        : "text-[#52525B] hover:bg-[#F8F9FA] hover:text-[#09090B]"
                    )}
                  >
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#0891B2]" />
                    )}
                    <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-[#E4E4E7] px-3 py-3">
        <div className="flex items-center gap-2.5 px-1 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0891B2] text-white text-xs font-medium">
            {user?.full_name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#09090B] truncate leading-tight">
              {user?.full_name || "User"}
            </p>
            <p className="text-[11px] text-[#A1A1AA] truncate capitalize leading-tight">
              {currentOrg?.name || "Organization"}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-[#52525B] hover:bg-[#F8F9FA] hover:text-[#09090B] transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
