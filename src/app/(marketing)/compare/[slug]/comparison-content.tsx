'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Check, Minus, Scale, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Comparison, Verdict } from '@/lib/comparison-data';

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-70px' },
  transition: { duration: 0.5, ease },
};

/* ── Verdict indicator ───────────────────────────────────────────────────── */

function VerdictCell({
  verdict,
  note,
  emphasis,
}: {
  verdict: Verdict;
  note?: string;
  emphasis?: boolean;
}) {
  const config = {
    yes: {
      icon: Check,
      color: '#0891B2',
      bg: 'rgba(8,145,178,0.10)',
      ring: 'rgba(8,145,178,0.22)',
      label: 'Yes',
    },
    partial: {
      icon: Minus,
      color: '#A1A1AA',
      bg: 'rgba(161,161,170,0.10)',
      ring: 'rgba(161,161,170,0.20)',
      label: 'Partial',
    },
    no: {
      icon: X,
      color: '#E7818B',
      bg: 'rgba(220,38,38,0.07)',
      ring: 'rgba(220,38,38,0.14)',
      label: 'No',
    },
  }[verdict];

  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-200',
          emphasis && verdict === 'yes' && 'scale-110',
        )}
        style={{ backgroundColor: config.bg, boxShadow: `inset 0 0 0 1px ${config.ring}` }}
      >
        <Icon className="h-4 w-4" style={{ color: config.color }} aria-hidden="true" />
        <span className="sr-only">{config.label}</span>
      </span>
      {note && (
        <span className="max-w-[150px] text-[11px] leading-snug text-[#A1A1AA]">{note}</span>
      )}
    </div>
  );
}

/* ── Sticky CTA bar ──────────────────────────────────────────────────────── */

