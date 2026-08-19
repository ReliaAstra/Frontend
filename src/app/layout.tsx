import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

// Self-hosted fonts via Fontsource (no network access required at build time).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
// Geist — the dashboard's primary typeface (Geist Sans + Geist Mono).
import "@fontsource-variable/geist/index.css";
import "@fontsource-variable/geist-mono/index.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://reliastra.com'),
  title: "Reliastra: External Dependency Intelligence",
  description:
    "Monitor third-party APIs independently. When vendors fail, generate timestamped SLA evidence reports to claim credits and prove fault.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          offset={{ top: 72, right: 24 }}
          duration={4000}
          closeButton
        />
      </body>
    </html>
  );
}
