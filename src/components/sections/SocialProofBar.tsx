'use client';
import { motion } from 'framer-motion';

const ease = [0.25, 0.1, 0.25, 1] as const;

/* Inline SVG wordmarks — width/height set as HTML attributes for reliable sizing */
function VercelLogo() {
  return (
    <svg viewBox="0 0 76 28" fill="none" width="76" height="28" aria-label="Vercel">
      <path d="M37.5274 0L75.0548 28H0L37.5274 0Z" fill="currentColor" />
    </svg>
  );
}

function LinearLogo() {
  return (
    <svg viewBox="0 0 100 28" fill="none" width="100" height="28" aria-label="Linear">
      <path d="M0 0h12v28H0V0zm14 0h12v28H14V0zm56 0h12v28H70V0zm14 0h12v28H84V0zM28 0h12v28H28V0zm28 0h12v28H56V0z" fill="currentColor" />
    </svg>
  );
}

function NotionLogo() {
  return (
    <svg viewBox="0 0 110 28" fill="none" width="110" height="28" aria-label="Notion">
      <path d="M14.4 3.6c-1.2 0-2 .4-2.4 1.6L4.8 20.4c-.4.8-.4 1.2 0 1.6.4.4.8.4 1.6.4h4c.8 0 1.2-.4 1.6-1.2l1.2-3.2h8.4l1.2 3.2c.4.8.8 1.2 1.6 1.2h4c.8 0 1.2 0 1.6-.4.4-.4.4-.8 0-1.6L22 5.2c-.4-1.2-1.2-1.6-2.4-1.6h-5.2zM17.6 9.2l2.8 6.8h-5.6l2.8-6.8zM38 3.6c-.8 0-1.2.4-1.2 1.2v18.4c0 .8.4 1.2 1.2 1.2h8c4.4 0 8-2.8 8-7.6 0-4.4-2.8-7.2-6.4-7.2h-5.2V4.8c0-.8-.4-1.2-1.2-1.2H38zm6.4 10.4h-4.8v6.4h4.8c2 0 3.6-1.2 3.6-3.2s-1.6-3.2-3.6-3.2zM56 3.6c-.8 0-1.2.4-1.2 1.2v18.4c0 .8.4 1.2 1.2 1.2h2c.8 0 1.2-.4 1.2-1.2V4.8c0-.8-.4-1.2-1.2-1.2h-2zM72 3.6c-.8 0-1.2.4-1.2 1.2v18.4c0 .8.4 1.2 1.2 1.2h2c.8 0 1.2-.4 1.2-1.2v-6.8l6 7.6c.4.4.8.8 1.6.8h2.4c.8 0 1.2-.4 1.2-1.2 0-.4-.4-.8-.8-1.2l-6.8-8.4 6.4-7.6c.4-.4.8-.8.8-1.2 0-.8-.4-1.2-1.2-1.2h-2.4c-.8 0-1.2.4-1.6.8l-5.6 7.2V4.8c0-.8-.4-1.2-1.2-1.2h-2z" fill="currentColor" />
    </svg>
  );
}

function StripeLogo() {
  return (
    <svg viewBox="0 0 80 28" fill="none" width="80" height="28" aria-label="Stripe">
      <path d="M56.3 8.5c-2.4 0-4.1.8-5.4 1.8V9.1c0-.8-.4-1.2-1.2-1.2h-2.4c-.8 0-1.2.4-1.2 1.2v15.7c0 .8.4 1.2 1.2 1.2h2.4c.8 0 1.2-.4 1.2-1.2v-8.1c0-3.2 1.6-5.2 4.3-5.2 2.4 0 3.7 1.6 3.7 4.5v8.8c0 .8.4 1.2 1.2 1.2h2.4c.8 0 1.2-.4 1.2-1.2v-9.8c0-4.7-2.5-7.7-6.4-7.7zM14.6 8.1H10V3.3c0-.8-.4-1.2-1.2-1.2H6.4c-.8 0-1.2.4-1.2 1.2v4.8H1.6c-.8 0-1.2.4-1.2 1.2v2c0 .8.4 1.2 1.2 1.2h3.6v7.2c0 5.6 2.8 8 7.6 8 1.2 0 2.4-.2 3.2-.6.8-.4.8-.8.8-1.2v-2c0-.6-.4-1-1-1h-.4c-2.4 0-3.8-1.2-3.8-4.4v-6h4.6c.8 0 1.2-.4 1.2-1.2v-2c0-.8-.4-1.2-1.2-1.2zM33.4 8.1c-5.2 0-9 3.6-9 9.2 0 5.6 3.8 9.2 9 9.2 5.2 0 9-3.6 9-9.2 0-5.6-3.8-9.2-9-9.2zm0 15c-2.8 0-5-2.2-5-5.8 0-3.6 2.2-5.8 5-5.8 2.8 0 5 2.2 5 5.8 0 3.6-2.2 5.8-5 5.8zM73.4 8.1c-2 0-3.6 1-4.8 2.4V9.1c0-.8-.4-1.2-1.2-1.2H65c-.8 0-1.2.4-1.2 1.2v15.7c0 .8.4 1.2 1.2 1.2h2.4c.8 0 1.2-.4 1.2-1.2v-8.4c0-3.2 1.6-5.2 4.3-5.2h.4c.8 0 1.2-.4 1.2-1.2v-2c0-.8-.4-1.2-1.2-1.2h-.5z" fill="currentColor" />
    </svg>
  );
}

