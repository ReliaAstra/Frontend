'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Code2,
  FileText,
  Gauge,
  Handshake,
  Layers3,
  Loader2,
  Network,
  PenTool,
  Rocket,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BackendError } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import {
  economicModelStages,
  earningMethods,
  faqItems,
  fallbackResources,
  lifecycleSteps,
  longLifecycle,
  maturityLadder,
  participantCategories,
  partnerAccessComparison,
  partnerAudience,
  scenarios,
} from '@/lib/partner-content';
import { cn } from '@/lib/utils';
import {
  applyPartner,
  getPartnerResources,
  getPartnerTiers,
  type PartnerResource,
  type PartnerTier,
} from '@/services/partnerApi';
import { useAuth } from '@/lib/auth-context';
import { usePartnerHref, useProductHref } from './usePartnerHref';

const ease = [0.25, 0.1, 0.25, 1] as const;
const viewport = { once: true, margin: '-120px' } as const;

function usePageTracking(eventName: string) {
  useEffect(() => {
    trackEvent(eventName);
  }, [eventName]);
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#0891B2]/15 bg-[#0891B2]/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0891B2]" aria-hidden="true" />
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.5, ease }}
      className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}
    >
      {eyebrow ? <SectionEyebrow>{eyebrow}</SectionEyebrow> : null}
      <h2 className="mt-5 text-[32px] font-[800] leading-[1.08] tracking-[-0.03em] text-[#09090B] md:text-[44px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-[16px] leading-relaxed text-[#52525B] md:text-[18px]">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto max-w-[1240px] px-6 md:px-12', className)}>{children}</div>;
}

function MonoLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-mono text-[12px] uppercase tracking-[0.16em] text-[#71717A]', className)}>
      {children}
    </span>
  );
}

