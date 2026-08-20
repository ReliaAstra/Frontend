import type { Metadata } from "next";
import { PartnerApp } from "@/components/partner/partner-app";

// The Partner Network lives under /partner/* on the main app (the middleware
// rewrites the partners.reliastra.com subdomain onto these paths). One optional
// catch-all mounts the partner SPA; PartnerApp maps each slug to a PartnerPage.
// The middleware rewrite means the same pages are served on the partner
// subdomain at the root (e.g. partners.reliastra.com/earn -> /partner/earn).

type PageMeta = { title: string; description: string; canonical?: boolean };

const PAGE_META: Record<string, PageMeta> = {
  "": {
    title: "RELIASTRA Partner Network — Earn 30% Recurring Commission",
    description:
      "Share RELIASTRA with people who depend on critical infrastructure. Earn 30% recurring commission on every referred customer, every month they remain subscribed.",
    canonical: true,
  },
  earn: {
    title: "Ways to Earn — RELIASTRA Partner Network",
    description:
      "Referrals, deployments, content and integrations — four ways to earn recurring commission in the RELIASTRA Partner Network.",
    canonical: true,
  },
  "how-it-works": {
    title: "How It Works — RELIASTRA Partner Network",
    description:
      "From referral link to monthly payout: track every click, signup and commission in real time.",
    canonical: true,
  },
  commission: {
    title: "Commission Structure — RELIASTRA Partner Network",
    description:
      "A transparent 30% recurring commission on every subscription you refer, for the lifetime of the customer.",
    canonical: true,
  },
  faq: {
    title: "FAQ — RELIASTRA Partner Network",
    description: "Answers to the most common questions about the RELIASTRA Partner Network.",
    canonical: true,
  },
  resources: {
    title: "Partner Resources — RELIASTRA Partner Network",
    description: "Brand assets, messaging guides and templates for RELIASTRA partners.",
    canonical: true,
  },
  apply: {
    title: "Apply — RELIASTRA Partner Network",
    description: "Apply to the RELIASTRA Partner Network and start earning recurring commission.",
    canonical: true,
  },
  login: {
    title: "Partner Login — RELIASTRA Partner Network",
    description: "Sign in to your RELIASTRA partner dashboard.",
  },
  signup: {
    title: "Create Partner Account — RELIASTRA Partner Network",
    description: "Create a RELIASTRA partner account and apply to the Partner Network.",
  },
  activation: {
    title: "Activate Your Partner Account — RELIASTRA Partner Network",
    description: "Your RELIASTRA partner application has been received.",
  },
  "forgot-password": {
    title: "Reset Password — RELIASTRA Partner Network",
    description: "Request a password reset for your RELIASTRA partner account.",
  },
  support: {
    title: "Partner Support — RELIASTRA Partner Network",
    description: "Get help from the RELIASTRA partner team.",
  },
  privacy: {
    title: "Privacy Policy — RELIASTRA Partner Network",
    description: "How the RELIASTRA Partner Network handles your data.",
  },
  terms: {
    title: "Partner Terms — RELIASTRA Partner Network",
    description: "Terms and conditions of the RELIASTRA Partner Network.",
  },
  dashboard: { title: "Dashboard — RELIASTRA Partner Network", description: "Your partner overview." },
  referrals: { title: "Referrals — RELIASTRA Partner Network", description: "Track your referrals." },
  earnings: { title: "Earnings — RELIASTRA Partner Network", description: "Your commission earnings." },
  payouts: { title: "Payouts — RELIASTRA Partner Network", description: "Your payout history." },
  settings: { title: "Settings — RELIASTRA Partner Network", description: "Your partner settings." },
};

const slugToKey = (slug: string[] | undefined): string => {
  if (!slug || slug.length === 0) return "";
  if (slug.length === 2 && slug[0] === "dashboard" && PAGE_META[slug[1]]) {
    return slug[1];
  }
  return PAGE_META[slug[0]] ? slug[0] : "";
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = PAGE_META[slugToKey(slug)] ?? PAGE_META[""];
  const canonicalPath = slug && slug.length > 0 ? `/${slug.join("/")}` : "";

  return {
    title: meta.title,
    description: meta.description,
    ...(meta.canonical
      ? {
          alternates: {
            canonical: `https://partners.reliastra.com${canonicalPath}`,
          },
        }
      : {}),
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://partners.reliastra.com${canonicalPath}`,
      siteName: "RELIASTRA Partner Network",
      type: "website",
      images: [{ url: "/partner-network-og.svg" }],
    },
  };
}

export default async function PartnerCatchAllPage() {
  return <PartnerApp />;
}
