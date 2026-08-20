"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";

// Partner Network scoped theme provider.
// The source partner-network app configured this in its root layout; on main
// the root layout is shared with the whole product, so the provider is scoped
// to the (partner) route group instead. Main's pages do not use next-themes
// or semantic dark-mode tokens, so this stays fully isolated.
export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
