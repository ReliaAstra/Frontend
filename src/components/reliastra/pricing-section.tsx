'use client'

import { Check } from 'lucide-react'
import { useScrollReveal, useStaggerReveal } from '@/hooks/use-scroll-reveal'
import { cn } from '@/lib/utils'

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
    features: ['3 dependencies', '24h retention', 'Public vendor data'],
    cta: 'Get Started',
  },
  {
    name: 'STARTER',
    price: '$19',
    outcome: 'Track',
    features: ['25 dependencies', '7-day retention', 'Email alerts', 'Evidence reports'],
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
    <section id="pricing" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          ref={headerRef}
          className="mb-12 text-center md:mb-16"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.5s ease, transform 0.5s ease',
          }}
        >
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Pricing</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl lg:text-4xl">
            Start measuring. Scale when ready.
          </h2>
        </div>

        <div ref={containerRef} className="grid grid-cols-1 gap-4 md:grid-cols-5">
          {plans.map((plan, i) => {
            const isVisible = visibleItems.has(i)
            return (
              <div
                key={plan.name}
                className={cn(
                  'flex flex-col rounded-lg border p-6',
                  plan.popular
                    ? 'border-blue-600/50 bg-white shadow-[0_12px_32px_-16px_rgba(37,99,235,0.35)]'
                    : 'border-slate-200 bg-white'
                )}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
                }}
              >
                {plan.popular && (
                  <span className="mb-3 inline-block self-start rounded bg-blue-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-blue-600">
                    Most Popular
                  </span>
                )}

                <p className="mb-4 text-xs uppercase tracking-[0.1em] text-slate-500">
                  {plan.name}
                </p>

                <div className="mb-1">
                  <span className="font-mono-numeric text-3xl font-semibold text-slate-900">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">/mo</span>
                </div>

                <p className="mb-6 text-sm text-slate-600">{plan.outcome}</p>

                <ul className="mb-8 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <Check size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className={cn(
                    'block rounded px-4 py-2.5 text-center text-sm font-medium transition-colors duration-200',
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  )}
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
