"use client"

import { useScrollReveal, useStaggerReveal } from "@/hooks/use-scroll-reveal"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  ShieldCheck,
  Cloud,
  BrainCircuit,
  Globe,
  Radio,
  Database,
  type LucideIcon,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Dependency category data                                           */
/* ------------------------------------------------------------------ */
interface DependencyCategory {
  icon: LucideIcon
  name: string
  vendors: string
}

const CATEGORIES: DependencyCategory[] = [
  {
    icon: CreditCard,
    name: "Payments",
    vendors: "Stripe \u00b7 Adyen \u00b7 PayPal \u00b7 Square \u00b7 Braintree",
  },
  {
    icon: ShieldCheck,
    name: "Identity",
    vendors: "Auth0 \u00b7 Okta \u00b7 Clerk \u00b7 Firebase Auth \u00b7 AWS Cognito",
  },
  {
    icon: Cloud,
    name: "Cloud",
    vendors: "AWS \u00b7 GCP \u00b7 Azure \u00b7 DigitalOcean \u00b7 Cloudflare",
  },
  {
    icon: BrainCircuit,
    name: "AI APIs",
    vendors: "OpenAI \u00b7 Anthropic \u00b7 Google AI \u00b7 Cohere \u00b7 Mistral",
  },
  {
    icon: Globe,
    name: "DNS / CDN",
    vendors: "Cloudflare \u00b7 Fastly \u00b7 Route 53 \u00b7 Akamai \u00b7 Vercel",
  },
  {
    icon: Radio,
    name: "Communication",
    vendors: "Twilio \u00b7 SendGrid \u00b7 PagerDuty \u00b7 Slack API \u00b7 Postmark",
  },
  {
    icon: Database,
    name: "Databases",
    vendors: "MongoDB Atlas \u00b7 Supabase \u00b7 Redis Cloud \u00b7 PlanetScale \u00b7 Neon",
  },
]

/* ------------------------------------------------------------------ */
/*  Dependency Surface Section                                        */
/* ------------------------------------------------------------------ */
export function DependencySurfaceSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({
    threshold: 0.15,
    rootMargin: "0px 0px -60px 0px",
  })

  const { containerRef: matrixRef, visibleItems } = useStaggerReveal(
    CATEGORIES.length,
    { threshold: 0.05, rootMargin: "0px 0px -30px 0px" }
  )

  return (
    <section
      className="bg-[#080B10] py-24 md:py-32"
      aria-labelledby="dependency-surface-heading"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "mb-12 space-y-3 transition-all duration-700 ease-out md:mb-16",
            headerVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0"
          )}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-[#5A6577]">
            DEPENDENCY SURFACE
          </p>
          <h2
            id="dependency-surface-heading"
            className="text-2xl font-semibold text-[#F3F5F7] md:text-3xl"
          >
            Monitor the infrastructure you depend on.
          </h2>
          <p className="max-w-2xl text-sm text-[#8D98A8]">
            Common external services that Reliastra can independently monitor.
            Vendors listed are examples of monitorable dependencies, not customers
            or partners.
          </p>
        </div>

        {/* Dependency Matrix */}
        <div
          ref={matrixRef}
          className="overflow-hidden rounded-[0.375rem] border border-[rgba(148,163,184,0.08)] bg-[#0E131B]"
        >
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon
            const isRevealed = visibleItems.has(index)
            const isLast = index === CATEGORIES.length - 1

            return (
              <div
                key={category.name}
                className={cn(
                  "transition-all duration-500 ease-out",
                  isRevealed
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0",
                  !isLast && "border-b border-[rgba(148,163,184,0.05)]"
                )}
                style={{
                  transitionDelay: isRevealed ? `${index * 80}ms` : "0ms",
                }}
              >
                {/* Desktop row */}
                <div className="hidden items-center gap-4 px-5 py-3.5 md:flex md:px-6 md:py-4">
                  <Icon
                    size={16}
                    className="flex-shrink-0 text-[#5A6577]"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <span className="w-28 flex-shrink-0 text-sm font-medium text-[#F3F5F7]">
                    {category.name}
                  </span>
                  <span className="text-sm text-[#8D98A8]">
                    {category.vendors}
                  </span>
                </div>

                {/* Mobile: stacked layout */}
                <div className="flex flex-col gap-1 px-5 py-3.5 md:hidden">
                  <div className="flex items-center gap-2.5">
                    <Icon
                      size={14}
                      className="flex-shrink-0 text-[#5A6577]"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[#F3F5F7]">
                      {category.name}
                    </span>
                  </div>
                  <span className="pl-[38px] text-xs text-[#8D98A8]">
                    {category.vendors}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
