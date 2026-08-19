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
  title: "RELIASTRA Partner Network — Earn 30% Recurring Commission",
  description:
    "Share RELIASTRA with people who depend on critical infrastructure. Earn 30% recurring commission on every referred customer, every month they remain subscribed.",
  keywords: [
    "RELIASTRA",
    "partner program",
    "referral program",
    "recurring commission",
    "infrastructure",
    "operations intelligence",
    "partner network",
  ],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "RELIASTRA Partner Network — Earn 30% Recurring Commission",
    description:
      "Share RELIASTRA with people who depend on critical infrastructure. Earn 30% recurring commission every month.",
    siteName: "RELIASTRA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RELIASTRA Partner Network",
    description:
      "Earn 30% recurring commission. Share RELIASTRA with people who need critical infrastructure intelligence.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
