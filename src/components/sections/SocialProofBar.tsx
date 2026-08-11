'use client';

import { motion } from 'framer-motion';

const LOGOS = ['Acme Corp', 'Vercel', 'Linear', 'Notion', 'Stripe', 'Shopify'];

export function SocialProofBar() {
  return (
    <section className="py-12 border-y border-[#F0F0F0]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <motion.p
          className="text-center text-xs font-medium text-[#A1A1AA] uppercase tracking-widest mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Trusted by engineering teams at
        </motion.p>
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {LOGOS.map((name) => (
            <span
              key={name}
              className="text-lg font-bold text-[#A1A1AA] opacity-40 hover:opacity-100 transition-opacity duration-300 select-none"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}