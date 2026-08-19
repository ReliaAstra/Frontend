'use client';

import { motion } from 'framer-motion';
import { ArrowRight, UserPlus, Link2, BarChart3, CreditCard } from 'lucide-react';
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

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Apply to the program',
    description:
      'Submit a short application with your professional background and intended referral approach. Most applications are reviewed within 48 hours.',
    details: [
      'Professional background and expertise',
      'Intended referral channels',
      'Company or individual profile',
    ],
  },
  {
    number: '02',
    icon: Link2,
    title: 'Receive your referral link',
    description:
      'Once approved, you get a unique referral link and access to the partner dashboard. Start sharing your link with potential customers.',
    details: [
      'Unique tracking URL',
      'Partner dashboard access',
      'Marketing resource kit',
    ],
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Track your referrals',
    description:
      'Monitor referrals in real time from your dashboard. See when prospects sign up, convert to paying customers, and generate commissions.',
    details: [
      'Real-time referral status',
      'Conversion funnel visibility',
      'Commission accumulation',
    ],
  },
  {
    number: '04',
    icon: CreditCard,
    title: 'Get paid monthly',
    description:
      'Commissions are calculated monthly based on active referral subscriptions. Payouts are processed automatically to your registered account.',
    details: [
      'Monthly commission calculation',
      'Automated bank transfers',
      'Transparent commission statements',
    ],
  },
];

export function PageHowItWorks() {
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
              Process
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              How it works
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              From application to your first payout. The entire process is
              designed to be straightforward and transparent.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Steps timeline */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative">
          {/* Vertical line - desktop only */}
          <div className="absolute left-[27px] top-0 hidden h-full w-px bg-border/60 sm:block" />

          <div className="space-y-8 sm:space-y-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                className="relative sm:pl-16"
              >
                {/* Timeline dot - desktop */}
                <div className="absolute left-5 top-1.5 hidden h-3 w-3 rounded-full border-2 border-foreground bg-background sm:block" />

                <motion.div
                  variants={fadeUp}
                  custom={i}
                  className="rounded-lg border border-border/60 bg-background p-6 transition-colors hover:border-border sm:p-8"
                >
                  <div className="flex items-start gap-4 sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background">
                      <step.icon className="size-5 text-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground/60">
                          {step.number}
                        </span>
                        <h3 className="text-sm font-semibold text-foreground sm:text-base">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-4 ml-14 space-y-1.5 sm:ml-[4.5rem]">
                    {step.details.map((detail) => (
                      <li
                        key={detail}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-px w-3 bg-border" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid gap-12 lg:grid-cols-2"
          >
            <motion.div variants={fadeUp} custom={0}>
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Eligibility
              </p>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Who should apply
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The program is designed for professionals who regularly advise
                organizations on infrastructure, operations, or technology
                decisions.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="space-y-4">
              {[
                {
                  title: 'Technology consultants',
                  desc: 'Independent consultants who advise on SaaS, cloud, or DevOps tooling.',
                },
                {
                  title: 'Agencies and integrators',
                  desc: 'Digital agencies or system integrators who deploy solutions for clients.',
                },
                {
                  title: 'Community leaders',
                  desc: 'People who run communities, write content, or organize events in relevant technical domains.',
                },
                {
                  title: 'Platform resellers',
                  desc: 'Companies that bundle or resell complementary tools as part of a larger offering.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-md border border-border/60 bg-background p-4"
                >
                  <h4 className="mb-1 text-sm font-medium text-foreground">
                    {item.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
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
              Begin the process
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mb-8 text-sm text-muted-foreground"
            >
              Complete the application and our team will review it within 48
              business hours.
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