function StickyCta({ competitor }: { competitor: string }) {
  const [visible, setVisible] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" />
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#E4E4E7] bg-white/90 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 px-6 py-3.5 sm:flex-row sm:justify-between md:px-12">
              <p className="text-center text-[13px] text-[#52525B] sm:text-left">
                <span className="font-semibold text-[#09090B]">
                  Still deciding between Reliastra and {competitor}?
                </span>{' '}
                <span className="hidden sm:inline">
                  Start with the free tier — no card required.
                </span>
              </p>
              <div className="flex shrink-0 items-center gap-2.5">
                <Link
                  href="/track"
                  className="hidden h-10 items-center rounded-[10px] border border-[#E4E4E7] px-4 text-[13px] font-semibold text-[#09090B] transition-colors hover:border-[#09090B] sm:inline-flex"
                >
                  See live data
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#0A0A0F] px-5 text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-lg"
                >
                  Get started free
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export function ComparisonContent({ data }: { data: Comparison }) {
  const { competitor } = data;

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="border-b border-[#F0F0F0] px-6 pb-16 pt-20 md:px-12 md:pb-20 md:pt-28"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(8,145,178,0.05) 0%, transparent 100%)',
        }}
      >
        <div className="mx-auto max-w-[1000px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <li>
                  <Link href="/compare" className="transition-colors hover:text-[#09090B]">
                    Compare
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="font-medium text-[#52525B]">Reliastra vs {competitor}</li>
              </ol>
            </nav>

            <h1 className="max-w-4xl text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#09090B] sm:text-[54px] lg:text-[64px]">
              Reliastra <span className="font-normal text-[#A1A1AA]">vs</span>{' '}
              <span className="text-[#0891B2]">{competitor}</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-[#52525B]">
              {data.positioning}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="group inline-flex h-12 items-center gap-2 rounded-[10px] bg-[#0A0A0F] px-6 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/track"
                className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-[#E4E4E7] bg-white px-6 text-sm font-semibold text-[#09090B] transition-colors duration-200 hover:border-[#09090B] hover:bg-[#F8F9FA]"
              >
                See live vendor data
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Intro ───────────────────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-20">
        <motion.div className="mx-auto max-w-[720px]" {...fadeUp}>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
            The short version
          </p>
          <div className="space-y-5">
            {data.intro.map((para, i) => (
              <p
                key={i}
                className={cn(
                  'leading-relaxed text-[#52525B]',
                  i === 0 && 'text-[19px] leading-relaxed text-[#09090B]',
                )}
              >
                {para}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Honest strengths, side by side ─────────────────────────────── */}
      <section className="border-y border-[#F0F0F0] bg-[#FCFCFD] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1100px]">
          <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              Where each one wins
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#09090B] sm:text-4xl">
              Both columns are honest.
            </h2>
            <p className="mt-5 leading-relaxed text-[#52525B]">
              We list what {competitor} does better first, because a comparison that only flatters
              its author is not worth reading.
            </p>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Competitor strengths */}
            <motion.div
              className="rounded-[20px] border border-[#E4E4E7] bg-white p-7 sm:p-8"
              {...fadeUp}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#F4F4F5]">
                  <Scale className="h-5 w-5 text-[#52525B]" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-[#09090B]">
                  Where {competitor} is stronger
                </h3>
              </div>
              <ul className="space-y-5">
                {data.competitorStrengths.map((item) => (
                  <li key={item.title} className="border-l-2 border-[#E4E4E7] pl-4">
                    <h4 className="text-[15px] font-semibold text-[#09090B]">{item.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Reliastra strengths */}
            <motion.div
              className="rounded-[20px] border border-[#0891B2]/25 bg-white p-7 shadow-[0_0_0_1px_rgba(8,145,178,0.06),0_8px_32px_rgba(8,145,178,0.06)] sm:p-8"
              {...fadeUp}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#0891B2]/10">
                  <Sparkles className="h-5 w-5 text-[#0891B2]" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold tracking-tight text-[#09090B]">
                  Where Reliastra is stronger
                </h3>
              </div>
              <ul className="space-y-5">
                {data.reliastraStrengths.map((item) => (
                  <li key={item.title} className="border-l-2 border-[#0891B2]/30 pl-4">
                    <h4 className="text-[15px] font-semibold text-[#09090B]">{item.title}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#52525B]">{item.body}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Feature comparison ──────────────────────────────────────────── */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1000px]">
          <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              Feature by feature
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#09090B] sm:text-4xl">
              The detail.
            </h2>
          </motion.div>

          <div className="mt-14 space-y-12">
            {data.categories.map((category, catIndex) => (
              <motion.div key={category.title} {...fadeUp}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">
                  {category.title}
                </h3>

                <div className="overflow-hidden rounded-[18px] border border-[#E4E4E7] bg-white">
                  {/* Column header */}
                  <div className="grid grid-cols-[1fr_88px_88px] items-center gap-3 border-b border-[#E4E4E7] bg-[#FCFCFD] px-5 py-3.5 sm:grid-cols-[1fr_170px_170px] sm:gap-4 sm:px-7">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Capability
                    </span>
                    <span className="text-center text-[12px] font-bold text-[#0891B2] sm:text-[13px]">
                      Reliastra
                    </span>
                    <span className="text-center text-[12px] font-bold text-[#52525B] sm:text-[13px]">
                      {competitor}
                    </span>
                  </div>

                  {/* Rows */}
                  {category.rows.map((row, i) => (
                    <motion.div
                      key={row.feature}
                      className={cn(
                        'grid grid-cols-[1fr_88px_88px] items-center gap-3 border-b border-[#F5F5F5] px-5 py-5 last:border-0 sm:grid-cols-[1fr_170px_170px] sm:gap-4 sm:px-7',
                        i % 2 === 1 && 'bg-[#FCFCFD]',
                      )}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.42,
                        delay: Math.min(i * 0.05, 0.3),
                        ease,
                      }}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[14px] font-semibold leading-snug text-[#09090B] sm:text-[15px]">
                          {row.feature}
                        </p>
                        <p className="mt-1 text-[12px] leading-snug text-[#A1A1AA] sm:text-[13px]">
                          {row.detail}
                        </p>
                      </div>
                      <VerdictCell verdict={row.reliastra} note={row.reliastraNote} emphasis />
                      <VerdictCell verdict={row.competitor} note={row.competitorNote} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Legend */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-[#A1A1AA]"
            {...fadeUp}
          >
            <span className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-[#0891B2]" aria-hidden="true" />
              Supported
            </span>
            <span className="inline-flex items-center gap-2">
              <Minus className="h-3.5 w-3.5 text-[#A1A1AA]" aria-hidden="true" />
              Partial or workaround
            </span>
            <span className="inline-flex items-center gap-2">
              <X className="h-3.5 w-3.5 text-[#E7818B]" aria-hidden="true" />
              Not supported
            </span>
          </motion.div>
        </div>
      </section>

      {/* ── Best for ────────────────────────────────────────────────────── */}
      <section className="border-y border-[#F0F0F0] bg-[#FCFCFD] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-[1000px]">
          <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              Best for
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#09090B] sm:text-4xl">
              Which one is right for you?
            </h2>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Reliastra card */}
            <motion.div
              className="group relative overflow-hidden rounded-[22px] bg-[#0A0A0F] p-8 sm:p-10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.55, ease }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(8,145,178,0.22) 0%, transparent 70%)',
                }}
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0891B2]/15 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#67E8F9]">
                  Reliastra
                </span>
                <h3 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-[#FAFAFA]">
                  {data.bestFor.reliastra.headline}
                </h3>
                <ul className="mt-7 space-y-3.5">
                  {data.bestFor.reliastra.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#0891B2]"
                        aria-hidden="true"
                      />
                      <span className="text-[14px] leading-relaxed text-[#D4D4D8]">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="group/cta mt-9 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#FAFAFA] px-6 text-sm font-semibold text-[#0A0A0F] transition-all duration-200 hover:shadow-lg"
                >
                  Start free
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Competitor card */}
            <motion.div
              className="rounded-[22px] border border-[#E4E4E7] bg-white p-8 sm:p-10"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-70px' }}
              transition={{ duration: 0.55, delay: 0.1, ease }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F4F5] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#52525B]">
                {competitor}
              </span>
              <h3 className="mt-6 text-2xl font-semibold leading-snug tracking-tight text-[#09090B]">
                {data.bestFor.competitor.headline}
              </h3>
              <ul className="mt-7 space-y-3.5">
                {data.bestFor.competitor.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#52525B]" aria-hidden="true" />
                    <span className="text-[14px] leading-relaxed text-[#52525B]">{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href={data.competitorUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-9 inline-flex h-11 items-center gap-2 rounded-[10px] border border-[#E4E4E7] px-6 text-sm font-semibold text-[#09090B] transition-colors duration-200 hover:border-[#09090B] hover:bg-[#F8F9FA]"
              >
                Visit {competitor}
              </a>
            </motion.div>
          </div>

          {/* Using both */}
          <motion.div
            className="mx-auto mt-10 max-w-[760px] rounded-[18px] border border-[#0891B2]/20 bg-[#0891B2]/[0.04] p-7 sm:p-8"
            {...fadeUp}
          >
            <h3 className="text-[15px] font-semibold text-[#09090B]">Can you use both?</h3>
            <p className="mt-2.5 leading-relaxed text-[#52525B]">{data.together}</p>
          </motion.div>
        </div>
      </section>

      <StickyCta competitor={competitor} />
    </>
  );
}
