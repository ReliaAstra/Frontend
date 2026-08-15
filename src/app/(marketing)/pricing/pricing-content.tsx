"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// ── Easing ──────────────────────────────────────────────────────────────

const ease = [0.25, 0.1, 0.25, 1] as const;

// ── Tier Data ───────────────────────────────────────────────────────────
// Aligned with backend Paystack billing: GET /v1/orgs/{org_id}/billing/plan
// Backend plan values: "free", "starter", "standard", "professional", "agency"

const tiers = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    positioning: "Start measuring your dependencies.",
    dependencies: "3 monitored dependencies",
    capabilities: [
      "Custom endpoint URLs",
      "24-hour data retention",
      "Email alerts",
      "Basic incident detection",
      "Limited attribution preview",
      "1 evidence report / month",
    ],
    cta: "Start free",
    ctaStyle: "bg-white border border-[#E4E4E7] text-[#09090B] hover:bg-[#F8F9FA]",
    highlighted: false,
  },
  {
    key: "starter",
    name: "Starter",
    price: "$19",
    period: "/month",
    positioning: "Track more of your stack without committing to the full workflow.",
    dependencies: "10 monitored dependencies",
    capabilities: [
      "7-day data retention",
      "Email alerts",
      "Limited attribution",
      "Limited evidence generation",
      "Basic dependency history",
    ],
    cta: "Start Starter",
    ctaStyle: "bg-white border border-[#E4E4E7] text-[#09090B] hover:bg-[#F8F9FA]",
    highlighted: false,
  },
  {
    key: "standard",
    name: "Standard",
    price: "$49",
    period: "/month",
    positioning: "Investigate and prove dependency failures.",
    dependencies: "30 monitored dependencies",
    capabilities: [
      "Incident correlation",
      "Deterministic attribution",
      "Evidence generation",
      "PDF & JSON evidence",
      "Cryptographic verification",
      "Slack alerts",
      "API access",
      "Historical analysis",
    ],
    cta: "Start Standard",
    ctaStyle: "bg-[#0891B2] text-white hover:bg-[#0E7490]",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    key: "professional",
    name: "Professional",
    price: "$99",
    period: "/month",
    positioning: "Operate dependency intelligence at team scale.",
    dependencies: "100 monitored dependencies",
    capabilities: [
      "90-day data retention",
      "All notification channels",
      "Webhook integration",
      "Custom-branded evidence",
      "Faster check intervals",
      "Priority processing",
      "API access",
      "Advanced operational workflows",
    ],
    cta: "Start Professional",
    ctaStyle: "bg-[#0A0A0F] text-white hover:bg-[#1A1A2F]",
    highlighted: false,
  },
  {
    key: "agency",
    name: "Agency",
    price: "$199",
    period: "/month",
    positioning: "Manage reliability across your entire client portfolio.",
    dependencies: "500 monitored dependencies",
    capabilities: [
      "Client groups & isolation",
      "Per-client organization",
      "Client-facing dashboards",
      "Client-facing reports",
      "Agency branding",
      "Branded evidence",
      "Cross-client incident awareness",
      "Everything in Professional",
    ],
    cta: "Start Agency",
    ctaStyle: "bg-[#0A0A0F] text-white hover:bg-[#1A1A2F]",
    highlighted: false,
    badge: "Built for Agencies",
  },
];

// ── Comparison Rows ──────────────────────────────────────────────────────

type CellValue = string | boolean;

interface ComparisonRow {
  feature: string;
  free: CellValue;
  starter: CellValue;
  standard: CellValue;
  professional: CellValue;
  agency: CellValue;
}

const comparisonRows: ComparisonRow[] = [
  { feature: "Monitored dependencies", free: "3", starter: "10", standard: "30", professional: "100", agency: "500" },
  { feature: "Data retention", free: "24 hours", starter: "7 days", standard: "30 days", professional: "90 days", agency: "90 days" },
  { feature: "Custom endpoint URLs", free: true, starter: true, standard: true, professional: true, agency: true },
  { feature: "Email alerts", free: true, starter: true, standard: true, professional: true, agency: true },
  { feature: "Slack alerts", free: false, starter: false, standard: true, professional: true, agency: true },
  { feature: "Webhook integration", free: false, starter: false, standard: false, professional: true, agency: true },
  { feature: "PagerDuty", free: false, starter: false, standard: false, professional: true, agency: true },
  { feature: "API access", free: false, starter: false, standard: true, professional: true, agency: true },
  { feature: "Incident correlation", free: false, starter: false, standard: true, professional: true, agency: true },
  { feature: "Deterministic attribution", free: false, starter: false, standard: true, professional: true, agency: true },
  { feature: "Evidence generation", free: "1/month", starter: "Limited", standard: true, professional: true, agency: true },
  { feature: "Evidence formats", free: false, starter: false, standard: "PDF, JSON", professional: "PDF, JSON, Branded", agency: "PDF, JSON, Branded" },
  { feature: "Cryptographic verification", free: false, starter: false, standard: true, professional: true, agency: true },
  { feature: "Historical analysis", free: false, starter: "Basic", standard: true, professional: true, agency: true },
  { feature: "Check interval", free: "Standard", starter: "Standard", standard: "Standard", professional: "Faster", agency: "Faster" },
  { feature: "Priority processing", free: false, starter: false, standard: false, professional: true, agency: true },
  { feature: "Client management", free: false, starter: false, standard: false, professional: false, agency: true },
  { feature: "Client isolation", free: false, starter: false, standard: false, professional: false, agency: true },
  { feature: "Agency branding", free: false, starter: false, standard: false, professional: false, agency: true },
  { feature: "Support", free: "Community", starter: "Email", standard: "Priority email", professional: "Priority + chat", agency: "Dedicated" },
];

