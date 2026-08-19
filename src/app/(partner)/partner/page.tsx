'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Share2,
  TrendingUp,
  Shield,
  DollarSign,
  HeadphonesIcon,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { getPartnerProgram } from '@/services/partnerService';
import type { PartnerProgram, CommissionRate } from '@/types/partner';

// ── Animation variants ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const viewportConfig = { once: true, margin: '-100px' } as const;

// ── Helpers ─────────────────────────────────────────────────────

const ACTION_TYPE_LABELS: Record<CommissionRate['action_type'], string> = {
  refer: 'Referral',
  deploy: 'Deployment',
  create: 'Account Creation',
  introduce: 'Introduction',
};

const FALLBACK_COMMISSIONS: CommissionRate[] = [
  { id: '1', partner_program_id: '', action_type: 'refer', rate: 0, description: 'Earn commissions when your referral signs up for a paid plan.', created_at: '' },
  { id: '2', partner_program_id: '', action_type: 'deploy', rate: 0, description: 'Earn when a referred customer deploys the monitoring agent.', created_at: '' },
  { id: '3', partner_program_id: '', action_type: 'create', rate: 0, description: 'Earn when a referred user creates a new organization.', created_at: '' },
  { id: '4', partner_program_id: '', action_type: 'introduce', rate: 0, description: 'Earn for qualified introductions to our sales team.', created_at: '' },
];

// ── Section Header ──────────────────────────────────────────────

