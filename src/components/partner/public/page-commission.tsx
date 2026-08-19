'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePartnerStore } from '@/stores/partner-store';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export function PageCommission() {
  const navigate = usePartnerStore((s) => s.navigate);

  return (
    <div>
      {/* Header */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-2xl"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Commission
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Commission structure
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              A single, transparent rate that applies to all subscription plans.
              No complex tier calculations or performance thresholds.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Rate card */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Main rate */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="rounded-lg border border-border/60 bg-background p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Commission rate
              </p>
              <span className="rounded-full border border-border/80 bg-muted/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                All plans
              </span>
            </div>

            <div className="mb-6">
              <span className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                30
              </span>
              <span className="text-2xl font-bold text-muted-foreground">%</span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">
              You earn 30% of the monthly subscription fee for each customer you
              refer, for as long as their subscription remains active. This rate
              applies uniformly across all RELIASTRA subscription plans.
            </p>
          </motion.div>

          {/* Key terms */}
          <motion.div
            variants={fadeUp}
            custom={1}
            className="rounded-lg border border-border/60 bg-background p-8"
          >
            <p className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Key terms
            </p>

            <div className="space-y-4">
              {[
                {
                  term: 'Attribution window',
                  definition:
                    '90 days from the first click on your referral link. If the prospect signs up within this window, the referral is attributed to you.',
                },
                {
                  term: 'Commission trigger',
                  definition:
                    'Commission begins accruing when the referred customer completes their first paid billing cycle.',
                },
                {
                  term: 'Commission duration',
                  definition:
                    'Commissions continue for the lifetime of the customer\'s subscription, with no expiry.',
                },
                {
                  term: 'Churn policy',
                  definition:
                    'If a referred customer cancels or fails to pay, commissions for that customer stop in the following month.',
                },
              ].map((item) => (
                <div
                  key={item.term}
                  className="border-b border-border/40 pb-4 last:border-0 last:pb-0"
                >
                  <h4 className="mb-1 text-sm font-medium text-foreground">
                    {item.term}
                  </h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.definition}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Calculation examples */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-10 max-w-lg">
              <div className="mb-3 flex items-center gap-2">
                <Calculator className="size-4 text-muted-foreground" />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Examples
                </p>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Commission calculations
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="overflow-hidden rounded-lg border border-border/60 bg-background"
            >
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 border-b border-border/60 bg-muted/30 px-6 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <span>Customer plan</span>
                <span className="text-right">Monthly fee</span>
                <span className="text-right">Commission</span>
                <span className="text-right">Annual earn</span>
              </div>

              {/* Table rows */}
              {[
                {
                  plan: 'Starter',
                  fee: '$29/mo',
                  commission: '$8.70',
                  annual: '$104.40',
                },
                {
                  plan: 'Pro',
                  fee: '$49/mo',
                  commission: '$14.70',
                  annual: '$176.40',
                },
                {
                  plan: 'Team',
                  fee: '$99/mo',
                  commission: '$29.70',
                  annual: '$356.40',
                },
              ].map((row) => (
                <div
                  key={row.plan}
                  className="grid grid-cols-4 gap-4 border-b border-border/40 px-6 py-3.5 last:border-0"
                >
                  <span className="text-sm font-medium text-foreground">
                    {row.plan}
                  </span>
                  <span className="text-right font-mono text-sm text-muted-foreground">
                    {row.fee}
                  </span>
                  <span className="text-right font-mono text-sm font-semibold text-foreground">
                    {row.commission}
                  </span>
                  <span className="text-right font-mono text-sm text-foreground">
                    {row.annual}
                  </span>
                </div>
              ))}
            </motion.div>

            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted-foreground/60">
              Calculations based on the 30% commission rate. Actual
              subscription prices may vary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What doesn't count */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-10 max-w-lg">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Exclusions
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                What does not generate commission
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                'Self-referrals (signing up with your own link)',
                'Customers already in a sales conversation with Reliastra',
                'Free trial signups that do not convert to paid',
                'Referrals outside the 90-day attribution window',
                'Customers who receive a refund for their first month',
                'Bulk or automated signups not from genuine referrals',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-md border border-border/60 bg-background p-4"
                >
                  <span className="mt-0.5 h-px w-4 shrink-0 bg-muted-foreground/40" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="mx-auto max-w-xl text-center"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="mb-4 text-2xl font-semibold tracking-tight text-foreground"
            >
              The structure is simple
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mb-8 text-sm text-muted-foreground"
            >
              30% recurring commission, no caps, no tiers. Apply now and start
              earning.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button
                size="lg"
                onClick={() => navigate('apply')}
                className="gap-2 px-8"
              >
                Apply to the program
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
