"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Check, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useClients } from "@/hooks/useApi";
import { NAV_ITEMS, isActivePath } from "./nav";
import { cn } from "@/lib/utils";

const ACTIVE_CLIENT_KEY = "reliastra_active_client";

/* ── Agency client switcher ─────────────────────────────────────────────── */

function ClientSwitcher() {
  const { currentOrg } = useAuth();
  const { data: clients = [] } = useClients();
  const [open, setOpen] = React.useState(false);
  const [selectedName, setSelectedName] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setSelectedName(localStorage.getItem(ACTIVE_CLIENT_KEY));
    }
  }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentOrg?.has_agency_mode) return null;

  const selectClient = (name: string | null) => {
    if (typeof window === "undefined") return;
    if (name) localStorage.setItem(ACTIVE_CLIENT_KEY, name);
    else localStorage.removeItem(ACTIVE_CLIENT_KEY);
    setOpen(false);
    // Full page reload of scoped data per spec.
    window.location.reload();
  };

  return (
    <div className="shrink-0" ref={ref}>
      <div className="px-4 pt-4 pb-1">
        <span className="text-[11px] uppercase tracking-[0.05em] text-[#6B7280]">Client</span>
      </div>
      <div className="relative mx-3 mb-3">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2 rounded-md bg-[#111827] border border-[#1F2937] px-3 py-2 cursor-pointer hover:border-[#374151] transition-colors text-left"
        >
          <span className="text-sm font-medium text-[#F9FAFB] truncate">
            {selectedName || "All clients"}
          </span>
          <ChevronDown
            className={cn("h-3.5 w-3.5 text-[#6B7280] shrink-0 transition-transform", open && "rotate-180")}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg bg-[#111827] border border-[#1F2937] shadow-[0_4px_24px_rgba(0,0,0,0.4)] py-1">
            <button
              onClick={() => selectClient(null)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors text-left"
            >
              <span className="flex-1 truncate">All clients</span>
              {!selectedName && <Check className="h-4 w-4 text-[#3B82F6]" />}
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => selectClient(client.name)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition-colors text-left"
              >
                <span className="flex-1 truncate">{client.name}</span>
                {selectedName === client.name && <Check className="h-4 w-4 text-[#3B82F6]" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Nav list ───────────────────────────────────────────────────────────── */

function NavList({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden rs-scroll py-1">
      {NAV_ITEMS.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        if (collapsed) {
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "relative flex h-10 items-center justify-center mx-3 my-0.5 rounded-md transition-colors",
                active
                  ? "bg-[#111827]"
                  : "hover:bg-[#111827]"
              )}
              style={active ? { boxShadow: "inset 2px 0 0 0 #3B82F6" } : undefined}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "text-[#3B82F6]" : "text-[#6B7280]")} />
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex h-10 items-center rounded-md mx-3 my-0.5 px-4 transition-colors",
              active ? "bg-[#111827]" : "hover:bg-[#111827] group"
            )}
            style={active ? { boxShadow: "inset 2px 0 0 0 #3B82F6" } : undefined}
          >
            <Icon
              className={cn(
                "h-[18px] w-[18px] mr-3 shrink-0",
                active ? "text-[#3B82F6]" : "text-[#6B7280] group-hover:text-[#9CA3AF]"
              )}
            />
            <span
              className={cn(
                "text-sm truncate",
                active ? "text-[#F9FAFB] font-medium" : "text-[#9CA3AF] group-hover:text-[#F9FAFB]"
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

/* ── Sidebar ────────────────────────────────────────────────────────────── */

export interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
  React.useEffect(() => {
    onCloseMobile();
  }, [pathname]);

  const content = (
    <div className="flex h-full flex-col bg-[#0B0F19]">
      <ClientSwitcher />
      <NavList collapsed={collapsed} />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar (hidden on mobile) */}
      <aside
        className={cn(
          "hidden md:block fixed left-0 top-14 z-40 border-r border-[#1F2937] bg-[#0B0F19] transition-[width] duration-200 ease-out",
          collapsed ? "w-16" : "w-[220px]"
        )}
        style={{ height: "calc(100vh - 56px)" }}
      >
        {content}
      </aside>

      {/* Mobile slide-over */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onCloseMobile}
          />
          <aside
            className="absolute left-0 top-0 h-full w-[260px] bg-[#0B0F19] border-r border-[#1F2937] shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
          >
            <button
              onClick={onCloseMobile}
              className="absolute top-3 right-3 p-1 rounded-md text-[#6B7280] hover:text-[#F9FAFB] transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="pt-14 h-full">{content}</div>
          </aside>
        </div>
      )}
    </>
  );
}
