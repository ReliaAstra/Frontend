'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const faqSections = [
  {
    heading: 'Program basics',
    items: [
      {
        q: 'What is the Reliastra Partner Network?',
        a: 'The Partner Network is a commission-based referral program. Approved partners earn a recurring commission by referring new customers to Reliastra through unique tracking links.',
      },
      {
        q: 'Who is eligible to apply?',
        a: 'The program is open to technology consultants, agencies, system integrators, community leaders, and platform resellers who regularly advise organizations on infrastructure or technology decisions.',
      },
      {
        q: 'Is there a cost to join?',
        a: 'No. There is no fee to apply or participate in the partner program.',
      },
      {
        q: 'How long does the application review take?',
        a: 'Most applications are reviewed within 48 business hours. You will receive an email with the decision and next steps.',
      },
    ],
  },
  {
    heading: 'Commissions and payouts',
    items: [
      {
        q: 'What is the commission rate?',
        a: 'The commission rate is a flat 20% of the referred customer\'s monthly subscription fee. This applies to all subscription plans with no tier variations.',
      },
      {
        q: 'Is there an earning cap?',
        a: 'No. Your earnings are not capped. You earn proportionally to the number and size of your active referrals.',
      },
      {
        q: 'How often are commissions paid?',
        a: 'Commissions are calculated at the end of each calendar month and paid out within the first 5 business days of the following month.',
      },
      {
        q: 'What happens if a referred customer cancels?',
        a: 'Commissions for that customer stop accruing in the month following cancellation. There is no clawback of previously paid commissions.',
      },
      {
        q: 'What payment methods are supported?',
        a: 'Commissions are paid via bank transfer (ACH or international wire). You configure your payment details in the partner dashboard.',
      },
    ],
  },
  {
    heading: 'Referrals and tracking',
    items: [
      {
        q: 'How does referral tracking work?',
        a: 'Each partner receives a unique referral link. When someone clicks your link, a cookie is set for 90 days. If they sign up within that window, the referral is attributed to your account.',
      },
      {
        q: 'Can I track the status of my referrals?',
        a: 'Yes. The partner dashboard shows real-time status for each referral: pending, active, or cancelled. You can also see conversion rates and commission accumulation.',
      },
      {
        q: 'What if someone signs up without my link but mentions my name?',
        a: 'Manual attribution is not supported. Referrals must come through your unique tracking link to be properly attributed and eligible for commission.',
      },
      {
        q: 'Can I use the referral link in paid advertising?',
        a: 'Yes, paid channels are permitted as long as you do not bid on Reliastra trademarked terms or misrepresent your relationship with the company.',
      },
    ],
  },
];

export function PageFaq() {
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
              FAQ
            </motion.p>
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              Frequently asked questions
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-4 text-base leading-relaxed text-muted-foreground"
            >
              Answers to common questions about the partner program,
              commissions, and referral process.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="space-y-12">
          {faqSections.map((section, si) => (
            <motion.div
              key={section.heading}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
            >
              <motion.h2
                variants={fadeUp}
                custom={0}
                className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                {section.heading}
              </motion.h2>
              <motion.div variants={fadeUp} custom={1}>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, i) => (
                    <AccordionItem
                      key={i}
                      value={`${si}-${i}`}
                      className="border-border/60"
                    >
                      <AccordionTrigger className="justify-start text-left text-sm font-medium text-foreground hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="border-t border-border/40 bg-muted/30">
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
              Still have questions?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-sm text-muted-foreground"
            >
              If your question is not covered here, reach out to our partner team
              directly through the application form.
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
