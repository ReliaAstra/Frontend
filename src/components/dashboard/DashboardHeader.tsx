"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  ChevronRight,
  Menu,
  Zap,
  X,
  AlertTriangle,
  Activity,
  FileText,
  Radio,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { PAGE_TITLES } from "@/components/dashboard/DashboardSidebar";
import { useRealtime, type RealtimeEvent } from "@/hooks/useRealtime";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Notification event item                                            */
/* ------------------------------------------------------------------ */

function NotifEventItem({ event }: { event: RealtimeEvent }) {
  const iconMap: Record<string, { icon: typeof AlertTriangle; color: string }> = {
    "incident.new": { icon: AlertTriangle, color: "#DC2626" },
    "incident.resolved": { icon: Activity, color: "#16A34A" },
    "incident.updated": { icon: AlertTriangle, color: "#D97706" },
    "check.completed": { icon: Activity, color: "#0891B2" },
    "dependency.down": { icon: AlertTriangle, color: "#DC2626" },
    "dependency.recovered": { icon: Activity, color: "#16A34A" },
    "evidence.generated": { icon: FileText, color: "#8B5CF6" },
  };

  const config = iconMap[event.type] || { icon: Activity, color: "#52525B" };
  const Icon = config.icon;
  const label = event.type.replace(".", " ").replace(/_/g, " ");

  return (
    <div className="px-4 py-2.5 flex items-start gap-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors border-b border-[rgba(255,255,255,0.03)] last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${config.color}15` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[#FAFAFA] capitalize">{label}</p>
        <p className="text-[10px] text-[#52525B] mt-0.5">
          {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </p>
      </div>
    </div>
  );
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
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Real-time events
  const { events, hasUnread, clearEvents, status: realtimeStatus } = useRealtime({
    events: ["incident.new", "incident.resolved", "check.completed", "dependency.down", "dependency.recovered", "evidence.generated"],
    interval: 8000,
  });

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

        {/* Notification bell with real-time events */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPanel((v) => !v)}
            className="relative p-2 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-[18px] h-[18px]" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#DC2626] animate-pulse-dot" />
            )}
          </button>

          {/* Notification dropdown panel */}
          {showNotifPanel && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#131318] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#FAFAFA]">Live Updates</h3>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                      realtimeStatus === "connected" || realtimeStatus === "polling"
                        ? "bg-[rgba(22,163,74,0.15)] text-[#16A34A]"
                        : "bg-[rgba(220,38,38,0.15)] text-[#DC2626]"
                    )}>
                      <Radio className="w-2.5 h-2.5" />
                      {realtimeStatus === "connected" || realtimeStatus === "polling" ? "Live" : "Offline"}
                    </span>
                  </div>
                  {hasUnread && (
                    <button
                      onClick={clearEvents}
                      className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto console-scroll">
                  {events.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Activity className="w-8 h-8 text-[#52525B] mx-auto mb-2" />
                      <p className="text-xs text-[#52525B]">No new events. Polling every 8s.</p>
                    </div>
                  ) : (
                    events.slice(0, 15).map((event, i) => (
                      <NotifEventItem key={`${event.timestamp}-${i}`} event={event} />
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

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
