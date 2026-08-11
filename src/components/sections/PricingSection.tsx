'use client';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { FoundingSpotCounter } from '@/components/FoundingSpotCounter';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    featured: false,
    features: [
      'Up to 5 vendors',
      '1-minute check interval',
      '7-day data retention',
      'Basic status page',
      'Community support',
    ],
    cta: 'Start Free',
    ctaStyle: 'bg-[#0A0A0F] text-white',
  },
  {
    name: 'Standard',
    price: '$49',
    period: '/mo',
    featured: true,
    features: [
      'Up to 25 vendors',
      '15-second check interval',
      '90-day data retention',
      'SLA evidence reports',
      'Multi-region verification',
      'Email alerts & webhooks',
      'Priority support',
    ],
    cta: 'Start Standard',
    ctaStyle: 'bg-[#0891B2] text-white',
    rateLock: true,
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/mo',
    featured: false,
    features: [
      'Unlimited vendors',
      '5-second check interval',
      '1-year data retention',
      'Advanced correlation engine',
      'Custom report branding',
      'SSO & team management',
      'API access',
      'Dedicated support',
    ],
    cta: 'Start Professional',
    ctaStyle: 'bg-[#0A0A0F] text-white',
    rateLock: true,
  },
];

export function PricingSection() {
  return (
    <section className="bg-white py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-4">
            PRICING
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B]">
            Simple, transparent pricing.
          </h2>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={cn(
                'rounded-2xl p-8 relative',
                plan.featured
                  ? 'bg-white border-2 border-[#0891B2] shadow-[0_0_0_1px_#0891B2,0_0_60px_rgba(8,145,178,0.12)]'
                  : 'bg-white border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]'
              )}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
            >
              {plan.featured && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0891B2] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  Most Popular
                </span>
              )}
              
              <p className="text-sm font-semibold text-[#52525B] mb-2">{plan.name}</p>
              
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-5xl font-bold text-[#09090B]">{plan.price}</span>
                {plan.period && <span className="text-[#A1A1AA]">{plan.period}</span>}
              </div>

              {plan.rateLock && (
                <div className="flex items-center gap-1.5 mb-6">
                  <Lock className="w-3.5 h-3.5 text-[#16A34A]" aria-hidden="true" />
                  <span className="text-xs font-medium text-[#16A34A]">
                    Founding rate — locked forever
                  </span>
                </div>
              )}

              {!plan.rateLock && <div className="mb-6" />}

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[#52525B]">
                    <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="/pricing"
                className={cn(
                  'block w-full py-3 rounded-[10px] font-semibold text-sm text-center transition-colors min-h-[44px] leading-[44px]',
                  plan.ctaStyle,
                  plan.ctaStyle.includes('bg-[#0891B2]') && 'hover:bg-[#0E7490]',
                  plan.ctaStyle.includes('bg-[#0A0A0F]') && 'hover:bg-[#1A1A2F]'
                )}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Agency Tier */}
        <motion.div
          className="bg-[#F8F9FA] rounded-2xl p-8 border border-[#E4E4E7] mt-6 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-[#09090B]">Agency</h3>
              <p className="text-sm text-[#52525B] mt-1">
                White-label reports, unlimited clients, dedicated account manager. Custom pricing for agencies managing vendor SLAs at scale.
              </p>
            </div>
            <a
              href="/contact"
              className="shrink-0 bg-white border border-[#E4E4E7] text-[#09090B] px-6 py-3 rounded-[10px] font-semibold text-sm hover:border-[#09090B] transition-colors min-h-[44px] inline-flex items-center"
            >
              Contact Sales
            </a>
          </div>
        </motion.div>

        {/* Founding Program */}
        <motion.div
          className="bg-[#0A0A0F] rounded-3xl p-12 max-w-3xl mx-auto text-center border border-white/5 mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#0891B2] mb-4">
            FOUNDING PROGRAM
          </p>
          <h3 className="text-2xl font-semibold text-white mb-2">
            Lock in your rate. Forever.
          </h3>
          <p className="text-white/50 text-sm mb-8">
            The first 25 customers get Standard or Professional at half price, locked in permanently—even after we raise prices.
          </p>
          <FoundingSpotCounter />
          <a
            href="/pricing"
            className="inline-block bg-[#0891B2] text-white px-8 py-4 rounded-[10px] font-semibold text-base hover:bg-[#0E7490] transition-colors mt-8"
          >
            Claim Your Spot
          </a>
        </motion.div>
      </div>
    </section>
  );
}
