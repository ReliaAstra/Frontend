'use client';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';

const ease = [0.25, 0.1, 0.25, 1] as const;

export function FounderSection() {
  return (
    <section className="bg-[#F8F9FA] py-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#09090B]">
            Built by engineers who&apos;ve been there.
          </h2>
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl p-10 border border-[#E4E4E7] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] max-w-xl mx-auto text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease }}
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full bg-[#0891B2]/10 flex items-center justify-center mx-auto mb-6"
            aria-label="Emmanuel Osei, Founder"
          >
            <span className="text-[#0891B2] font-bold text-xl">EO</span>
          </div>

          <h3 className="text-lg font-semibold text-[#09090B]">
            Emmanuel Osei
          </h3>
          <p className="text-[#A1A1AA] text-sm mt-1">
            Founder &amp; CEO
          </p>
          <p className="text-[#52525B] mt-4 text-sm leading-relaxed max-w-md mx-auto">
            Previously infrastructure lead at a Series B SaaS. Spent 3 years
            watching vendors take down production with no way to prove it.
            Reliastra is the tool I wish I had.
          </p>

          <a
            href="https://linkedin.com/in/emmanuel-osei"
            className="inline-flex items-center justify-center gap-2 mt-6 text-[#52525B] hover:text-[#0891B2] transition-colors min-h-[44px]"
            aria-label="Emmanuel Osei's LinkedIn profile"
          >
            <Linkedin className="w-5 h-5" aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