function StatusPill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'qualified' | 'pending';
}) {
  const toneClass =
    tone === 'qualified'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'pending'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-[#E4E4E7] bg-white text-[#52525B]';

  return (
    <span className={cn('inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium', toneClass)}>
      {children}
    </span>
  );
}

function PartnerCTA({
  href,
  children,
  secondary,
  eventLocation,
  eventName = 'partner_cta_clicked',
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  eventLocation: string;
  eventName?: string;
}) {
  return (
    <a
      href={href}
      onClick={() => trackEvent(eventName, { location: eventLocation })}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] px-6 py-3 text-sm font-semibold transition-all duration-200',
        secondary
          ? 'border border-[#E4E4E7] bg-white text-[#09090B] hover:border-[#09090B] hover:bg-[#F8F9FA]'
          : 'bg-[#0A0A0F] text-white hover:-translate-y-[1px] hover:bg-[#111116] hover:shadow-xl',
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

function AudienceRow() {
  return (
    <div className="mt-6 flex flex-wrap gap-2.5">
      {partnerAudience.map((item) => (
        <span
          key={item}
          className="rounded-full border border-[#E4E4E7] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#52525B]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function iconForCategory(icon: (typeof participantCategories)[number]['icon']) {
  switch (icon) {
    case 'briefcase':
      return BriefcaseBusiness;
    case 'building':
      return Building2;
    case 'server':
      return ServerCog;
    case 'code':
      return Code2;
    case 'pen-tool':
      return PenTool;
    case 'users':
      return Users;
    case 'rocket':
      return Rocket;
    case 'handshake':
      return Handshake;
    default:
      return Layers3;
  }
}

function PartnerNetworkVisual() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  const nodes = [
    { key: 'consultant', x: 20, y: 18, label: 'Partner', meta: 'access point' },
    { key: 'network', x: 52, y: 30, label: 'Network', meta: 'qualified relationships' },
    { key: 'referral', x: 34, y: 60, label: 'Referral', meta: 'tracked attribution' },
    { key: 'customer', x: 68, y: 58, label: 'Customer', meta: phase > 1 ? 'qualified' : 'introduced' },
    { key: 'revenue', x: 52, y: 84, label: 'Revenue', meta: phase > 2 ? 'active' : 'pending' },
  ] as const;

  const packetPositions = [
    { left: '20%', top: '18%' },
    { left: '52%', top: '30%' },
    { left: '34%', top: '60%' },
    { left: '68%', top: '58%' },
    { left: '52%', top: '84%' },
  ];

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => setPhase((current) => (current + 1) % 4), 2100);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0A0A0F] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(8,145,178,0.18),transparent_60%)]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
          <div>
            <MonoLabel className="text-[#67E8F9]">Partner topology</MonoLabel>
            <p className="mt-2 text-sm text-white/55">Distribution behaves like infrastructure: access, routing, qualification, outcome.</p>
          </div>
          <StatusPill tone={phase > 2 ? 'qualified' : 'pending'}>
            {phase > 2 ? 'Qualified customer' : 'Route active'}
          </StatusPill>
        </div>

        <div className="relative mt-6 h-[360px] overflow-hidden rounded-[22px] border border-white/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="partner-line" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(103,232,249,0.75)" />
                <stop offset="100%" stopColor="rgba(103,232,249,0.2)" />
              </linearGradient>
            </defs>
            <g stroke="url(#partner-line)" strokeWidth="0.7" fill="none">
              <motion.path
                d="M20 18 L52 30"
                initial={{ pathLength: 0.4, opacity: 0.45 }}
                animate={{ pathLength: 1, opacity: phase === 0 ? 1 : 0.45 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
              />
              <motion.path
                d="M52 30 L34 60"
                initial={{ pathLength: 0.4, opacity: 0.45 }}
                animate={{ pathLength: 1, opacity: phase === 1 ? 1 : 0.45 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
              />
              <motion.path
                d="M52 30 L68 58"
                initial={{ pathLength: 0.4, opacity: 0.45 }}
                animate={{ pathLength: 1, opacity: phase === 2 ? 1 : 0.45 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
              />
              <motion.path
                d="M34 60 L52 84"
                initial={{ pathLength: 0.4, opacity: 0.35 }}
                animate={{ pathLength: 1, opacity: phase === 3 ? 1 : 0.35 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
              />
              <motion.path
                d="M68 58 L52 84"
                initial={{ pathLength: 0.4, opacity: 0.35 }}
                animate={{ pathLength: 1, opacity: phase === 3 ? 1 : 0.35 }}
                transition={{ duration: reduceMotion ? 0 : 0.8, ease }}
              />
            </g>
          </svg>

          {!reduceMotion ? (
            <motion.div
              className="absolute h-3 w-3 rounded-full bg-[#67E8F9] shadow-[0_0_0_6px_rgba(103,232,249,0.14)]"
              animate={{
                left: packetPositions[(phase + 1) % packetPositions.length].left,
                top: packetPositions[(phase + 1) % packetPositions.length].top,
              }}
              initial={packetPositions[0]}
              transition={{ duration: 1.1, ease }}
            />
          ) : null}

          {nodes.map((node, index) => {
            const active = index === phase || (phase === 3 && (node.key === 'customer' || node.key === 'revenue'));
            return (
              <div
                key={node.key}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          boxShadow: active
                            ? '0 0 0 8px rgba(103,232,249,0.12), 0 0 40px rgba(8,145,178,0.15)'
                            : '0 0 0 0 rgba(103,232,249,0)',
                        }
                  }
                  transition={{ duration: 0.6, ease }}
                  className={cn(
                    'min-w-[118px] rounded-2xl border px-4 py-3 backdrop-blur-sm',
                    active
                      ? 'border-[#67E8F9]/50 bg-[#0E1D23]'
                      : 'border-white/10 bg-[#111116]/90',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{node.label}</p>
                    <span className={cn('h-2.5 w-2.5 rounded-full', active ? 'bg-[#67E8F9]' : 'bg-white/25')} />
                  </div>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{node.meta}</p>
                </motion.div>
              </div>
            );
          })}

          <div className="absolute left-4 right-4 bottom-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <MonoLabel className="text-white/45">state</MonoLabel>
              <p className="mt-2 text-sm font-medium text-white">
                {phase > 1 ? 'Customer qualified' : 'Introduction in progress'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <MonoLabel className="text-white/45">evidence path</MonoLabel>
              <p className="mt-2 text-sm font-medium text-white">Attribution preserved from referral to recurring account.</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <MonoLabel className="text-white/45">economics</MonoLabel>
              <p className="mt-2 text-sm font-medium text-white">Revenue appears only after customer quality is established.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewHero({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}) {
  return (
    <section className="overflow-hidden bg-white pt-[120px] pb-20 md:pt-[148px] md:pb-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <SectionEyebrow>Earn with RELIASTRA</SectionEyebrow>
            <h1 className="mt-6 max-w-[12ch] text-[42px] font-[800] leading-[1.02] tracking-[-0.04em] text-[#09090B] sm:text-[54px] md:text-[68px]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[#52525B] md:text-[20px]">
              {description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PartnerCTA href={primaryHref} eventLocation="hero_primary">
                {primaryLabel}
              </PartnerCTA>
              <PartnerCTA href={secondaryHref} secondary eventLocation="hero_secondary">
                {secondaryLabel}
              </PartnerCTA>
            </div>
            <p className="mt-6 text-sm text-[#71717A]">
              Built for people who already have access to the businesses RELIASTRA serves.
            </p>
            <AudienceRow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
          >
            <PartnerNetworkVisual />
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function AccessConvergenceSection() {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why partner with RELIASTRA"
          title="You already know the people we need to reach."
          description="RELIASTRA does not need partners to manufacture attention from zero. The network is built for people who already have client trust, community relevance, or direct industry access."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <div className="rounded-[26px] border border-[#E4E4E7] bg-white p-6 md:p-8">
            <MonoLabel>YOUR ACCESS</MonoLabel>
            <ul className="mt-6 space-y-4">
              {partnerAccessComparison.yours.map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-[#F0F0F0] pt-4 first:border-t-0 first:pt-0">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#0891B2]" aria-hidden="true" />
                  <span className="text-[15px] leading-relaxed text-[#09090B]">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center justify-center px-2">
            <div className="flex items-center gap-3 rounded-full border border-[#0891B2]/15 bg-[#0891B2]/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0891B2]">
              <Network className="h-4 w-4" />
              Distribution
            </div>
          </div>

          <div className="rounded-[26px] border border-[#E4E4E7] bg-[#0A0A0F] p-6 md:p-8">
            <MonoLabel className="text-[#67E8F9]">RELIASTRA</MonoLabel>
            <ul className="mt-6 space-y-4">
              {partnerAccessComparison.reliastra.map((item) => (
                <li key={item} className="flex items-start gap-3 border-t border-white/8 pt-4 first:border-t-0 first:pt-0">
                  <span className="mt-1 h-2 w-2 rounded-full bg-[#67E8F9]" aria-hidden="true" />
                  <span className="text-[15px] leading-relaxed text-white">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ParticipantGridSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Who can participate"
          title="Qualified distribution can come from many directions."
          description="The partner network is intentionally broader than creator marketing. The constant is not audience size. It is credible access to the teams RELIASTRA serves."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {participantCategories.map((category, index) => {
            const Icon = iconForCategory(category.icon);
            return (
              <motion.article
                key={category.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.45, delay: index * 0.04, ease }}
                className="group rounded-[24px] border border-[#E4E4E7] bg-white p-5 transition-all duration-200 hover:-translate-y-[2px] hover:border-[#0891B2]/30 hover:shadow-[0_16px_32px_rgba(0,0,0,0.05)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] text-[#09090B] transition-colors group-hover:border-[#0891B2]/20 group-hover:bg-[#ECFEFF] group-hover:text-[#0891B2]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.02em] text-[#09090B]">{category.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[#52525B]">{category.description}</p>
                <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.15em] text-[#71717A]">{category.hint}</p>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function EconomicModelSection() {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Economic model"
          title="Reward distribution. Not noise."
          description="RELIASTRA does not pay for impressions or empty clicks. The network is designed around qualified customer outcomes and durable attribution."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {economicModelStages.map((stage, index) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, delay: index * 0.06, ease }}
              className={cn(
                'rounded-[24px] border p-6',
                stage.state === 'qualified'
                  ? 'border-emerald-200 bg-emerald-50'
                  : stage.state === 'track'
                    ? 'border-[#0891B2]/20 bg-[#ECFEFF]'
                    : 'border-[#E4E4E7] bg-white',
              )}
            >
              <MonoLabel>{stage.label}</MonoLabel>
              <p className="mt-7 text-[22px] font-semibold tracking-[-0.02em] text-[#09090B]">{stage.payout}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#52525B]">
                {stage.state === 'observe'
                  ? 'Signal only. No commission is created at this stage.'
                  : stage.state === 'track'
                    ? 'The account begins to move through qualification logic.'
                    : 'Recurring partner economics begin once the customer qualifies.'}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EarningMethodsSection({
  tiers,
  showHeadline = true,
}: {
  tiers?: PartnerTier[];
  showHeadline?: boolean;
}) {
  const tierMap = useMemo(() => new Map((tiers ?? []).map((tier) => [tier.key, tier])), [tiers]);

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        {showHeadline ? (
          <SectionHeading
            eyebrow="Ways to earn"
            title="Start with a simple referral. Grow into a deeper partnership."
            description="Not every path requires the same level of involvement. RELIASTRA supports lightweight introductions, client implementation work, and more embedded partner models."
          />
        ) : null}

        <div className={cn(showHeadline ? 'mt-12' : '')}>
          <div className="hidden grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 lg:grid">
            <MonoLabel>SIMPLE</MonoLabel>
            <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
            <MonoLabel>MORE INVOLVED</MonoLabel>
            <ChevronRight className="h-4 w-4 text-[#A1A1AA]" />
            <MonoLabel>DEEPER PARTNERSHIP</MonoLabel>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-5">
            {earningMethods.map((method, index) => {
              const apiTier = tierMap.get(method.title.toLowerCase());
              return (
                <motion.article
                  key={method.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={viewport}
                  transition={{ duration: 0.45, delay: index * 0.04, ease }}
                  className={cn(
                    'rounded-[24px] border p-5',
                    method.depth === 'simple'
                      ? 'border-[#0891B2]/20 bg-[#ECFEFF]'
                      : method.depth === 'involved'
                        ? 'border-[#E4E4E7] bg-[#F8F9FA]'
                        : 'border-[#E4E4E7] bg-white',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <StatusPill tone={method.depth === 'simple' ? 'qualified' : 'neutral'}>{method.subtitle}</StatusPill>
                    {apiTier?.source === 'api' ? <MonoLabel>live</MonoLabel> : null}
                  </div>
                  <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em] text-[#09090B]">{method.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#52525B]">{apiTier?.description ?? method.description}</p>
                  <div className="mt-6 border-t border-black/6 pt-5">
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-[#0891B2]">
                      {apiTier?.rateLabel ?? method.payout}
                    </p>
                    {'availability' in method && (method as { availability?: string }).availability ? (
                      <p className="mt-2 text-xs text-[#71717A]">{(method as { availability?: string }).availability}</p>
                    ) : null}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HowItWorksSequence() {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="How it works"
          title="Operational partner flow, from profile to recurring revenue."
          description="The network is designed to feel like an extension of the RELIASTRA product itself: clear status, preserved attribution, and measured qualification."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {lifecycleSteps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, delay: index * 0.06, ease }}
              className="rounded-[24px] border border-[#E4E4E7] bg-white p-6"
            >
              <MonoLabel>{step.number}</MonoLabel>
              <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-[#09090B]">{step.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function FollowersVsAccessSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Distribution philosophy"
          title="You don't need 100,000 followers."
          description="A DevOps consultant with twenty active client relationships can be more commercially relevant than an account with a massive but generic audience. RELIASTRA values access over vanity metrics."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[26px] border border-[#E4E4E7] bg-[#F8F9FA] p-6 md:p-8">
            <MonoLabel>200,000 followers</MonoLabel>
            <div className="mt-10 flex min-h-[180px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#D4D4D8] bg-white text-center">
              <p className="text-4xl font-[800] tracking-[-0.04em] text-[#09090B]">200,000</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#71717A]">Followers</p>
              <p className="mt-8 font-mono text-sm text-[#A1A1AA]">↓</p>
              <p className="mt-5 text-lg font-medium text-[#52525B]">?</p>
              <p className="mt-2 text-sm text-[#71717A]">Customer quality unknown</p>
            </div>
          </div>

          <div className="rounded-[26px] border border-[#0891B2]/15 bg-[#0A0A0F] p-6 md:p-8">
            <MonoLabel className="text-[#67E8F9]">20 client relationships</MonoLabel>
            <div className="mt-10 flex min-h-[180px] flex-col items-center justify-center rounded-[22px] border border-white/10 bg-white/[0.03] text-center">
              <p className="text-4xl font-[800] tracking-[-0.04em] text-white">20</p>
              <p className="mt-2 text-sm uppercase tracking-[0.18em] text-white/55">Client relationships</p>
              <p className="mt-8 font-mono text-sm text-white/35">↓</p>
              <StatusPill tone="qualified">Qualified customers</StatusPill>
              <p className="mt-4 max-w-[22ch] text-sm text-white/60">Direct access to teams that already rely on external infrastructure.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ScenarioSection() {
  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Distribution scenarios"
          title="The easiest conversion point is often already in your workflow."
          description="These examples are not promises or fabricated dashboards. They are realistic ways qualified distribution can happen around an infrastructure product."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {scenarios.map((scenario, index) => (
            <motion.article
              key={scenario.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, delay: index * 0.05, ease }}
              className="rounded-[26px] border border-[#E4E4E7] bg-white p-6 md:p-7"
            >
              <MonoLabel>Scenario {String(index + 1).padStart(2, '0')}</MonoLabel>
              <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-[#09090B]">{scenario.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{scenario.description}</p>
              <div className="mt-6 rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] px-4 py-4 font-mono text-[12px] uppercase tracking-[0.16em] text-[#0891B2]">
                {scenario.result}
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ReliastraDifferenceSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Why RELIASTRA"
          title="You're not referring another uptime monitor."
          description="The partner proposition works because the product proposition is differentiated. RELIASTRA helps teams monitor external dependencies, correlate vendor behavior with incidents, and produce structured evidence."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {[
            {
              title: 'Monitor',
              description: 'Independent observation of the external services your infrastructure depends on.',
            },
            {
              title: 'Correlate',
              description: 'Connect vendor behavior to your incidents using timestamps, regions, and observable events.',
            },
            {
              title: 'Prove',
              description: 'Generate structured evidence that survives scrutiny when the question is “was it you, or your vendors?”',
            },
          ].map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.45, delay: index * 0.05, ease }}
              className={cn(
                'rounded-[26px] border p-6 md:p-8',
                index === 1 ? 'border-[#0891B2]/20 bg-[#ECFEFF]' : 'border-[#E4E4E7] bg-white',
              )}
            >
              <MonoLabel>{String(index + 1).padStart(2, '0')}</MonoLabel>
              <h3 className="mt-6 text-[26px] font-[800] tracking-[-0.03em] text-[#09090B]">{item.title}</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EconomicsExampleSection({ tiers }: { tiers?: PartnerTier[] }) {
  const referTier = tiers?.find((tier) => tier.key === 'refer');
  const rateLabel = referTier?.rateLabel ?? '20% recurring';

  return (
    <section className="bg-[#F8F9FA] py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Partner economics"
          title="Transparent examples, not hype."
          description="The goal is to make the earning model understandable without pretending every relationship behaves the same way. Actual earnings depend on qualified customer revenue and program terms."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-[#E4E4E7] bg-white p-6 md:p-8">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ['Customer plan', '$49/mo'],
                ['Partner rate', rateLabel],
                ['Partner earns', '$9.80/mo'],
                ['If active', 'Commission continues'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] px-4 py-4">
                  <MonoLabel>{label}</MonoLabel>
                  <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-[#09090B]">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm leading-relaxed text-[#52525B]">
              This example uses a simple recurring referral structure. Implementation, reseller, and performance-based models may use different qualification and payout logic.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#E4E4E7] bg-[#0A0A0F] p-6 md:p-8">
            <MonoLabel className="text-[#67E8F9]">Commercial notes</MonoLabel>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-white/65">
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#67E8F9]" />Commissions begin after the required qualification point is reached.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#67E8F9]" />Attribution, cancellations, refunds, and reversals are handled according to program terms.</li>
              <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#67E8F9]" />RELIASTRA optimizes for customer quality, not top-of-funnel noise.</li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

function GrowthLadderSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow="Grow with RELIASTRA"
          title="Start with referrals. Grow into a deeper partnership."
          description="Not every tier needs to exist at scale on day one. The point is to communicate a credible path for stronger collaboration as the network matures."
        />

        <div className="mt-12 overflow-hidden rounded-[28px] border border-[#E4E4E7] bg-white">
          {maturityLadder.map((step, index) => (
            <div
              key={step.title}
              className="grid gap-3 border-t border-[#E4E4E7] px-6 py-5 first:border-t-0 md:grid-cols-[120px_1fr_auto] md:items-center md:px-8"
            >
              <MonoLabel>{String(index + 1).padStart(2, '0')}</MonoLabel>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[#09090B]">{step.title}</p>
              <StatusPill tone={step.status === 'Available now' ? 'qualified' : 'pending'}>{step.status}</StatusPill>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function PartnerFaqSection({
  limit,
  title = 'Questions potential partners usually ask before applying.',
  eyebrow = 'FAQ',
  description = 'Keep the path from understanding to application short. These answers focus on qualification, attribution, and realistic expectations.',
}: {
  limit?: number;
  title?: string;
  eyebrow?: string;
  description?: string;
}) {
  const partnerHref = usePartnerHref();
  const visibleItems = limit ? faqItems.slice(0, limit) : faqItems;
  const [value, setValue] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && visibleItems.some((item) => item.id === hash)) {
        return hash;
      }
    }
    return visibleItems[0]?.id;
  });

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />

        <div className="mt-12 rounded-[28px] border border-[#E4E4E7] bg-white px-6 md:px-8">
          <Accordion type="single" collapsible value={value} onValueChange={(next) => setValue(next || undefined)}>
            {visibleItems.map((item) => (
              <AccordionItem value={item.id} key={item.id} id={item.id} className="border-[#E4E4E7]">
                <AccordionTrigger className="py-5 text-left text-[16px] font-medium text-[#09090B] hover:no-underline">
                  <span>{item.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-[#52525B]">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {limit ? (
          <div className="mt-6">
            <a
              href={partnerHref('/faq')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0891B2] transition-colors hover:text-[#0E7490]"
            >
              See full FAQ
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

function FinalCTASection() {
  const partnerHref = usePartnerHref();
  const productHref = useProductHref();

  return (
    <section className="bg-[#0A0A0F] py-20 md:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <SectionEyebrow>Next step</SectionEyebrow>
          <h2 className="mt-6 text-[34px] font-[800] leading-[1.08] tracking-[-0.04em] text-white md:text-[50px]">
            You know the businesses. We built the infrastructure.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/60 md:text-[18px]">
            Bring RELIASTRA to the right people. We&apos;ll handle the product.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PartnerCTA href={partnerHref('/apply')} eventLocation="final_cta_primary">
              Become a Partner
            </PartnerCTA>
            <PartnerCTA href={productHref('/')} secondary eventLocation="final_cta_secondary">
              Explore RELIASTRA
            </PartnerCTA>
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroShell({
  eyebrow,
  title,
  description,
  right,
  footnote,
  primaryHref,
  secondaryHref,
  secondaryLabel = 'See how it works',
  primaryEventName,
  secondaryEventName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  right?: React.ReactNode;
  footnote?: React.ReactNode;
  primaryHref: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  primaryEventName?: string;
  secondaryEventName?: string;
}) {
  return (
    <section className="bg-white pt-[120px] pb-20 md:pt-[148px] md:pb-24">
      <Container>
        <div className={cn('grid gap-12', right ? 'lg:grid-cols-[1.05fr_0.95fr] lg:items-center' : '')}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <SectionEyebrow>{eyebrow}</SectionEyebrow>
            <h1 className="mt-6 max-w-[13ch] text-[42px] font-[800] leading-[1.02] tracking-[-0.04em] text-[#09090B] sm:text-[54px] md:text-[68px]">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-[#52525B] md:text-[20px]">
              {description}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <PartnerCTA
                href={primaryHref}
                eventLocation={`${eyebrow.toLowerCase().replace(/\s+/g, '_')}_primary`}
                eventName={primaryEventName}
              >
                Become a Partner
              </PartnerCTA>
              {secondaryHref ? (
                <PartnerCTA
                  href={secondaryHref}
                  secondary
                  eventLocation={`${eyebrow.toLowerCase().replace(/\s+/g, '_')}_secondary`}
                  eventName={secondaryEventName}
                >
                  {secondaryLabel}
                </PartnerCTA>
              ) : null}
            </div>
            {footnote ? <div className="mt-8">{footnote}</div> : null}
          </motion.div>
          {right ? <div>{right}</div> : null}
        </div>
      </Container>
    </section>
  );
}

function LifecycleRail() {
  return (
    <div className="rounded-[28px] border border-[#E4E4E7] bg-white p-6 md:p-8">
      <div className="grid gap-3 md:grid-cols-6">
        {longLifecycle.map((step, index) => (
          <div key={step} className="relative rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] px-4 py-4">
            <MonoLabel>{String(index + 1).padStart(2, '0')}</MonoLabel>
            <p className="mt-4 text-sm font-semibold text-[#09090B]">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommissionTable({ tiers }: { tiers: PartnerTier[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E4E4E7] bg-white">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className="grid gap-3 border-t border-[#E4E4E7] px-6 py-5 first:border-t-0 md:grid-cols-[180px_200px_1fr] md:items-start md:px-8"
        >
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-[#09090B]">{tier.title}</p>
            <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.16em] text-[#71717A]">{tier.key}</p>
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#0891B2]">{tier.rateLabel}</p>
            {tier.availability ? <p className="mt-2 text-xs text-[#71717A]">{tier.availability}</p> : null}
          </div>
          <p className="text-[15px] leading-relaxed text-[#52525B]">{tier.description}</p>
        </div>
      ))}
    </div>
  );
}

function ResourceRows({ resources }: { resources: PartnerResource[] }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-[#E4E4E7] bg-white">
      {resources.map((resource, index) => (
        <a
          key={`${resource.category}-${resource.title}-${index}`}
          href={resource.href || '#'}
          onClick={() => trackEvent('resource_clicked', { category: resource.category, title: resource.title })}
          className={cn(
            'grid gap-4 border-t border-[#E4E4E7] px-6 py-5 transition-colors first:border-t-0 md:grid-cols-[180px_1fr_auto] md:items-center md:px-8',
            resource.href ? 'hover:bg-[#F8F9FA]' : 'cursor-default',
          )}
        >
          <MonoLabel>{resource.category}</MonoLabel>
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em] text-[#09090B]">{resource.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-[#52525B]">{resource.description}</p>
          </div>
          <div className="flex items-center gap-3">
            {resource.updated_at ? (
              <span className="hidden text-xs text-[#A1A1AA] md:block">Updated {new Date(resource.updated_at).toLocaleDateString()}</span>
            ) : null}
            {resource.href ? <ArrowUpRight className="h-4 w-4 text-[#71717A]" /> : null}
          </div>
        </a>
      ))}
    </div>
  );
}

const applySchema = z.object({
  name: z.string().min(2, 'Enter your name.'),
  company: z.string().optional(),
  website: z
    .string()
    .optional()
    .refine((value) => !value || /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(value), 'Enter a valid website.'),
  partnerType: z.string().min(1, 'Choose a partner type.'),
  primaryChannel: z.string().min(1, 'Choose your primary channel.'),
  networkDescription: z.string().min(24, 'Tell us a bit more about your network or access.'),
  earningMethods: z.array(z.string()).min(1, 'Choose at least one earning method.'),
  agreementAccepted: z.boolean().refine((value) => value, 'You need to accept the terms to continue.'),
});

type ApplyFormValues = z.infer<typeof applySchema>;

type SubmitState =
  | { type: 'idle' }
  | { type: 'success'; response: Record<string, unknown> }
  | { type: 'existing'; message: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'error'; message: string };

function ApplyFormSection() {
  const partnerHref = usePartnerHref();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle' });
  const [submitting, setSubmitting] = useState(false);
  const trackedStart = useRef(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      company: '',
      website: '',
      partnerType: '',
      primaryChannel: '',
      networkDescription: '',
      earningMethods: [],
      agreementAccepted: false,
    },
  });

  const values = watch();

  const steps = [
    {
      title: 'About you',
      description: 'A few basics so RELIASTRA can understand the context behind your distribution model.',
      fields: ['name', 'company', 'website', 'partnerType'] as const,
    },
    {
      title: 'How you distribute',
      description: 'Describe the channel or relationships you already have.',
      fields: ['primaryChannel', 'networkDescription'] as const,
    },
    {
      title: 'How you want to earn',
      description: 'Choose one or more partner paths that match your level of involvement.',
      fields: ['earningMethods'] as const,
    },
    {
      title: 'Submit',
      description: 'Confirm the application and send it to RELIASTRA.',
      fields: ['agreementAccepted'] as const,
    },
  ];

  const selectedMethods = values.earningMethods ?? [];

  const nextStep = async () => {
    const valid = await trigger(steps[step].fields);
    if (!valid) return;
    if (!trackedStart.current) {
      trackedStart.current = true;
      trackEvent('apply_started', { step: step + 1 });
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  const onSubmit = handleSubmit(async (formValues) => {
    setSubmitting(true);
    setSubmitState({ type: 'idle' });

    const audienceDescription = [
      `Name: ${formValues.name}`,
      formValues.company ? `Company: ${formValues.company}` : null,
      formValues.website ? `Website: ${formValues.website}` : null,
      `Primary channel: ${formValues.primaryChannel}`,
      `Partner type: ${formValues.partnerType}`,
      `Network description: ${formValues.networkDescription}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      const response = await applyPartner({
        partner_type: formValues.partnerType,
        earning_methods: formValues.earningMethods,
        audience_description: audienceDescription,
        agreement_accepted: formValues.agreementAccepted,
      });
      setSubmitState({ type: 'success', response: (response as Record<string, unknown>) ?? {} });
      trackEvent('apply_completed');
    } catch (error) {
      trackEvent('apply_failed');
      if (error instanceof BackendError) {
        if (error.status === 409) {
          setSubmitState({
            type: 'existing',
            message: error.message || 'A partner record already exists for this account or context.',
          });
        } else if (error.status === 401) {
          setSubmitState({
            type: 'unauthorized',
            message: error.message || 'Please sign in to continue your partner application.',
          });
        } else if (error.status === 422) {
          setSubmitState({
            type: 'error',
            message: 'Please check the highlighted fields and try again.',
          });
        } else if (error.status === 429) {
          setSubmitState({
            type: 'error',
            message: 'Too many attempts. Please wait a moment before trying again.',
          });
        } else {
          setSubmitState({
            type: 'error',
            message: error.message || 'Something went wrong while submitting your application.',
          });
        }
      } else {
        setSubmitState({ type: 'error', message: 'Something went wrong while submitting your application.' });
      }
    } finally {
      setSubmitting(false);
    }
  });

  const renderPanel = () => {
    if (submitState.type === 'success') {
      const status = typeof submitState.response.status === 'string' ? submitState.response.status : null;
      const identity =
        (typeof submitState.response.referral_identity === 'string' && submitState.response.referral_identity) ||
        (typeof submitState.response.partner_code === 'string' && submitState.response.partner_code) ||
        null;

      return (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 md:p-8">
          <SectionEyebrow>Partner application received</SectionEyebrow>
          <h2 className="mt-5 text-[30px] font-[800] tracking-[-0.03em] text-[#09090B]">Your application is now registered.</h2>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
              <MonoLabel>Partner status</MonoLabel>
              <p className="mt-3 text-sm font-semibold text-[#09090B]">{status ?? 'Submitted'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
              <MonoLabel>Referral identity</MonoLabel>
              <p className="mt-3 text-sm font-semibold text-[#09090B]">{identity ?? 'Issued after review'}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-4 py-4">
              <MonoLabel>Next</MonoLabel>
              <p className="mt-3 text-sm font-semibold text-[#09090B]">You&apos;ll receive partner access instructions.</p>
            </div>
          </div>
        </div>
      );
    }

    if (submitState.type === 'existing') {
      return (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8">
          <SectionEyebrow>Existing partner</SectionEyebrow>
          <h2 className="mt-5 text-[28px] font-[800] tracking-[-0.03em] text-[#09090B]">A partner record already exists.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{submitState.message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PartnerCTA href={`/login?returnTo=${encodeURIComponent(partnerHref('/apply'))}`} eventLocation="apply_existing_sign_in">
              Sign in
            </PartnerCTA>
            <PartnerCTA href={partnerHref('/faq')} secondary eventLocation="apply_existing_faq">
              Review FAQ
            </PartnerCTA>
          </div>
        </div>
      );
    }

    if (submitState.type === 'unauthorized') {
      return (
        <div className="rounded-[28px] border border-[#E4E4E7] bg-[#F8F9FA] p-6 md:p-8">
          <SectionEyebrow>Authentication required</SectionEyebrow>
          <h2 className="mt-5 text-[28px] font-[800] tracking-[-0.03em] text-[#09090B]">Sign in and return to this application.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{submitState.message}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PartnerCTA href={`/login?returnTo=${encodeURIComponent(partnerHref('/apply'))}`} eventLocation="apply_unauthorized_sign_in">
              Sign in
            </PartnerCTA>
            <PartnerCTA href={`/register?returnTo=${encodeURIComponent(partnerHref('/apply'))}`} secondary eventLocation="apply_unauthorized_register">
              Create account
            </PartnerCTA>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={onSubmit} noValidate className="rounded-[28px] border border-[#E4E4E7] bg-white p-6 md:p-8">
        {submitState.type === 'error' ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitState.message}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((item, index) => (
            <div
              key={item.title}
              className={cn(
                'rounded-2xl border px-4 py-4',
                index === step
                  ? 'border-[#0891B2]/20 bg-[#ECFEFF]'
                  : index < step
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-[#E4E4E7] bg-[#F8F9FA]',
              )}
            >
              <MonoLabel>{String(index + 1).padStart(2, '0')}</MonoLabel>
              <p className="mt-3 text-sm font-semibold text-[#09090B]">{item.title}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-[24px] font-[800] tracking-[-0.03em] text-[#09090B]">{steps[step].title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-[#52525B]">{steps[step].description}</p>
        </div>

        <div className="mt-8 space-y-5">
          {step === 0 ? (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Name" error={errors.name?.message}>
                  <Input
                    {...register('name')}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className={fieldClass(!!errors.name)}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                </Field>
                <Field label="Company" error={errors.company?.message}>
                  <Input
                    {...register('company')}
                    placeholder="Your company"
                    autoComplete="organization"
                    className={fieldClass(!!errors.company)}
                    aria-invalid={errors.company ? 'true' : 'false'}
                  />
                </Field>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Website" error={errors.website?.message}>
                  <Input
                    {...register('website')}
                    placeholder="https://your-site.com"
                    inputMode="url"
                    className={fieldClass(!!errors.website)}
                    aria-invalid={errors.website ? 'true' : 'false'}
                  />
                </Field>
                <Field label="Partner type" error={errors.partnerType?.message}>
                  <Select value={values.partnerType} onValueChange={(value) => setValue('partnerType', value, { shouldValidate: true })}>
                    <SelectTrigger className={fieldClass(!!errors.partnerType) + ' h-11 w-full'} aria-invalid={errors.partnerType ? 'true' : 'false'}>
                      <SelectValue placeholder="Select partner type" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'Consultant',
                        'Agency',
                        'MSP',
                        'Engineer',
                        'Creator',
                        'Community',
                        'Founder',
                        'Sales professional',
                      ].map((option) => (
                        <SelectItem key={option} value={option.toLowerCase()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field label="Primary channel" error={errors.primaryChannel?.message}>
                <Select value={values.primaryChannel} onValueChange={(value) => setValue('primaryChannel', value, { shouldValidate: true })}>
                  <SelectTrigger className={fieldClass(!!errors.primaryChannel) + ' h-11 w-full'} aria-invalid={errors.primaryChannel ? 'true' : 'false'}>
                    <SelectValue placeholder="Select primary channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Client work', 'Community', 'Newsletter', 'Content', 'Direct introductions', 'Managed services'].map((option) => (
                      <SelectItem key={option} value={option.toLowerCase()}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Audience / network description" error={errors.networkDescription?.message}>
                <Textarea
                  {...register('networkDescription')}
                  placeholder="Example: I advise 18 SaaS teams on incident response, platform reliability, and vendor risk."
                  className={fieldClass(!!errors.networkDescription) + ' min-h-[140px]'}
                  aria-invalid={errors.networkDescription ? 'true' : 'false'}
                />
              </Field>
            </>
          ) : null}

          {step === 2 ? (
            <Field label="How you want to participate" error={errors.earningMethods?.message}>
              <div className="grid gap-3 md:grid-cols-2">
                {earningMethods.map((method) => {
                  const checked = selectedMethods.includes(method.title.toLowerCase());
                  return (
                    <label
                      key={method.title}
                      className={cn(
                        'flex cursor-pointer gap-3 rounded-2xl border px-4 py-4 transition-colors',
                        checked ? 'border-[#0891B2]/20 bg-[#ECFEFF]' : 'border-[#E4E4E7] bg-[#F8F9FA]',
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) => {
                          const key = method.title.toLowerCase();
                          const valuesNext = next
                            ? [...selectedMethods, key]
                            : selectedMethods.filter((item) => item !== key);
                          setValue('earningMethods', valuesNext, { shouldValidate: true });
                        }}
                        aria-invalid={errors.earningMethods ? 'true' : 'false'}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#09090B]">{method.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-[#52525B]">{method.description}</p>
                        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-[#0891B2]">{method.payout}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </Field>
          ) : null}

          {step === 3 ? (
            <>
              <div className="rounded-2xl border border-[#E4E4E7] bg-[#F8F9FA] px-4 py-4">
                <MonoLabel>Submission context</MonoLabel>
                <div className="mt-4 grid gap-4 text-sm text-[#52525B] md:grid-cols-2">
                  <p><span className="font-semibold text-[#09090B]">Partner type:</span> {values.partnerType || 'Not selected'}</p>
                  <p><span className="font-semibold text-[#09090B]">Primary channel:</span> {values.primaryChannel || 'Not selected'}</p>
                  <p><span className="font-semibold text-[#09090B]">Company:</span> {values.company || 'Not provided'}</p>
                  <p><span className="font-semibold text-[#09090B]">Methods:</span> {selectedMethods.length ? selectedMethods.join(', ') : 'Not selected'}</p>
                </div>
              </div>
              <label className="flex gap-3 rounded-2xl border border-[#E4E4E7] bg-white px-4 py-4">
                <Checkbox
                  checked={values.agreementAccepted}
                  onCheckedChange={(next) => setValue('agreementAccepted', Boolean(next), { shouldValidate: true })}
                  aria-invalid={errors.agreementAccepted ? 'true' : 'false'}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-[#09090B]">I accept the partner application terms and understand that approval, attribution, and economics are subject to program rules.</p>
                  {errors.agreementAccepted ? (
                    <p className="mt-2 text-xs text-red-600">{errors.agreementAccepted.message}</p>
                  ) : null}
                </div>
              </label>
            </>
          ) : null}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 0 || submitting}
            className="inline-flex items-center justify-center rounded-[10px] border border-[#E4E4E7] px-5 py-3 text-sm font-semibold text-[#09090B] transition-colors hover:bg-[#F8F9FA] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back
          </button>

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0A0A0F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#111116]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0A0A0F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#111116] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeDollarSign className="h-4 w-4" />}
              {submitting ? 'Submitting application…' : 'Submit application'}
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <p className="mt-6 text-sm text-[#71717A]">
            If the backend requires an authenticated RELIASTRA account, you&apos;ll be prompted to sign in and then return to this page.
          </p>
        ) : null}
      </form>
    );
  };

  return (
    <section className="bg-white py-20 md:py-28">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Apply"
              title="Tell us how you can distribute RELIASTRA."
              description="This is an application for the public Partner Network—not a job application. Keep it short, specific, and tied to real access."
            />
            <div className="mt-8 rounded-[28px] border border-[#E4E4E7] bg-[#F8F9FA] p-6">
              <MonoLabel>What helps</MonoLabel>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-[#52525B]">
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0891B2]" />Describe real client, community, or buyer access.</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0891B2]" />Be specific about how you expect to introduce qualified teams.</li>
                <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0891B2]" />Choose the earning methods that match your actual involvement.</li>
              </ul>
            </div>
          </div>

          <div>{renderPanel()}</div>
        </div>
      </Container>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#09090B]">{label}</label>
      {children}
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

function fieldClass(invalid: boolean) {
  return cn(
    'border-[#E4E4E7] bg-white text-[#09090B] placeholder:text-[#A1A1AA] focus-visible:border-[#0891B2] focus-visible:ring-[#0891B2]',
    invalid && 'border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500',
  );
}

export function PartnerOverviewPage() {
  usePageTracking('partner_page_view');
  const partnerHref = usePartnerHref();
  const productHref = useProductHref();
  const tiersQuery = useQuery({ queryKey: ['partner-tiers'], queryFn: () => getPartnerTiers() });

  return (
    <>
      <OverviewHero
        title="Turn your network into recurring revenue."
        description="Know companies that depend on critical APIs, cloud services, payment providers, identity systems, or other external infrastructure? Introduce them to RELIASTRA and earn when they become qualified customers."
        primaryHref={partnerHref('/apply')}
        primaryLabel="Become a Partner"
        secondaryHref={partnerHref('/how-it-works')}
        secondaryLabel="See how it works"
      />
      <AccessConvergenceSection />
      <ParticipantGridSection />
      <EconomicModelSection />
      <EarningMethodsSection tiers={tiersQuery.data} />
      <HowItWorksSequence />
      <FollowersVsAccessSection />
      <ScenarioSection />
      <ReliastraDifferenceSection />
      <EconomicsExampleSection tiers={tiersQuery.data} />
      <GrowthLadderSection />
      <PartnerFaqSection limit={6} />
      <section className="bg-white pb-20">
        <Container>
          <div className="rounded-[28px] border border-[#E4E4E7] bg-[#F8F9FA] px-6 py-6 md:flex md:items-center md:justify-between md:px-8">
            <div>
              <MonoLabel>Connected product context</MonoLabel>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#52525B]">
                Need product context before you introduce RELIASTRA? Start with the main story around external dependency intelligence, live vendor data, and evidence reports.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <a href={productHref('/track')} className="inline-flex items-center gap-2 text-sm font-semibold text-[#0891B2]">
                Explore Vendor Intelligence
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Container>
      </section>
      <FinalCTASection />
    </>
  );
}

export function PartnerEarnPage() {
  usePageTracking('earn_page_view');
  const partnerHref = usePartnerHref();
  const tiersQuery = useQuery({ queryKey: ['partner-tiers'], queryFn: () => getPartnerTiers() });

  return (
    <>
      <HeroShell
        eyebrow="Earn"
        title="Earn by bringing RELIASTRA to the right businesses."
        description="Your network is valuable because of who you can reach—not how many followers you have."
        primaryHref={partnerHref('/apply')}
        secondaryHref={partnerHref('/how-it-works')}
        right={<PartnerNetworkVisual />}
        footnote={<AudienceRow />}
      />
      <HowItWorksSequence />
      <EarningMethodsSection tiers={tiersQuery.data} />
      <EconomicsExampleSection tiers={tiersQuery.data} />
      <ParticipantGridSection />
      <ReliastraDifferenceSection />
      <PartnerFaqSection limit={8} title="Answer the business question quickly: who earns, when, and why?" />
      <FinalCTASection />
    </>
  );
}

export function PartnerHowItWorksPage() {
  usePageTracking('how_it_works_view');
  const partnerHref = usePartnerHref();

  return (
    <>
      <HeroShell
        eyebrow="How it works"
        title="From introduction to recurring revenue."
        description="See the full partner lifecycle from application and attribution to qualified customer revenue."
        primaryHref={partnerHref('/apply')}
        secondaryHref={partnerHref('/commission')}
        secondaryLabel="See commission"
        right={<LifecycleRail />}
      />
      <section className="bg-[#F8F9FA] py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Lifecycle"
            title="Each step exists to preserve quality, attribution, and trust."
            description="RELIASTRA rewards qualified customer outcomes—not traffic volume. That means the process is designed to measure the right thing at each stage."
          />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              {
                title: 'Attribution',
                description: 'Partner links or referral identity preserve the relationship between introduction and customer conversion.',
              },
              {
                title: 'Qualification',
                description: 'Commissionable outcomes begin only when the customer reaches the required commercial stage.',
              },
              {
                title: 'Recurring economics',
                description: 'When the customer remains active, partner economics can continue according to program terms.',
              },
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ duration: 0.45, delay: index * 0.05, ease }}
                className="rounded-[26px] border border-[#E4E4E7] bg-white p-6"
              >
                <h3 className="text-[22px] font-semibold tracking-[-0.03em] text-[#09090B]">{card.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#52525B]">{card.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-[28px] border border-amber-200 bg-amber-50 p-6 md:p-8">
            <MonoLabel className="text-amber-700">Important</MonoLabel>
            <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[#7C5A10]">
              RELIASTRA rewards qualified customer outcomes—not traffic volume. If you already have access to the right teams, the model is built for you. If your distribution depends only on generic clicks, it probably is not.
            </p>
          </div>
        </Container>
      </section>
      <PartnerFaqSection limit={6} />
      <FinalCTASection />
    </>
  );
}

export function PartnerCommissionPage() {
  usePageTracking('commission_view');
  const partnerHref = usePartnerHref();
  const { data: tiers = [], isLoading } = useQuery({ queryKey: ['partner-tiers'], queryFn: () => getPartnerTiers() });

  return (
    <>
      <HeroShell
        eyebrow="Commission"
        title="How RELIASTRA partner earnings work."
        description="Transparent economics for qualified distribution across referrals, delivery, introductions, content, and reseller-style models."
        primaryHref={partnerHref('/apply')}
        primaryEventName="commission_cta_clicked"
        secondaryHref={partnerHref('/faq')}
        secondaryLabel="Read the FAQ"
        secondaryEventName="commission_cta_clicked"
        footnote={<StatusPill tone="pending">Actual earnings depend on qualified customer revenue and program terms.</StatusPill>}
      />
      <section className="bg-[#F8F9FA] py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Current structure"
            title="Commission detail should feel operational, not theatrical."
            description="The exact commercial logic lives in the backend program rules. The public page explains the structure without inventing unsupported legal or financial promises."
          />

          <div className="mt-12">
            {isLoading ? (
              <div className="rounded-[28px] border border-[#E4E4E7] bg-white p-8 text-sm text-[#71717A]">Loading partner economics…</div>
            ) : (
              <CommissionTable tiers={tiers} />
            )}
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {[
              ['When commission starts', 'After the customer reaches the program’s qualifying commercial state.'],
              ['Holding period', 'Subject to the backend program contract and operational review logic.'],
              ['Cancellations / refunds', 'Eligibility can change if a customer does not remain valid under program terms.'],
              ['Attribution', 'Referral identity and qualification rules determine who receives credit.'],
            ].map(([label, text]) => (
              <div key={label} className="rounded-[24px] border border-[#E4E4E7] bg-white p-5">
                <MonoLabel>{label}</MonoLabel>
                <p className="mt-4 text-sm leading-relaxed text-[#52525B]">{text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <EconomicsExampleSection tiers={tiers} />
      <FinalCTASection />
    </>
  );
}

export function PartnerResourcesPage() {
  usePageTracking('resources_view');
  const partnerHref = usePartnerHref();
  const productHref = useProductHref();
  const { data, isLoading, isError } = useQuery({ queryKey: ['partner-resources'], queryFn: () => getPartnerResources() });

  const staticResources: PartnerResource[] = fallbackResources.map((item, index) => ({
    id: `fallback-${index}`,
    category: item.category,
    title: item.title,
    description: item.description,
    href: item.href.startsWith('/partner') ? partnerHref(item.href.replace('/partner', '')) : item.href.startsWith('/#') || ['/#solution', '/track', '/about'].includes(item.href) ? productHref(item.href) : item.href,
  }));

  return (
    <>
      <HeroShell
        eyebrow="Resources"
        title="Public resources for future RELIASTRA partners."
        description="Useful starting material before login: product context, sales framing, technical positioning, and brand-adjacent talking points."
        primaryHref={partnerHref('/apply')}
        secondaryHref={partnerHref('/earn')}
        secondaryLabel="See the earning model"
      />
      <section className="bg-[#F8F9FA] py-20 md:py-28">
        <Container>
          <SectionHeading
            eyebrow="Public resource library"
            title="A useful page even before partner access exists."
            description="Static context stays available here. Dynamic backend resource metadata appears when published through the partner API."
          />

          <div className="mt-12 space-y-8">
            <div>
              <MonoLabel>Core categories</MonoLabel>
              <div className="mt-4">
                <ResourceRows resources={staticResources} />
              </div>
            </div>

            <div>
              <MonoLabel>API-backed resources</MonoLabel>
              <div className="mt-4">
                {isLoading ? (
                  <div className="rounded-[28px] border border-[#E4E4E7] bg-white p-8 text-sm text-[#71717A]">Loading public resource metadata…</div>
                ) : isError || !data || data.length === 0 ? (
                  <div className="rounded-[28px] border border-[#E4E4E7] bg-white p-8">
                    <p className="text-[16px] font-semibold text-[#09090B]">Resources are being updated.</p>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#52525B]">Check back soon for API-backed partner resource records. The core public material above is already available.</p>
                  </div>
                ) : (
                  <ResourceRows resources={data} />
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
      <FinalCTASection />
    </>
  );
}

export function PartnerFaqPage() {
  usePageTracking('faq_view');
  return (
    <>
      <section className="bg-white pt-[120px] pb-12 md:pt-[148px] md:pb-16">
        <Container>
          <SectionHeading
            eyebrow="FAQ"
            title="Clear answers for a serious partner network."
            description="These questions focus on who can participate, what qualifies, and how economics begin—without sliding into affiliate-program hype."
          />
        </Container>
      </section>
      <PartnerFaqSection eyebrow="Questions" title="Answers before you apply." description="Open the sections most relevant to your role. Each answer is short by design." />
      <FinalCTASection />
    </>
  );
}

export function PartnerApplyPage() {
  return (
    <>
      <section className="bg-white pt-[120px] pb-12 md:pt-[148px] md:pb-16">
        <Container>
          <SectionHeading
            eyebrow="Become a Partner"
            title="A short application for qualified distribution."
            description="The goal is simple: tell RELIASTRA how you already reach the right businesses and how you want to participate in the network."
          />
        </Container>
      </section>
      <ApplyFormSection />
    </>
  );
}
