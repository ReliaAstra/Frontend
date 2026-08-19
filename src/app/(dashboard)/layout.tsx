"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "@/components/Providers";
import { TopBar } from "@/components/shell/TopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { CommandPalette } from "@/components/shell/CommandPalette";
import { useUiStore } from "@/lib/uiStore";
import { cn } from "@/lib/utils";

const PAGE_LABELS: { match: (p: string) => boolean; label: string }[] = [
  { match: (p) => p === "/dashboard", label: "Dashboard" },
  { match: (p) => p === "/dependencies" || p.startsWith("/dependencies/"), label: "Dependencies" },
  { match: (p) => p === "/incidents" || p.startsWith("/incidents/"), label: "Incidents" },
  { match: (p) => p === "/evidence" || p.startsWith("/evidence/"), label: "Evidence" },
  { match: (p) => p === "/settings" || p.startsWith("/settings/"), label: "Settings" },
  { match: (p) => p === "/vendors" || p.startsWith("/vendors/"), label: "Vendors" },
  { match: (p) => p === "/agency" || p.startsWith("/agency/"), label: "Agency" },
  { match: (p) => p === "/clients" || p.startsWith("/clients/"), label: "Clients" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const pushRecentPage = useUiStore((s) => s.pushRecentPage);

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      // Spec breakpoints: icon-only sidebar on tablet (768–1024), full on desktop.
      if (w >= 768 && w < 1024) setCollapsed(true);
      else if (w >= 1024) setCollapsed(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Track recent pages for the command palette.
  React.useEffect(() => {
    const found = PAGE_LABELS.find((p) => p.match(pathname));
    if (found) pushRecentPage({ label: found.label, href: pathname });
  }, [pathname, pushRecentPage]);

  const handleMenuClick = () => {
    if (isMobile) setMobileOpen(true);
    else setCollapsed((v) => !v);
  };

  const marginLeft = isMobile ? 0 : collapsed ? 64 : 220;

  return (
    <Providers>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B0F19]">
          <TopBar onMenuClick={handleMenuClick} />
          <Sidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <main
            className="min-h-[calc(100vh-56px)]"
            style={{
              marginLeft,
              marginTop: 56,
              paddingTop: isMobile ? 16 : 32,
              paddingBottom: isMobile ? 48 : 64,
              paddingLeft: isMobile ? 16 : 32,
              paddingRight: isMobile ? 16 : 32,
            }}
          >
            <div
              key={pathname}
              className="rs-fade-in mx-auto max-w-[1440px]"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {children}
            </div>
          </main>

          <CommandPalette />
        </div>
      </AuthProvider>
    </Providers>
  );
}