function ShopifyLogo() {
  return (
    <svg viewBox="0 0 108 28" fill="none" width="108" height="28" aria-label="Shopify">
      <path d="M22.4 0L3.6 5.2c-1.6.4-2 1.2-1.6 2.8l4 15.2c.4 1.6 1.2 2 2.8 1.6l8.8-2.4c.4 0 .4-.4.4-.8l-.4-1.6c0-.4-.4-.4-.8-.4l-7.6 2c-.8.2-1.2 0-1.4-.8L6.4 15l8.4-2.4c.4 0 .4-.4.4-.8l-.4-1.6c0-.4-.4-.4-.8-.4l-8.8 2.4L3.2 8.8l17.6-4.8c.8-.2 1.2 0 1.4.8l4 14.8c.2.8 0 1.2-.8 1.4l-4 1.2c-.4 0-.4.4-.4.8l.4 1.6c0 .4.4.4.8.4l4.4-1.2c1.6-.4 2-1.2 1.6-2.8L23.6 1.2c-.2-1-1-1.4-1.2-1.2zM35.2 7.2c-3.6 0-6.4 2-6.4 4.8 0 3.2 2.4 4.4 4.4 5.2 2 .8 3.6 1.6 3.6 3.2 0 1.6-1.6 2.4-3.2 2.4-2.4 0-4.4-1.2-5.6-2-.4-.2-.8 0-.8.4l-.8 1.6c-.2.4 0 .8.4.8 1.6 1.2 4 2.4 6.8 2.4 4 0 6.8-2 6.8-5.2 0-3.2-2.4-4.4-4.4-5.2-2-.8-3.6-1.6-3.6-3.2 0-1.2 1.2-2.4 3.2-2.4 1.6 0 3.2.8 4.4 1.6.4.2.8 0 .8-.4l.8-1.6c0-.4-.2-.8-.6-.8-1.4-.8-3.2-1.6-5.4-1.6zM52.4 7.2c-1.6 0-3.2.8-4.4 2.4V8.4c0-.8-.4-1.2-1.2-1.2h-2c-.8 0-1.2.4-1.2 1.2v16c0 .8.4 1.2 1.2 1.2h2c.8 0 1.2-.4 1.2-1.2v-8.8c0-2.8 1.6-4.8 4-4.8 2 0 3.2 1.6 3.2 4v9.6c0 .8.4 1.2 1.2 1.2h2c.8 0 1.2-.4 1.2-1.2v-10c.2-4.4-2.6-8-7.2-8z" fill="currentColor" />
    </svg>
  );
}

function FigmaLogo() {
  return (
    <svg viewBox="0 0 28 40" fill="none" width="24" height="34" aria-label="Figma">
      <path d="M14 0C9.6 0 6 3.6 6 8c0 2.4 1.2 4.4 3 5.8C5.2 15 3 17.8 3 20.8 3 25.2 6.4 28.8 11 29.2V38c0 1.1.9 2 2 2s2-.9 2-2v-8.8c4.6-.4 8-4 8-8.4 0-3-2.2-5.8-6-7 1.8-1.4 3-3.4 3-5.8 0-4.4-3.6-8-8-8zm-4 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm4 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" fill="currentColor" />
    </svg>
  );
}

const BRANDS = [
  { name: 'Vercel', Component: VercelLogo },
  { name: 'Linear', Component: LinearLogo },
  { name: 'Notion', Component: NotionLogo },
  { name: 'Stripe', Component: StripeLogo },
  { name: 'Shopify', Component: ShopifyLogo },
  { name: 'Figma', Component: FigmaLogo },
] as const;

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
            <motion.div
              key={brand.name}
              className="text-[#71717A] opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-[#52525B] transition-all duration-300 cursor-default select-none"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: i * 0.08, ease }}
            >
              <brand.Component />
            </motion.div>
          ))}
        </div>

        {/* Mobile - horizontal scroll */}
        <div className="md:hidden flex gap-12 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-6 px-6 py-2">
          {BRANDS.map((brand) => (
            <div
              key={brand.name}
              className="text-[#71717A] opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-[#52525B] transition-all duration-300 cursor-default select-none snap-center shrink-0 flex items-center"
            >
              <brand.Component />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
