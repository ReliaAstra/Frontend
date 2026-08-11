'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'How is Reliastra different from regular uptime monitoring?',
    a: 'Regular monitoring watches your own services. Reliastra independently monitors the third-party APIs you depend on, correlates their health with your service metrics, and generates SLA evidence reports you can send to vendors to claim credits. It\'s the only tool that closes the loop from "vendor failed" to "here\'s the proof."',
  },
  {
    q: 'What counts as an "independent" verification?',
    a: 'Reliastra monitors vendors from infrastructure we control — not the vendor\'s infrastructure. We run checks from multiple cloud regions and data centers, creating a chain of custody with cryptographic timestamps that vendors can\'t dispute.',
  },
  {
    q: 'Which vendors do you support?',
    a: 'Reliastra is vendor-agnostic. You can monitor any HTTP-based API or service. We have pre-built templates for popular vendors like Stripe, Auth0, Twilio, OpenAI, Cloudflare, Vercel, and many more. Custom vendors take under 2 minutes to set up.',
  },
  {
    q: 'How do SLA evidence reports work?',
    a: 'When a vendor incident is detected and correlated with your service impact, Reliastra automatically generates a timestamped PDF report with: multi-region verification data, latency charts, error logs, correlation analysis with confidence scores, and a summary of SLA terms breached. You can share this directly with vendor support.',
  },
  {
    q: 'Will this actually help me get SLA credits?',
    a: 'Yes. Major cloud vendors including AWS, GCP, and Azure accept third-party evidence in SLA credit claims. Our reports follow the format and evidence standards these vendors expect. Customers report a significantly higher credit approval rate when submitting Reliastra evidence versus screenshots or their own logs.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We don\'t store your API keys or credentials. Monitoring uses lightweight health checks (HTTP requests, DNS queries) — we never proxy your actual traffic. All data is encrypted at rest and in transit. We\'re SOC 2 Type II certified and GDPR compliant.',
  },
];

export function FAQSection() {
  return (
    <section className="py-24 md:py-32 bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <span className="text-xs font-semibold text-[#0891B2] uppercase tracking-widest">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#09090B] mt-4 tracking-tight">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-white border border-[#E4E4E7] rounded-lg px-6 mb-3"
              >
                <AccordionTrigger className="text-left text-sm font-semibold text-[#09090B] hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#52525B] leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