// ── FAQ ──────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How does billing work?",
    a: "All plans are billed monthly via Paystack. You can upgrade, downgrade, or cancel at any time from your organization settings. When upgrading, you're prorated for the remainder of the billing cycle. When downgrading, the new rate takes effect at the next billing cycle.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts. Cancel from your billing settings and your plan remains active until the end of the current billing period. Your data is retained according to your plan's retention policy after cancellation.",
  },
  {
    q: "What counts as a monitored dependency?",
    a: "A monitored dependency is a single endpoint URL you configure Reliastra to actively check. This could be a third-party API, a SaaS service, a payment provider, or any external service your infrastructure depends on.",
  },
  {
    q: "What happens when I reach my dependency limit?",
    a: "You'll be notified when you approach your limit. You can upgrade your plan to add more monitored dependencies, or remove existing ones to stay within your current limit. No data is lost when you remove a dependency :  historical data is retained according to your plan's retention period.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Not yet. All plans are currently billed monthly. Annual billing options may be introduced in the future.",
  },
  {
    q: "How does the Agency plan work?",
    a: "The Agency plan provides a single Reliastra organization with 500 monitored dependencies that you can partition across client groups. Each client gets isolated dashboards and reports with your agency branding. Clients cannot see each other's data. If you need more than 500 dependencies, contact us for an expanded deployment.",
  },
  {
    q: "What is evidence generation?",
    a: "When Reliastra detects an incident on a dependency, it automatically produces a cryptographically verifiable evidence report containing timestamped observations, correlation data, and attribution analysis. These reports can be shared with vendors to support SLA credit claims.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "No. Every plan starts with a free tier that provides full access to core monitoring capabilities. Upgrade when you need more dependencies, longer retention, or advanced features like incident correlation and evidence generation.",
  },
];

// ── Cell Renderer ────────────────────────────────────────────────────────

function Cell({ value }: { value: CellValue }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-4 w-4 text-[#16A34A]" />
    ) : (
      <Minus className="mx-auto h-4 w-4 text-[#D4D4D8]" />
    );
  }
  return <span className="text-[13px] text-[#09090B]">{value}</span>;
}

// ── Component ────────────────────────────────────────────────────────────

