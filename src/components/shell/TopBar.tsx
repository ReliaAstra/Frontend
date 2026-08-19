"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, User, Building2, CreditCard, LogOut, Activity } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useUiStore } from "@/lib/uiStore";
import { useRealtime } from "@/hooks/useRealtime";
import { isDemoMode, disableDemoMode } from "@/lib/demo";
import { incidentRef, reportRef } from "./nav";
import { cn } from "@/lib/utils";

/* ── Demo indicator ─────────────────────────────────────────────────────── */

function DemoPill() {
  const router = useRouter();
  const [demo, setDemo] = React.useState(false);

  React.useEffect(() => {
    setDemo(isDemoMode());
    const onStorage = () => setDemo(isDemoMode());
    window.addEventListener("storage", onStorage);
    window.addEventListener("reliastra:demo-change" as never, onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("reliastra:demo-change" as never, onStorage);
    };
  }, []);

  if (!demo) return null;

  const exit = () => {
    disableDemoMode();
    window.dispatchEvent(new Event("reliastra:demo-change"));
    router.push("/login");
  };

  return (
    <button
      onClick={exit}
      title="Exit demo workspace"
      className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-2.5 py-1 text-[11px] font-medium text-[#F59E0B] hover:bg-[#F59E0B]/15 transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
      Demo
    </button>
  );
}

/* ── Breadcrumb builder ─────────────────────────────────────────────────── */

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  dependencies: "Dependencies",
  incidents: "Incidents",
  evidence: "Evidence",
  settings: "Settings",
  vendors: "Vendors",
  agency: "Agency",
  clients: "Clients",
};

function buildCrumbs(pathname: string): { label: string; href: string; active: boolean }[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string; active: boolean }[] = [];

  // Breadcrumb always roots at the dashboard.
  crumbs.push({ label: "Dashboard", href: "/dashboard", active: segments.length === 0 });

  let acc = "";
  segments.forEach((segment, i) => {
    acc += `/${segment}`;
    const last = i === segments.length - 1;
    let label: string;
    if (SEGMENT_LABELS[segment]) {
      label = SEGMENT_LABELS[segment];
    } else if (i === 1 && segments[0] === "incidents") {
      label = incidentRef(segment);
    } else if (i === 1 && segments[0] === "evidence") {
      label = reportRef(segment);
    } else if (i === 1 && segments[0] === "dependencies") {
      label = segment;
    } else {
      label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    crumbs.push({ label, href: acc, active: last });
  });

  return crumbs;
}

/* ── User menu ──────────────────────────────────────────────────────────── */

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const initials = (user.full_name || user.email || "U")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const items = [
    { label: "Profile", icon: User, href: "/settings/account" },
    { label: "Organization", icon: Building2, href: "/settings/team" },
    { label: "Billing", icon: CreditCard, href: "/settings/billing" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="block rounded-full focus:outline-none"
        aria-label="Account menu"
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F2937] border border-[#374151] overflow-hidden"
          style={{ width: 32, height: 32 }}
        >
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-semibold text-[#F9FAFB]">{initials}</span>
          )}
        </span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 min-w-[180px] rounded-lg bg-[#111827] border border-[#1F2937] shadow-[0_4px_24px_rgba(0,0,0,0.4)] py-1"
          onClick={() => setOpen(false)}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors text-left"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          <div className="my-1 h-px bg-[#1F2937]" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Notifications ──────────────────────────────────────────────────────── */

function NotificationBell() {
  const { events, hasUnread, clearEvents } = useRealtime({
    events: [
      "incident.new",
      "incident.resolved",
      "check.completed",
      "dependency.down",
      "dependency.recovered",
      "evidence.generated",
    ],
    interval: 8000,
  });
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = events.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-1.5 text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {hasUnread && (
          <span
            className="absolute rounded-full bg-[#EF4444]"
            style={{ width: 6, height: 6, top: -2, right: -2 }}
          />
        )}
        {count > 9 && (
          <span
            className="absolute bg-[#EF4444] text-white text-[10px] rounded-full px-1 flex items-center justify-center"
            style={{ height: 14, lineHeight: "14px", top: -6, right: -8 }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg bg-[#111827] border border-[#1F2937] shadow-[0_4px_24px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
            <h3 className="text-sm font-semibold text-[#F9FAFB]">Notifications</h3>
            {hasUnread && (
              <button
                onClick={clearEvents}
                className="text-xs text-[#6B7280] hover:text-[#F9FAFB] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto rs-scroll">
            {events.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Activity className="w-8 h-8 text-[#374151] mx-auto mb-2" />
                <p className="text-xs text-[#6B7280]">Silence is signal. Nothing new.</p>
              </div>
            ) : (
              events.slice(0, 15).map((event, i) => (
                <div
                  key={`${event.timestamp}-${i}`}
                  className="px-4 py-2.5 border-b border-[#1F2937] last:border-0 hover:bg-[#1F2937] transition-colors"
                >
                  <p className="text-xs font-medium text-[#F9FAFB] capitalize">
                    {event.type.replace(".", " · ").replace(/_/g, " ")}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Top bar ────────────────────────────────────────────────────────────── */

export function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const openCommandPalette = useUiStore((s) => s.openCommandPalette);
  const crumbs = buildCrumbs(pathname);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-[#1F2937] bg-[#0B0F19] px-6"
      style={{ height: 56 }}
    >
      {/* Left: wordmark (+ hamburger on mobile) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="-ml-1 p-1.5 rounded-md text-[#9CA3AF] hover:text-[#F9FAFB]"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <Link href="/dashboard" className="select-none">
          <span
            className="font-semibold text-[#F9FAFB]"
            style={{ fontFamily: "var(--font-geist-sans)", fontSize: 18, letterSpacing: "-0.02em" }}
          >
            Reliastra
          </span>
        </Link>
      </div>

      {/* Center: breadcrumb */}
      <div className="flex-1 flex justify-center px-4 min-w-0">
        <nav className="hidden md:flex items-center text-sm whitespace-nowrap overflow-hidden">
          {crumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <span className="text-[#374151] mx-1.5">/</span>}
              {crumb.active ? (
                <span className="text-[#F9FAFB]">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: demo · ⌘K · bell · avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <DemoPill />
        <button
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-1.5 rounded border border-[#374151] px-1.5 py-0.5 text-[#6B7280] hover:border-[#9CA3AF] transition-colors cursor-pointer"
          style={{ fontFamily: "var(--font-geist-mono)", fontSize: 11 }}
        >
          <Search className="h-3 w-3" />
          <span>⌘K</span>
        </button>
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
