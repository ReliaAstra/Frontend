'use client';

import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Clock, Repeat, CreditCard } from 'lucide-react';
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

const mechanics = [
  {
    icon: Repeat,
    title: 'Monthly recurring commission',
    description:
      'You earn a commission every month for each active referral. The revenue compounds as your referral base grows.',
  },
  {
    icon: TrendingUp,
    title: 'No earning cap',
    description:
      'There is no upper limit on how much you can earn. Your revenue is directly proportional to the number of active referrals you maintain.',
  },
  {
    icon: Clock,
    title: 'Lifetime attribution',
    description:
      'Once a customer is attributed to your referral, you continue earning from them for as long as their subscription is active.',
  },
  {
    icon: CreditCard,
    title: 'Monthly payouts',
    description:
      'Commissions are calculated at the end of each calendar month and paid out within the first week of the following month.',
  },
];

export function PageEarn() {
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
              Earnings
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Bring RELIASTRA to the right people. Get paid every month.
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              The partner program uses a straightforward recurring commission
              model. There are no hidden thresholds, no tier negotiations, and
              no surprise deductions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mechanics grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {mechanics.map((item, i) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              custom={i}
              className="rounded-lg border border-border/60 bg-background p-6 transition-colors hover:border-border"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-background">
                <item.icon className="size-5 text-foreground" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Earnings table */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-10 max-w-lg">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Projection model
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                See the compounding effect
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} custom={1}>
              <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
                {/* Table header */}
                <div className="grid grid-cols-4 gap-4 border-b border-border/60 bg-muted/30 px-6 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Month</span>
                  <span className="text-right">New refs</span>
                  <span className="text-right">Total active</span>
                  <span className="text-right">Monthly earn</span>
                </div>

                {/* Table rows */}
                {[
                  { month: '1', newRefs: '2', total: '2', earn: '$72' },
                  { month: '3', newRefs: '2', total: '6', earn: '$216' },
                  { month: '6', newRefs: '3', total: '15', earn: '$540' },
                  { month: '12', newRefs: '3', total: '33', earn: '$1,188' },
                  { month: '18', newRefs: '2', total: '45', earn: '$1,620' },
                  { month: '24', newRefs: '3', total: '63', earn: '$2,268' },
                ].map((row) => (
                  <div
                    key={row.month}
                    className="grid grid-cols-4 gap-4 border-b border-border/40 px-6 py-3.5 last:border-0"
                  >
                    <span className="font-mono text-sm text-foreground">
                      {row.month}
                    </span>
                    <span className="text-right text-sm text-muted-foreground">
                      +{row.newRefs}
                    </span>
                    <span className="text-right text-sm font-medium text-foreground">
                      {row.total}
                    </span>
                    <span className="text-right font-mono text-sm font-semibold text-foreground">
                      {row.earn}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted-foreground/60">
                Assumes 30% commission on $120/mo average subscription. New referrals
                added monthly. Churn not modeled. For illustration only.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Payout details */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp} custom={0} className="mb-10 max-w-lg">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Payouts
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Getting paid
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="grid gap-6 sm:grid-cols-3"
            >
              {[
                {
                  step: '01',
                  title: 'Commissions accrue',
                  desc: 'Each month, your earned commissions from active referrals are calculated and recorded in your dashboard.',
                },
                {
                  step: '02',
                  title: 'Review and confirm',
                  desc: 'At the end of the month, review your commission statement. Disputes can be raised within 7 days.',
                },
                {
                  step: '03',
                  title: 'Payment processed',
                  desc: 'Approved commissions are paid out within the first 5 business days of the following month via bank transfer.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-lg border border-border/60 bg-background p-6"
                >
                  <span className="mb-4 block font-mono text-2xl font-light text-muted-foreground/40">
                    {item.step}
                  </span>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
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
              Ready to start earning?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mb-8 text-sm text-muted-foreground"
            >
              Apply to the partner program and receive your referral link within
              48 hours of approval.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Button
                size="lg"
                onClick={() => navigate('apply')}
                className="gap-2 px-8"
              >
                Apply now
                <ArrowRight className="size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
