"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Globe,
  Bell,
  Key,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Check,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import type { Org } from "@/lib/auth-context";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DashboardSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Navigation definition                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Monitoring",
    items: [
      { label: "Dependencies", href: "/dependencies", icon: Layers },
      { label: "Incidents", href: "/incidents", icon: AlertTriangle },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Evidence", href: "/evidence", icon: ShieldCheck },
      { label: "Vendors", href: "/vendors", icon: Globe },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Notifications", href: "/settings?tab=notifications", icon: Bell },
      { label: "API Keys", href: "/settings?tab=api-keys", icon: Key },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Breadcrumb title map                                               */
/* ------------------------------------------------------------------ */

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dependencies": "Dependencies",
  "/incidents": "Incidents",
  "/evidence": "Evidence",
  "/vendors": "Vendors",
  "/settings": "Settings",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DashboardSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  setMobileOpen,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, currentOrg, logout } = useAuth();

  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ---------- media-query detection ---------- */
  const updateBreakpoints = useCallback(() => {
    const w = window.innerWidth;
    setIsMobile(w < 768);
    setIsTablet(w >= 768 && w < 1024);
  }, []);

  useEffect(() => {
    updateBreakpoints();
    window.addEventListener("resize", updateBreakpoints);
    return () => window.removeEventListener("resize", updateBreakpoints);
  }, [updateBreakpoints]);

  /* ---------- close mobile sidebar on route change ---------- */
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* ---------- fetch orgs when dropdown opens ---------- */
  useEffect(() => {
    if (orgDropdownOpen && orgs.length === 0) {
      apiClient
        .get<Org[]>("/orgs")
        .then(({ data }) => setOrgs(data || []))
        .catch(() => {});
    }
  }, [orgDropdownOpen, orgs.length]);

  /* ---------- close org dropdown on outside click ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- helpers ---------- */
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  /* ---------- computed sidebar width ---------- */
  const sidebarWidth = isMobile
    ? 260
    : collapsed
      ? 72
      : 260;

  /* ================================================================== */
  /*  Render                                                            */
  /* ================================================================== */

  const sidebarContent = (
    <div
      className={cn(
        "flex flex-col h-full bg-[#0A0A0F] overflow-hidden",
        isMobile && "w-[260px]"
      )}
      style={{ width: isMobile ? 260 : undefined }}
    >
      {/* ---- Top: Logo ---- */}
      <div
        className={cn(
          "flex items-center py-5 shrink-0",
          collapsed && !isMobile ? "justify-center px-2" : "px-6"
        )}
      >
        <span className="text-lg font-bold text-[#FAFAFA] tracking-tight select-none">
          reliastra<span className="text-[#0891B2]">.</span>
        </span>
      </div>

      {/* ---- Org Switcher ---- */}
      {!collapsed || isMobile ? (
        <div className="mx-6 mb-4 shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setOrgDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-[#131318] rounded-lg border border-[rgba(255,255,255,0.06)] px-3 py-2.5 text-left hover:border-[rgba(255,255,255,0.12)] transition-colors"
          >
            <span className="text-sm font-medium text-[#FAFAFA] truncate">
              {currentOrg?.name || "Select org"}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-[#52525B] shrink-0 transition-transform",
                orgDropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {orgDropdownOpen && (
            <div className="absolute z-50 mt-1 w-56 bg-[#131318] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-xl shadow-black/40 py-1">
              {orgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setOrgDropdownOpen(false);
                    // org switching would require auth context extension
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors",
                    org.id === currentOrg?.id
                      ? "text-[#FAFAFA]"
                      : "text-[#A1A1AA]"
                  )}
                >
                  <span className="truncate flex-1 text-left">{org.name}</span>
                  {org.id === currentOrg?.id && (
                    <Check className="w-4 h-4 text-[#0891B2] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-[#131318] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-[#0891B2] font-mono">
            {currentOrg?.name?.[0]?.toUpperCase() || "?"}
          </span>
        </div>
      )}

      {/* ---- Navigation ---- */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mt-2">
            {/* Section header — hide in collapsed mode */}
            {(!collapsed || isMobile) && (
              <div className="px-6 py-2 text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                {group.title}
              </div>
            )}

            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return collapsed && !isMobile ? (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={cn(
                    "relative flex items-center justify-center mx-auto w-11 h-11 rounded-lg transition-all duration-150",
                    active
                      ? "text-[#FAFAFA] bg-[rgba(255,255,255,0.05)]"
                      : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.03)]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#0891B2] rounded-r-full" />
                  )}
                  <Icon className="w-[18px] h-[18px]" />
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-4 py-2 mx-3 rounded-lg text-sm transition-all duration-150",
                    active
                      ? "text-[#FAFAFA] bg-[rgba(255,255,255,0.05)]"
                      : "text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.03)]"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#0891B2] rounded-r-full" />
                  )}
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ---- Bottom: User card ---- */}
      {(!collapsed || isMobile) && user ? (
        <div className="px-4 py-3 mx-3 mt-auto mb-4 rounded-xl bg-[#131318] border border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center shrink-0">
              <span className="font-mono text-xs font-bold text-white">
                {getInitials(user.full_name || user.email)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#FAFAFA] truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-[#52525B] truncate">{user.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-[#52525B] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        collapsed &&
        !isMobile &&
        user && (
          <div className="mx-auto mb-4">
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[#52525B] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        )
      )}
    </div>
  );

  /* ================================================================== */
  /*  Mobile: overlay + hamburger                                        */
  /* ================================================================== */
  if (isMobile) {
    return (
      <>
        {/* Hamburger trigger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3.5 left-4 z-50 p-2 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.05)] transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            "fixed top-0 left-0 z-50 h-full transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ width: 260 }}
        >
          {/* Close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-3 p-1 rounded-lg text-[#52525B] hover:text-[#FAFAFA] transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
          {sidebarContent}
        </aside>
      </>
    );
  }

  /* ================================================================== */
  /*  Desktop / Tablet: inline sidebar                                   */
  /* ================================================================== */
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-30 h-screen flex flex-col bg-[#0A0A0F] border-r border-[rgba(255,255,255,0.06)] transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Collapse toggle (tablet+ only) */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-7 z-10 w-6 h-6 rounded-full bg-[#131318] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#52525B] hover:text-[#FAFAFA] hover:border-[rgba(255,255,255,0.15)] transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            collapsed ? "rotate-180" : ""
          )}
        />
      </button>

      {sidebarContent}
    </aside>
  );
}

export { PAGE_TITLES };