export function PricingContent() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-white pt-36 pb-20">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              Pricing
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#09090B] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Know what your infrastructure depends on.{" "}
              <span className="text-[#0891B2]">Prove what failed.</span>
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-[#71717A]">
              Reliastra independently measures external dependencies, correlates
              incidents, and turns infrastructure failures into verifiable
              evidence.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing Cards ───────────────────────────────────────────────── */}
      <section className="bg-white pb-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          {/* Top row: Free + Starter + Standard */}
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {tiers.slice(0, 3).map((tier, i) => (
              <motion.div
                key={tier.key}
                className={cn(
                  "relative rounded-xl p-7",
                  tier.highlighted
                    ? "border-2 border-[#0891B2] bg-white shadow-[0_0_0_1px_#0891B2,0_0_60px_rgba(8,145,178,0.1)]"
                    : "border border-[#E4E4E7] bg-white shadow-card",
                )}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease }}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0891B2] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white rounded-full">
                    {tier.badge}
                  </span>
                )}

                {/* Tier name */}
                <p className="text-sm font-semibold text-[#52525B]">{tier.name}</p>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-[40px] font-bold leading-none tracking-tight text-[#09090B]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-[#A1A1AA]">{tier.period}</span>
                  )}
                </div>

                {/* Positioning */}
                <p className="mt-2 text-[13px] leading-relaxed text-[#71717A]">
                  {tier.positioning}
                </p>

                {/* Dependencies count */}
                <p className="mt-4 font-mono text-xs font-medium text-[#0891B2]">
                  {tier.dependencies}
                </p>

                {/* Divider */}
                <div className="my-5 border-t border-[#F0F0F0]" />

                {/* Capabilities */}
                <ul className="space-y-2.5">
                  {tier.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-2 text-[13px] text-[#52525B]"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]"
                        aria-hidden="true"
                      />
                      {cap}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href="/register"
                  className={cn(
                    "mt-6 block w-full rounded-[10px] py-3 text-center text-[13px] font-semibold transition-colors min-h-[44px] leading-[44px]",
                    tier.ctaStyle,
                  )}
                >
                  {tier.cta}
                </a>
              </motion.div>
            ))}
          </div>

          {/* Bottom row: Professional + Agency */}
          <div className="mx-auto mt-5 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {tiers.slice(3).map((tier, i) => (
              <motion.div
                key={tier.key}
                className={cn(
                  "relative rounded-xl p-7",
                  tier.badge === "Built for Agencies"
                    ? "border border-[#E4E4E7] bg-[#F8F9FA]"
                    : "border border-[#E4E4E7] bg-white shadow-card",
                )}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.08, ease }}
              >
                {tier.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A0A0F] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white rounded-full">
                    {tier.badge}
                  </span>
                )}

                <p className="text-sm font-semibold text-[#52525B]">{tier.name}</p>

                <div className="mt-2 flex items-baseline gap-0.5">
                  <span className="text-[40px] font-bold leading-none tracking-tight text-[#09090B]">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-[#A1A1AA]">{tier.period}</span>
                  )}
                </div>

                <p className="mt-2 text-[13px] leading-relaxed text-[#71717A]">
                  {tier.positioning}
                </p>

                <p className="mt-4 font-mono text-xs font-medium text-[#0891B2]">
                  {tier.dependencies}
                </p>

                <div className="my-5 border-t border-[#F0F0F0]" />

                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {tier.capabilities.map((cap) => (
                    <li
                      key={cap}
                      className="flex items-start gap-2 text-[13px] text-[#52525B]"
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16A34A]"
                        aria-hidden="true"
                      />
                      {cap}
                    </li>
                  ))}
                </ul>

                <a
                  href="/register"
                  className={cn(
                    "mt-6 block w-full rounded-[10px] py-3 text-center text-[13px] font-semibold transition-colors min-h-[44px] leading-[44px]",
                    tier.ctaStyle,
                  )}
                >
                  {tier.cta}
                </a>

                {/* Agency expansion note */}
                {tier.key === "agency" && (
                  <p className="mt-4 text-center text-[12px] text-[#A1A1AA]">
                    Need more than 500 monitored dependencies?{" "}
                    <a
                      href="/contact"
                      className="font-medium text-[#0891B2] underline-offset-2 hover:underline"
                    >
                      Contact us
                    </a>{" "}
                    for an expanded deployment.
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Comparison ──────────────────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-24">
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <motion.div
            className="mx-auto mb-12 max-w-lg text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-[#09090B] sm:text-3xl">
              Feature comparison
            </h2>
            <p className="mt-2 text-sm text-[#71717A]">
              A detailed view of what&apos;s included in each plan.
            </p>
          </motion.div>

          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7]">
                  <th className="pb-4 pr-6 text-left text-[13px] font-semibold text-[#09090B]">
                    Feature
                  </th>
                  <th className="px-4 pb-4 text-center text-[13px] font-medium text-[#52525B]">
                    Free
                  </th>
                  <th className="px-4 pb-4 text-center text-[13px] font-medium text-[#52525B]">
                    Starter
                  </th>
                  <th className="bg-white px-4 pb-4 text-center text-[13px] font-semibold text-[#0891B2]">
                    Standard
                  </th>
                  <th className="px-4 pb-4 text-center text-[13px] font-medium text-[#52525B]">
                    Professional
                  </th>
                  <th className="pl-4 pb-4 text-center text-[13px] font-medium text-[#52525B]">
                    Agency
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, idx) => (
                  <tr
                    key={row.feature}
                    className={cn(
                      "border-b border-[#F0F0F0]",
                      idx % 2 === 0 ? "bg-white" : "bg-[#F8F9FA]",
                    )}
                  >
                    <td className="py-3 pr-6 text-[13px] font-medium text-[#09090B]">
                      {row.feature}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.free} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.starter} />
                    </td>
                    <td className="bg-white py-3 px-4 text-center">
                      <Cell value={row.standard} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={row.professional} />
                    </td>
                    <td className="py-3 pl-4 text-center">
                      <Cell value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6 md:px-12">
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease }}
          >
            <h2 className="text-2xl font-semibold tracking-tight text-[#09090B] sm:text-3xl">
              Billing FAQ
            </h2>
            <p className="mt-2 text-sm text-[#71717A]">
              Common questions about pricing and billing.
            </p>
          </motion.div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-[14px] font-medium text-[#09090B]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[14px] leading-relaxed text-[#71717A]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  );
}
