'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BRANDS = [
  { name: 'Vercel', className: 'font-bold text-xl tracking-tighter' },
  { name: 'Linear', className: 'font-semibold text-lg tracking-tight italic' },
  { name: 'Notion', className: 'font-bold text-lg' },
  { name: 'Stripe', className: 'font-extrabold text-xl tracking-tight' },
  { name: 'Shopify', className: 'font-light text-lg tracking-wide' },
  { name: 'Figma', className: 'font-semibold text-lg' },
] as const;

const ease = [0.25, 0.1, 0.25, 1] as const;

export function SocialProofBar() {
  return (
    <section className="bg-[#F8F9FA] py-16 border-y border-[#F0F0F0] overflow-hidden">
      <motion.p
        className="text-center text-xs font-semibold uppercase tracking-widest text-[#A1A1AA] mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease }}
      >
        Trusted by engineering teams at
      </motion.p>
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-center gap-12">
          {BRANDS.map((brand, i) => (
            <motion.span
              key={brand.name}
              className={cn(
                'text-[#A1A1AA]/40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-default select-none',
                brand.className
              )}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
              aria-label={brand.name}
            >
              {brand.name}
            </motion.span>
          ))}
        </div>

        {/* Mobile - horizontal scroll */}
        <div className="md:hidden flex gap-10 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 pb-2">
          {BRANDS.map((brand) => (
            <span
              key={brand.name}
              className={cn(
                'text-[#A1A1AA]/40 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0 cursor-default select-none snap-center shrink-0',
                brand.className
              )}
              aria-label={brand.name}
            >
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
