'use client';

import { motion } from 'framer-motion';
import { Check, X, Zap, Building2, Rocket, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'For individual developers monitoring a handful of vendors.',
    icon: Zap,
    features: ['3 vendors monitored', '5-minute check intervals', 'Basic status dashboard', 'Email alerts', '7-day data retention'],
    cta: 'Get Started Free',
    variant: 'outline' as const,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams that need real-time reliability intelligence.',
    icon: Star,
    features: ['25 vendors monitored', '30-second check intervals', 'Full analytics dashboard', 'Slack & email alerts', '90-day data retention', 'Incident correlation', 'SLA evidence reports'],
    cta: 'Start Pro Trial',
    variant: 'default' as const,
    highlighted: true,
  },
  {
    name: 'Business',
    price: '$199',
    period: '/month',
    description: 'For organizations with complex dependency graphs and compliance needs.',
    icon: Building2,
    features: ['Unlimited vendors', '15-second check intervals', 'Custom dashboards', 'All notification channels', '1-year data retention', 'Incident correlation engine', 'SLA evidence generation', 'Team management', 'API access', 'Priority support'],
    cta: 'Contact Sales',
    variant: 'outline' as const,
    highlighted: false,
  },
];

const agencyTier = {
  name: 'Agency',
  price: 'Custom',
  period: '',
  description: 'White-label monitoring for agencies managing multiple client infrastructures.',
  icon: Rocket,
  features: ['Everything in Business', 'White-label dashboards', 'Client sub-accounts', 'Dedicated account manager', 'Custom SLA terms', 'SSO / SAML'],
  cta: 'Talk to Us',
};

const comparisonFeatures = [
  { name: 'Vendors monitored', starter: '3', pro: '25', business: 'Unlimited', agency: 'Unlimited' },
  { name: 'Check interval', starter: '5 min', pro: '30 sec', business: '15 sec', agency: '15 sec' },
  { name: 'Status dashboard', starter: true, pro: true, business: true, agency: true },
  { name: 'Email alerts', starter: true, pro: true, business: true, agency: true },
  { name: 'Slack alerts', starter: false, pro: true, business: true, agency: true },
  { name: 'Webhook alerts', starter: false, pro: false, business: true, agency: true },
  { name: 'Data retention', starter: '7 days', pro: '90 days', business: '1 year', agency: '2 years' },
  { name: 'Incident correlation', starter: false, pro: true, business: true, agency: true },
  { name: 'SLA evidence reports', starter: false, pro: true, business: true, agency: true },
  { name: 'Team management', starter: false, pro: false, business: true, agency: true },
  { name: 'API access', starter: false, pro: false, business: true, agency: true },
  { name: 'Custom dashboards', starter: false, pro: false, business: true, agency: true },
  { name: 'White-label', starter: false, pro: false, business: false, agency: true },
  { name: 'SSO / SAML', starter: false, pro: false, business: false, agency: true },
  { name: 'Priority support', starter: false, pro: false, business: true, agency: true },
  { name: 'Dedicated account manager', starter: false, pro: false, business: false, agency: true },
];

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. All paid plans are month-to-month with no long-term contracts. You can cancel from your dashboard at any time, and your plan will remain active until the end of your current billing period.',
  },
  {
    q: 'What happens to my data?',
    a: 'When you cancel, your data is retained for the duration of your plan’s data retention period. After that, it is permanently deleted from our systems. You can also request an immediate data export at any time.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer a full refund within the first 14 days of any paid plan. After that, we prorate refunds on a case-by-case basis. Contact our support team for assistance.',
  },
  {
    q: 'Can I switch plans?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your billing settings. When upgrading, you’ll be prorated for the remainder of the billing cycle. When downgrading, the new rate takes effect at the next billing cycle.',
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-[#16A34A]" />
    ) : (
      <X className="mx-auto h-5 w-5 text-[#A1A1AA]" />
    );
  }
  return <span className="text-sm text-[#09090B]">{value}</span>;
}

