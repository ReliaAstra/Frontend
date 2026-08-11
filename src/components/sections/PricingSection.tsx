'use client';

import { motion } from 'framer-motion';
import { Check, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FoundingSpotCounter } from '@/components/FoundingSpotCounter';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  rateLock?: boolean;
}

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    description: 'Start monitoring your first 5 vendors.',
    features: [
      'Up to 5 vendors',
      '15-min polling interval',
      'Basic alerting',
      'Community support',
    ],
  },
  {
    name: 'Standard',
    price: '$49',
    period: '/mo',
    description: 'For growing teams that need evidence.',
    featured: true,
    rateLock: true,
    features: [
      'Up to 25 vendors',
      '1-min polling interval',
      'SLA evidence reports',
      'Multi-region verification',
      'Email & Slack alerts',
      'Priority support',
    ],
  },
  {
    name: 'Professional',
    price: '$99',
    period: '/mo',
    description: 'For teams serious about vendor accountability.',
    rateLock: true,
    features: [
      'Unlimited vendors',
      '15-sec polling interval',
      'Advanced correlation engine',
      'Custom evidence templates',
      'API access & webhooks',
      'Dedicated account manager',
      'SSO & RBAC',
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

export function PricingSection() {
  return (
    <section className="py-24 md:py-32" id="pricing">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[#52525B] mt-4 leading-relaxed">
            Start free. Upgrade when you need evidence that holds up.
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 items-start"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={cn(
                'rounded-xl border bg-white p-6 relative transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated',
                plan.featured
                  ? 'border-[#0891B2] shadow-glow'
                  : 'border-[#E4E4E7] shadow-card'
              )}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#0891B2] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-lg font-bold text-[#09090B]">{plan.name}</h3>
              <p className="text-sm text-[#52525B] mt-1">{plan.description}</p>

              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-extrabold text-[#09090B]">{plan.price}</span>
                <span className="text-sm text-[#A1A1AA]">{plan.period}</span>
              </div>

              {plan.rateLock && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Lock className="w-3.5 h-3.5 text-[#0891B2]" />
                  <span className="text-xs font-medium text-[#0891B2]">Founding rate — locked forever</span>
                </div>
              )}

              <Button
                className={cn(
                  'w-full mt-6 rounded-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]',
                  plan.featured
                    ? 'bg-[#0891B2] hover:bg-[#0E7490] text-white'
                    : 'bg-[#09090B] hover:bg-[#27272A] text-white'
                )}
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-[#52525B]">
                    <Check className="w-4 h-4 text-[#16A34A] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Agency Tier */}
        <motion.div
          className="mt-6 rounded-xl border border-[#E4E4E7] bg-white p-6 md:p-8 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#09090B]">Agency & Enterprise</h3>
                <span className="bg-[#F8F9FA] text-[#52525B] text-xs font-medium px-2.5 py-1 rounded-full border border-[#E4E4E7]">
                  Custom
                </span>
              </div>
              <p className="text-sm text-[#52525B] mt-1">
                White-label reports, unlimited clients, custom SLA templates, dedicated SLA.
              </p>
            </div>
            <Button
              variant="outline"
              className="shrink-0 rounded-lg font-semibold border-[#E4E4E7] text-[#09090B] hover:bg-[#F8F9FA] transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Contact Sales
            </Button>
          </div>
        </motion.div>

        {/* Founding Program */}
        <motion.div
          className="mt-16 rounded-2xl bg-[#0A0A0F] border border-white/10 p-8 md:p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold text-[#67E8F9] uppercase tracking-widest">
            Founding Customer Program
          </span>
          <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-4">
            Lock Your Rate Forever
          </h3>
          <p className="text-[#A1A1AA] mt-3 max-w-lg mx-auto">
            Join the first 25 customers and your price never increases — even as
            we add features. Guaranteed.
          </p>
          <div className="mt-8">
            <FoundingSpotCounter />
          </div>
          <Button
            size="lg"
            className="mt-8 bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Claim Your Spot
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
