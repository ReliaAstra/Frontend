import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reliastra — External Dependency Intelligence",
  description:
    "Reliastra independently monitors the external services your infrastructure depends on, correlates vendor degradation with your incidents, and produces structured evidence of what happened outside your stack.",
  keywords: [
    "external dependency monitoring",
    "vendor intelligence",
    "infrastructure accountability",
    "incident correlation",
    "SLA evidence",
    "dependency tracking",
    "vendor monitoring",
    "SRE",
    "DevOps",
    "observability",
  ],
  authors: [{ name: "Reliastra" }],
  openGraph: {
    title: "Reliastra — External Dependency Intelligence",
    description:
      "Your site went down. Was it you, or your vendors? Independent monitoring, correlation, and evidence for external dependencies.",
    type: "website",
    siteName: "Reliastra",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reliastra — External Dependency Intelligence",
    description:
      "Your site went down. Was it you, or your vendors? Independent monitoring, correlation, and evidence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