function SectionHeader({
  label,
  title,
  description,
}: {
  label?: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className="text-center max-w-2xl mx-auto mb-16"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      {label && (
        <span className="inline-block text-xs font-semibold tracking-wide uppercase text-[#0891B2] mb-4">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-[40px] font-bold tracking-[-0.025em] leading-[1.15] text-[#09090B]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base md:text-lg leading-relaxed text-[#52525B]">
          {description}
        </p>
      )}
    </motion.div>
  );
}

// ── FAQ Item ────────────────────────────────────────────────────

function FAQItem({
  question,
  answer,
  isLast,
}: {
  question: string;
  answer: string;
  isLast: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={!isLast ? 'border-b border-[#E4E4E7]' : ''}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-base md:text-[17px] font-medium text-[#09090B] pr-8 group-hover:text-[#0891B2] transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#A1A1AA] shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '300px' : '0px' }}
      >
        <p className="pb-5 text-[15px] leading-relaxed text-[#52525B]">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ── Commission Card ─────────────────────────────────────────────

function CommissionCard({
  commission,
  isFallback,
  index,
}: {
  commission: CommissionRate;
  isFallback: boolean;
  index: number;
}) {
  return (
    <motion.div
      className="bg-white border border-[#E4E4E7] rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig}
    >
      <span className="text-sm font-medium text-[#52525B] mb-3">
        {ACTION_TYPE_LABELS[commission.action_type]}
      </span>
      {isFallback ? (
        <span className="text-4xl font-bold text-[#0891B2] mb-3">Contact us</span>
      ) : (
        <span
          className="text-4xl font-bold text-[#09090B] mb-3"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {commission.rate}%
        </span>
      )}
      <p className="text-sm leading-relaxed text-[#A1A1AA]">
        {commission.description}
      </p>
    </motion.div>
  );
}

// ── Skeleton Card ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-gray-100 rounded-2xl p-8 animate-pulse">
      <div className="w-20 h-4 bg-gray-200 rounded mx-auto mb-4" />
      <div className="w-16 h-10 bg-gray-200 rounded mx-auto mb-4" />
      <div className="w-full h-3 bg-gray-200 rounded" />
      <div className="w-3/4 h-3 bg-gray-200 rounded mt-2" />
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function PartnerPage() {
  const [partnerData, setPartnerData] = useState<PartnerProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPartnerProgram()
      .then((data) => setPartnerData(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const commissions = partnerData?.commission_rates ?? [];
  const isError = error || commissions.length === 0;
  const displayCommissions = isError ? FALLBACK_COMMISSIONS : commissions;

  return (
    <>
      {/* ── 1. Hero ──────────────────────────────────────────── */}
      <section className="bg-white pt-[140px] pb-24 md:pt-[180px] md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="inline-flex items-center text-xs font-semibold tracking-wide uppercase text-[#0891B2] bg-[#0891B2]/8 border border-[#0891B2]/15 px-3.5 py-1.5 rounded-full mb-6">
              Partner Program
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold tracking-[-0.03em] leading-[1.1] text-[#09090B] whitespace-pre-line">
              {"Earn Revenue by Introducing\nDependency Intelligence"}
            </h1>

            <p className="mt-6 text-lg md:text-xl leading-relaxed text-[#52525B] max-w-2xl">
              Join the RELIASTRA Partner Program and earn competitive commissions
              on every referral. Help your clients and network monitor, prove, and
              recover from vendor SLA breaches.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="/register?returnTo=%2F"
                className="inline-flex items-center justify-center bg-[#09090B] text-white rounded-[10px] font-semibold text-sm px-6 py-3 hover:bg-[#09090B]/90 transition-colors"
              >
                Join the Program
              </a>
              <a
                href="/login?returnTo=%2F"
                className="text-sm font-medium text-[#A1A1AA] hover:text-[#52525B] transition-colors"
              >
                Sign In
              </a>
            </div>

            <p className="mt-5 text-sm text-[#A1A1AA]">
              No upfront costs. Start earning from your first referral.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 2. How It Works ──────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#F8F9FA] py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            label="Simple Process"
            title="How It Works"
            description="Get started in minutes. No complex onboarding, no lengthy approvals — just sign up and start sharing."
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {[
              {
                icon: UserPlus,
                step: 1,
                title: 'Sign Up',
                desc: 'Create your free partner account. No fees, no minimums, no commitments.',
              },
              {
                icon: Share2,
                step: 2,
                title: 'Share & Refer',
                desc: 'Use your unique referral link to introduce RELIASTRA to your network, clients, or audience.',
              },
              {
                icon: TrendingUp,
                step: 3,
                title: 'Earn Commissions',
                desc: 'Get paid competitive commissions on every qualified referral that converts to a paid account.',
              },
            ].map(({ icon: Icon, step, title, desc }) => (
              <motion.div
                key={step}
                className="bg-white border border-[#E4E4E7] rounded-2xl p-8 relative"
                variants={fadeUp}
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#0891B2] text-white text-xs font-bold mb-5">
                  {step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#09090B]" />
                </div>
                <h3 className="text-lg font-semibold text-[#09090B] mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#52525B]">
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 3. Commission Structure ──────────────────────────── */}
      <section id="commission" className="bg-white py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            title="Competitive Commission Structure"
            description="Our commissions are loaded dynamically from the live partner program API."
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {isError && (
                <p className="text-center text-sm text-[#A1A1AA] mb-8">
                  Commission rates are currently unavailable. Please contact us for details.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayCommissions.map((commission, i) => (
                  <CommissionCard
                    key={commission.id}
                    commission={commission}
                    isFallback={isError}
                    index={i}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 4. Why Partner With Us ──────────────────────────── */}
      <section className="bg-white py-24 md:py-32 border-t border-[#E4E4E7]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            label="Partner Benefits"
            title="Why Partners Choose RELIASTRA"
          />

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {[
              {
                icon: Shield,
                title: 'Real Product, Real Value',
                desc: 'RELIASTRA solves a concrete, expensive problem: vendor SLA monitoring and evidence generation. Your referrals get immediate ROI.',
              },
              {
                icon: DollarSign,
                title: 'Generous, Transparent Commissions',
                desc: 'Competitive rates on all commission types. Track every click, conversion, and payout in your partner dashboard.',
              },
              {
                icon: HeadphonesIcon,
                title: 'Dedicated Partner Support',
                desc: 'Get access to partner-only resources, co-marketing opportunities, and a direct line to our team.',
              },
              {
                icon: BarChart3,
                title: 'Growing Market',
                desc: 'Every SaaS company depends on third-party APIs. The external dependency intelligence market is expanding rapidly.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                className="bg-white border border-[#E4E4E7] rounded-2xl p-8 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300"
                variants={fadeUp}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E4E4E7] flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#09090B]" />
                </div>
                <h3 className="text-lg font-semibold text-[#09090B] mb-2">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#52525B]">
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 5. Who Should Join ──────────────────────────────── */}
      <section className="bg-[#F8F9FA] py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            title="Is the Partner Program Right for You?"
            description="Our program is designed for professionals and organizations that work closely with SaaS, cloud infrastructure, and developer tools."
          />

          <motion.div
            className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportConfig}
          >
            {[
              'DevOps & SRE Consultants',
              'Cloud Migration Agencies',
              'Managed Service Providers (MSPs)',
              'Technology Advisors',
              'SaaS Resellers',
              'Venture Capital Associates',
              'DevRel & Community Leaders',
              'Solutions Architects',
              'Freelance Developers',
              'API-First Startups',
            ].map((tag) => (
              <motion.span
                key={tag}
                className="bg-white border border-[#E4E4E7] rounded-full px-4 py-2 text-sm text-[#52525B] hover:border-[#0891B2]/40 hover:text-[#09090B] hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-200 cursor-default"
                variants={fadeUp}
              >
                {tag}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 6. FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="bg-white py-24 md:py-32 border-t border-[#E4E4E7]">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <SectionHeader
            label="FAQ"
            title="Frequently Asked Questions"
          />

          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {[
              {
                q: 'How do I join the partner program?',
                a: 'Sign up for a free RELIASTRA account, then apply through the partner dashboard. Applications are typically reviewed within 1-2 business days.',
              },
              {
                q: 'Is there a cost to join?',
                a: 'No. The partner program is completely free. There are no upfront fees, minimums, or ongoing costs.',
              },
              {
                q: 'How are commissions tracked?',
                a: 'Each partner receives unique referral links. When someone signs up through your link and converts to a paid plan, the commission is automatically attributed to your account.',
              },
              {
                q: 'When and how do I get paid?',
                a: 'Commissions are tracked in real-time in your partner dashboard. Payouts are processed on a monthly schedule for all earned commissions.',
              },
              {
                q: 'Can I use multiple referral links?',
                a: 'Yes. You can create multiple named referral links for different channels, campaigns, or audiences to track what works best.',
              },
              {
                q: 'What resources are available for partners?',
                a: 'Partners get access to marketing materials, product training, dedicated support, co-marketing opportunities, and a partner-only community.',
              },
            ].map((item, i, arr) => (
              <FAQItem
                key={item.q}
                question={item.q}
                answer={item.a}
                isLast={i === arr.length - 1}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 7. Final CTA ────────────────────────────────────── */}
      <section className="bg-[#0A0A0F] py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewportConfig}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h2 className="text-3xl md:text-[40px] font-bold tracking-[-0.025em] leading-[1.15] text-white">
              Ready to Start Earning?
            </h2>
            <p className="mt-4 text-lg text-white/60 leading-relaxed">
              Join the RELIASTRA Partner Program and turn your network into
              recurring revenue.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/register?returnTo=%2F"
                className="inline-flex items-center justify-center bg-[#0891B2] text-white rounded-[10px] font-semibold text-sm px-6 py-3 hover:bg-[#0891B2]/90 transition-colors"
              >
                Join the Program
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center border border-white/20 text-white rounded-[10px] font-semibold text-sm px-6 py-3 hover:bg-white/5 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
