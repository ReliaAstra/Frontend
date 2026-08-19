'use client'

import { Check } from 'lucide-react'
import { useScrollReveal, useStaggerReveal } from '@/hooks/use-scroll-reveal'

interface Plan {
  name: string
  price: string
  outcome: string
  features: string[]
  cta: string
  popular?: boolean
}

const plans: Plan[] = [
  {
    name: 'FREE',
    price: '$0',
    outcome: 'Measure',
    features: [
      '3 dependencies',
      '24h retention',
      'Public vendor data',
    ],
    cta: 'Get Started',
  },
  {
    name: 'STARTER',
    price: '$19',
    outcome: 'Track',
    features: [
      '25 dependencies',
      '7-day retention',
      'Email alerts',
      'Evidence reports',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'STANDARD',
    price: '$49',
    outcome: 'Investigate + Prove',
    features: [
      '100 dependencies',
      '30-day retention',
      'Slack/PagerDuty alerts',
      'Evidence reports',
      'Correlation engine',
      'API access',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'PROFESSIONAL',
    price: '$99',
    outcome: 'Operate at scale',
    features: [
      '500 dependencies',
      '90-day retention',
      'All alert channels',
      'Priority correlation',
      'Team access (5 seats)',
      'Webhook integrations',
    ],
    cta: 'Start Free Trial',
  },
  {
    name: 'AGENCY',
    price: '$199',
    outcome: 'Manage client infrastructure',
    features: [
      'Unlimited dependencies',
      '90-day retention',
      'Client groups',
      'White-label reports',
      'Priority support',
      'Unlimited seats',
    ],
    cta: 'Contact Sales',
  },
]

export function PricingSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal()
  const { containerRef, visibleItems } = useStaggerReveal(plans.length, { threshold: 0.05 })

  return (
    <section id="pricing" className="py-24 md:py-32 bg-[#080B10]">
      <div className="max-w-6xl mx-auto px-6">
        <div
          ref={headerRef}
          className="text-center mb-12 md:mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p className="uppercase tracking-[0.15em] text-xs text-[#5A6577]">
            Pricing
          </p>
          <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-semibold text-[#F3F5F7]">
            Start measuring. Scale when ready.
          </h2>
        </div>

        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          {plans.map((plan, i) => {
            const isVisible = visibleItems.has(i)
            return (
              <div
                key={plan.name}
                className={`rounded p-6 flex flex-col ${
                  plan.popular
                    ? 'bg-[#0E131B] border border-[#3B82F6]/30'
                    : 'bg-[#0E131B] border border-[rgba(148,163,184,0.08)]'
                }`}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
                }}
              >
                {plan.popular && (
                  <span className="inline-block self-start text-[10px] uppercase tracking-wide text-[#3B82F6] bg-[rgba(59,130,246,0.08)] px-2.5 py-1 rounded mb-4">
                    Most Popular
                  </span>
                )}

                <p className={`uppercase tracking-[0.1em] text-xs text-[#5A6577] ${plan.popular ? 'mt-0' : 'mb-4'}`}>
                  {plan.name}
                </p>

                <div className="mb-1">
                  <span className="text-3xl font-semibold text-[#F3F5F7] font-mono-numeric">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#8D98A8]">/mo</span>
                </div>

                <p className="text-sm text-[#8D98A8] mb-6">
                  {plan.outcome}
                </p>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-[#8D98A8]">
                      <Check size={14} className="text-[#5A6577] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={`block text-center text-sm font-medium px-4 py-2.5 rounded transition-colors duration-200 ${
                    plan.popular
                      ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]'
                      : 'border border-[rgba(148,163,184,0.15)] text-[#8D98A8] hover:text-white hover:border-[rgba(148,163,184,0.3)]'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
