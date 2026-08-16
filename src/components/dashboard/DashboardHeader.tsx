"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronRight,
  Menu,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { PAGE_TITLES } from "@/components/dashboard/DashboardSidebar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb helper                                                  */
/* ------------------------------------------------------------------ */

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [];

  let accumulated = "";
  for (const segment of segments) {
    accumulated += `/${segment}`;
    // Skip dynamic segments in display, use the PAGE_TITLES map
    const label = PAGE_TITLES[accumulated] || null;
    if (label) {
      crumbs.push({ label, href: accumulated });
    } else if (segment.startsWith("[")) {
      // dynamic segment — just add the raw segment decoded
      crumbs.push({ label: segment.replace(/[\[\]]/g, ""), href: accumulated });
    } else {
      // capitalize segment
      crumbs.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: accumulated,
      });
    }
  }

  return crumbs;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardHeader({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const { user, currentOrg } = useAuth();

  const crumbs = buildBreadcrumbs(pathname);
  const pageTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : "Dashboard";

  const showUpgradePill =
    currentOrg && (currentOrg.plan === "free" || currentOrg.plan === "starter");

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center h-14 px-6 bg-[#0A0A0F] border-b border-[rgba(255,255,255,0.06)] gap-4",
        !sidebarCollapsed ? "pl-6" : "pl-6"
      )}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-1.5 min-w-0 shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={onOpenMobileSidebar}
          className="mr-1 p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-[#52525B] shrink-0" />
            )}
            {i < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="text-sm text-[#52525B] hover:text-[#A1A1AA] transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-[#FAFAFA] truncate">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-[400px] max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525B]" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full h-9 bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] rounded-lg pl-9 pr-4 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Upgrade pill */}
        {showUpgradePill && (
          <Link
            href="/settings?tab=plan"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0891B2]/10 border border-[#0891B2]/20 text-[#0891B2] text-xs font-medium hover:bg-[#0891B2]/15 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Upgrade
          </Link>
        )}

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-[18px] h-[18px]" />
          {/* Unread dot — static for now */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0891B2]" />
        </button>

        {/* User avatar */}
        {user && (
          <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-white">
              {getInitials(user.full_name || user.email)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
