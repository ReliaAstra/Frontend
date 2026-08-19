"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/lib/auth-context";
import { Providers } from "@/components/Providers";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DemoBanner } from "@/components/demo/DemoBanner";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ---------- responsive detection ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const toggleCollapse = () => setCollapsed((v) => !v);

  return (
    <Providers>
      <AuthProvider>
        <DemoBanner />
        <div className="min-h-screen bg-[#0A0A0F]">
          {/* Sidebar — separate on desktop, overlay on mobile */}
          <DashboardSidebar
            collapsed={collapsed}
            onToggleCollapse={toggleCollapse}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

          {/* Main content area */}
          <div
            className={cn(
              "transition-[margin] duration-200 ease-out",
              isMobile ? "ml-0" : collapsed ? "ml-[72px]" : "ml-[260px]"
            )}
          >
            {/* Sticky header */}
            <DashboardHeader
              sidebarCollapsed={collapsed}
              onToggleSidebar={toggleCollapse}
              onOpenMobileSidebar={() => setMobileOpen(true)}
            />

            {/* Page content with AnimatePresence */}
            <main className="p-8 min-h-[calc(100vh-56px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

        {/* Mobile sidebar backdrop is rendered by DashboardSidebar */}
      </AuthProvider>
    </Providers>
  );
}
