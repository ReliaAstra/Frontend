'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const ease = [0.25, 0.1, 0.25, 1] as const;

const FAQS = [
  {
    q: 'How is Reliastra different from regular uptime monitoring?',
    a: 'Regular uptime monitors check your own infrastructure from the outside. Reliastra monitors your vendors’ APIs from independent locations—completely separate from your stack. It doesn\'t just tell you a vendor is down; it correlates vendor degradation with your service metrics and generates evidence reports you can send directly to vendor support to claim SLA credits.',
  },
  {
    q: 'What counts as an \u201Cindependent\u201D verification?',
    a: 'Reliastra runs checks from multiple cloud regions (US East, US West, EU) on infrastructure that is completely separate from yours and the vendor\'s. Each check is timestamped and logged with full metadata. This means when a vendor says \u201Ceverything looks fine on our end,\u201D you have third-party proof from locations they don\'t control.',
  },
  {
    q: 'Which vendors do you support?',
    a: 'Any HTTP endpoint. Reliastra works with any vendor that exposes an API—Stripe, Auth0, Twilio, Cloudflare, OpenAI, PagerDuty, AWS, and hundreds more. If it has a URL and returns a status code, we can monitor it. Setup takes about 30 seconds per vendor.',
  },
  {
    q: 'How do SLA evidence reports work?',
    a: 'When a vendor incident is detected, Reliastra automatically compiles a timestamped report including: independent verification from multiple regions, the exact duration of degradation, your correlated service impact, and the calculated SLA credit amount. Reports are generated in a format accepted by major cloud vendors and can be shared with vendor support in one click.',
  },
  {
    q: 'Will this actually help me get SLA credits?',
    a: 'Yes. We\'ve seen customers recover thousands in SLA credits they would have otherwise left on the table. The key is having independent, timestamped evidence—which is exactly what Reliastra provides. Vendors are much more likely to honor credit claims when presented with structured evidence from a third party rather than screenshots or anecdotal reports.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). We\'re working toward SOC 2 Type II certification. We don\'t share your data with vendors or third parties. You own your monitoring data and evidence reports completely.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B]">
            Common questions.
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                className="border-b border-[#E4E4E7]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between py-6 text-left group min-h-[44px]"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-[#09090B] pr-4">
                    {faq.q}
                  </span>
                  <motion.span
                    className="shrink-0 w-6 h-6 rounded-full border border-[#E4E4E7] flex items-center justify-center"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="w-3.5 h-3.5 text-[#52525B]" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                      className="overflow-hidden"
                    >
                      <p className="text-[#52525B] text-sm pb-6 leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