export function PricingContent() {
  return (
    <>
      {/* Header */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" variant="secondary">Pricing</Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#09090B] tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-[#52525B] max-w-2xl mx-auto">
              Start free. Upgrade when you need more vendors, faster checks, or deeper insights.
              No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card
                    className={cn(
                      'relative flex flex-col h-full rounded-xl p-6',
                      tier.highlighted && 'border-2 border-[#0891B2] shadow-lg shadow-cyan-500/10'
                    )}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#0891B2] text-white">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-[#0891B2]" />
                        <h3 className="text-lg font-semibold text-[#09090B]">{tier.name}</h3>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-[#09090B]">{tier.price}</span>
                        <span className="text-[#52525B]">{tier.period}</span>
                      </div>
                      <p className="text-sm text-[#52525B] mt-2">{tier.description}</p>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      <ul className="space-y-3">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-[#09090B]">
                            <Check className="h-4 w-4 text-[#16A34A] mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-0 pt-6">
                      <Button
                        className={cn('w-full rounded-lg', tier.highlighted && 'bg-[#0891B2] hover:bg-[#0E7490] text-white')}
                        variant={tier.variant}
                        size="lg"
                      >
                        {tier.cta}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Agency Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="rounded-xl p-6 bg-[#0A0A0F] text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="h-5 w-5 text-[#0891B2]" />
                    <h3 className="text-lg font-semibold">Agency</h3>
                    <Badge variant="secondary" className="bg-white/10 text-white border-white/20">Custom</Badge>
                  </div>
                  <p className="text-sm text-gray-400 max-w-lg">{agencyTier.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {agencyTier.features.slice(0, 4).map((f) => (
                      <span key={f} className="text-xs bg-white/10 rounded-full px-3 py-1 text-gray-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <Button className="bg-[#0891B2] hover:bg-[#0E7490] text-white rounded-lg shrink-0" size="lg">
                  {agencyTier.cta}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Founding Customer Program */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="rounded-xl p-6 border-dashed border-2 border-[#0891B2]/30 bg-cyan-50/50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#09090B]">Founding Customer Program</h3>
                  <p className="text-sm text-[#52525B] mt-1 max-w-lg">
                    Join the first 100 customers and lock in 50% off any paid plan for life.
                    Includes early access to features and direct input on the product roadmap.
                  </p>
                </div>
                <Button variant="outline" className="rounded-lg border-[#0891B2] text-[#0891B2] hover:bg-[#0891B2] hover:text-white shrink-0" size="lg">
                  Apply for Founding Program
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Feature Comparison</h2>
            <p className="mt-2 text-[#52525B]">See everything that&apos;s included in each plan.</p>
          </motion.div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E4E4E7]">
                  <th className="text-left py-4 pr-4 font-semibold text-[#09090B]">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#09090B]">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#0891B2] bg-cyan-50 rounded-t-xl">Pro</th>
                  <th className="text-center py-4 px-4 font-semibold text-[#09090B]">Business</th>
                  <th className="text-center py-4 pl-4 font-semibold text-[#09090B]">Agency</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((f, idx) => (
                  <tr key={f.name} className={cn('border-b border-[#F0F0F0]', idx % 2 === 0 && 'bg-white')}>
                    <td className="py-3 pr-4 text-[#09090B] font-medium">{f.name}</td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={f.starter} />
                    </td>
                    <td className="py-3 px-4 text-center bg-cyan-50/50">
                      <FeatureValue value={f.pro} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <FeatureValue value={f.business} />
                    </td>
                    <td className="py-3 pl-4 text-center">
                      <FeatureValue value={f.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Billing FAQ */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-[#09090B]">Billing FAQ</h2>
            <p className="mt-2 text-[#52525B]">Common questions about pricing and billing.</p>
          </motion.div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-[#09090B] font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-[#52525B]">
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
