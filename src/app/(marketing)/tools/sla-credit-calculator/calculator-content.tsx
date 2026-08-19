'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Info,
  Send,
  Timer,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VendorMark } from '@/components/tools/VendorMark';
import { SLA_VENDORS, type CatalogVendor, type SlaTier } from '@/lib/vendor-catalog';
import {
  allowanceMinutes,
  calculateCredit,
  formatCurrency,
  formatMinutes,
  formatMinutesPrecise,
} from '@/lib/sla-credit';

const ease = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5, ease },
};

/* ── Animated number ─────────────────────────────────────────────────────── */

function useSpringNumber(target: number, duration = 420): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setValue(target);
      return;
    }
    const from = fromRef.current;
    if (from === target) return;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduce]);

  useEffect(() => {
    fromRef.current = value;
  }, [value]);

  return value;
}

/* ── Vendor selector ─────────────────────────────────────────────────────── */

function VendorSelect({
  vendors,
  value,
  onChange,
}: {
  vendors: CatalogVendor[];
  value: CatalogVendor;
  onChange: (v: CatalogVendor) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'flex h-[60px] w-full items-center gap-3 rounded-[14px] border bg-white px-4 text-left transition-all duration-150',
          open
            ? 'border-[#0891B2] ring-2 ring-[#0891B2]/15'
            : 'border-[#E4E4E7] hover:border-[#D4D4D8]',
        )}
      >
        <VendorMark name={value.name} color={value.color} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-[#09090B]">
            {value.name}
          </span>
          <span className="block truncate text-xs text-[#A1A1AA]">
            {value.sla?.productLabel}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[#A1A1AA] transition-transform duration-200',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <motion.ul
          role="listbox"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease }}
          className="absolute z-30 mt-2 max-h-[320px] w-full overflow-auto rounded-[14px] border border-[#E4E4E7] bg-white p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.12)]"
        >
          {vendors.map((v) => {
            const selected = v.slug === value.slug;
            return (
              <li key={v.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(v);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors',
                    selected ? 'bg-[#0891B2]/8' : 'hover:bg-[#F8F9FA]',
                  )}
                >
                  <VendorMark name={v.name} color={v.color} size={28} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#09090B]">
                      {v.name}
                    </span>
                    <span className="block truncate text-xs text-[#A1A1AA]">
                      {v.sla?.tiers[0].commitment}% commitment
                    </span>
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0 text-[#0891B2]" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </motion.ul>
      )}
    </div>
  );
}

/* ── Downtime dial ───────────────────────────────────────────────────────── */

function DowntimeDial({
  downtimeMinutes,
  minutesInMonth,
  allowance,
}: {
  downtimeMinutes: number;
  minutesInMonth: number;
  allowance: number;
}) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  // Scale is relative to 5x the allowance so small outages stay legible.
  const scaleMax = Math.max(allowance * 5, 60);
  const ratio = Math.min(downtimeMinutes / scaleMax, 1);
  const allowanceRatio = Math.min(allowance / scaleMax, 1);
  const over = downtimeMinutes > allowance;

  const animated = useSpringNumber(ratio);
  const color = over ? '#DC2626' : '#16A34A';

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F1F3" strokeWidth={stroke} />
          {/* Allowance marker arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#D4D4D8"
            strokeWidth={stroke}
            strokeDasharray={`${circumference * allowanceRatio} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Observed downtime arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference * animated} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: 'stroke 300ms ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-lg font-bold tabular-nums text-[#09090B]">
            {formatMinutes(downtimeMinutes)}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
            downtime
          </span>
        </div>
      </div>

      <div className="min-w-0 space-y-2.5 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
            SLA allowance
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums text-[#52525B]">
            {formatMinutesPrecise(allowance)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
            {over ? 'Over budget by' : 'Remaining budget'}
          </p>
          <p
            className="font-mono text-sm font-semibold tabular-nums"
            style={{ color: over ? '#DC2626' : '#16A34A' }}
          >
            {formatMinutesPrecise(Math.abs(downtimeMinutes - allowance))}
          </p>
        </div>
        <p className="text-[11px] leading-snug text-[#A1A1AA]">
          of {(minutesInMonth / 60).toFixed(0)}h in the billing month
        </p>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */

const STEPS = [
  {
    icon: Timer,
    title: 'Downtime occurs',
    body: 'A dependency degrades. Independent checks from multiple regions record the exact window, response codes and latency.',
  },
  {
    icon: FileText,
    title: 'Document with Reliastra',
    body: 'Observations are compiled into a timestamped record — what was requested, when, from where, and what came back.',
  },
  {
    icon: Send,
    title: 'Submit the claim',
    body: 'File through the provider\u2019s support console within the deadline, attaching per-interval evidence rather than a summary.',
  },
  {
    icon: Wallet,
    title: 'Receive the credit',
    body: 'Approved credits are applied against future bills, typically within one billing cycle after confirmation.',
  },
];

export function CalculatorContent() {
  const vendors = SLA_VENDORS;
  const [vendor, setVendor] = useState<CatalogVendor>(vendors[0]);
  const [tierIndex, setTierIndex] = useState(0);
  const [spendInput, setSpendInput] = useState('5000');
  const [hours, setHours] = useState('4');
  const [minutes, setMinutes] = useState('20');
  const [daysInMonth, setDaysInMonth] = useState(30);

  const tier: SlaTier = vendor.sla?.tiers[tierIndex] ?? vendor.sla!.tiers[0];

  const monthlySpend = useMemo(() => {
    const n = Number(spendInput.replace(/[^0-9.]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [spendInput]);

  const downtimeMinutes = useMemo(() => {
    const h = Math.max(0, Number(hours) || 0);
    const m = Math.max(0, Number(minutes) || 0);
    return h * 60 + m;
  }, [hours, minutes]);

  const result = useMemo(
    () => calculateCredit({ monthlySpend, downtimeMinutes, daysInMonth, tier }),
    [monthlySpend, downtimeMinutes, daysInMonth, tier],
  );

  const animatedCredit = useSpringNumber(result.creditAmount);
  const animatedUptime = useSpringNumber(result.uptimePercentage);

  const handleVendorChange = useCallback((v: CatalogVendor) => {
    setVendor(v);
    setTierIndex(0);
  }, []);

  const allowance = allowanceMinutes(tier.commitment, daysInMonth);

  // Split the uptime figure so the decimals can be tinted.
  const uptimeStr = animatedUptime.toFixed(3);
  const [uptimeWhole, uptimeDecimals] = uptimeStr.split('.');
  const creditStr = formatCurrency(animatedCredit);

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-14 pt-20 md:px-12 md:pb-20 md:pt-28">
        {/* Animated accent glow */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[-220px] h-[560px] w-[900px] -translate-x-1/2 rounded-full"
          style={{
            background:
              'radial-gradient(closest-side, rgba(8,145,178,0.16), rgba(8,145,178,0.04) 60%, transparent 100%)',
          }}
          animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.06, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative mx-auto max-w-[1200px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E7] bg-white/70 px-4 py-2 text-xs font-semibold text-[#52525B] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0891B2]" />
              Free tool · No signup
            </span>

            <h1 className="mx-auto mt-7 max-w-4xl text-[40px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#09090B] sm:text-[56px] lg:text-[68px]">
              SLA Credit{' '}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(100deg, #0891B2 0%, #22D3EE 45%, #0E7490 100%)',
                }}
              >
                Calculator
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#52525B]">
              Estimate what a provider owes you when they miss their uptime commitment. Enter your
              spend and observed downtime — the schedules come from each vendor&apos;s published SLA.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Calculator ──────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 md:px-12">
        <div className="mx-auto max-w-[1120px]">
          <motion.div
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_460px]"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease }}
          >
            {/* Inputs */}
            <div className="rounded-[22px] border border-[#E4E4E7] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-[#09090B]">
                Your situation
              </h2>
              <p className="mt-1 text-sm text-[#52525B]">
                Everything updates as you type.
              </p>

              <div className="mt-7 space-y-7">
                {/* Vendor */}
                <div>
                  <label className="mb-2.5 block text-[13px] font-semibold text-[#09090B]">
                    Provider
                  </label>
                  <VendorSelect vendors={vendors} value={vendor} onChange={handleVendorChange} />
                </div>

                {/* Spend */}
                <div>
                  <label
                    htmlFor="monthly-spend"
                    className="mb-2.5 block text-[13px] font-semibold text-[#09090B]"
                  >
                    Monthly spend on the affected service
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-semibold text-[#A1A1AA]">
                      $
                    </span>
                    <input
                      id="monthly-spend"
                      type="text"
                      inputMode="decimal"
                      value={spendInput}
                      onChange={(e) => setSpendInput(e.target.value.replace(/[^0-9.]/g, ''))}
                      className="h-[68px] w-full rounded-[14px] border border-[#E4E4E7] bg-white pl-11 pr-5 font-mono text-[28px] font-bold tabular-nums text-[#09090B] outline-none transition-all duration-150 placeholder:text-[#D4D4D8] focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15"
                      placeholder="0"
                      aria-describedby="spend-help"
                    />
                  </div>
                  <p id="spend-help" className="mt-2 text-xs text-[#A1A1AA]">
                    Charges for the affected service and region only — not your whole bill.
                  </p>
                </div>

                {/* Downtime */}
                <div>
                  <span className="mb-2.5 block text-[13px] font-semibold text-[#09090B]">
                    Observed downtime
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        id="downtime-hours"
                        type="number"
                        min={0}
                        max={744}
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="h-[60px] w-full rounded-[14px] border border-[#E4E4E7] bg-white pl-4 pr-16 font-mono text-xl font-bold tabular-nums text-[#09090B] outline-none transition-all duration-150 focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15"
                      />
                      <label
                        htmlFor="downtime-hours"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]"
                      >
                        hours
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        id="downtime-minutes"
                        type="number"
                        min={0}
                        max={59}
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="h-[60px] w-full rounded-[14px] border border-[#E4E4E7] bg-white pl-4 pr-16 font-mono text-xl font-bold tabular-nums text-[#09090B] outline-none transition-all duration-150 focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/15"
                      />
                      <label
                        htmlFor="downtime-minutes"
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]"
                      >
                        mins
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[14px] border border-[#F0F0F0] bg-[#FCFCFD] p-5">
                    <DowntimeDial
                      downtimeMinutes={downtimeMinutes}
                      minutesInMonth={result.minutesInMonth}
                      allowance={allowance}
                    />
                  </div>
                </div>

                {/* Tier + month length */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <span className="mb-2.5 block text-[13px] font-semibold text-[#09090B]">
                      SLA commitment
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {vendor.sla!.tiers.map((t, i) => (
                        <button
                          key={t.commitment}
                          type="button"
                          onClick={() => setTierIndex(i)}
                          className={cn(
                            'rounded-[10px] border px-4 py-2.5 font-mono text-sm font-semibold tabular-nums transition-all duration-150',
                            i === tierIndex
                              ? 'border-[#0891B2] bg-[#0891B2]/8 text-[#0891B2]'
                              : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#D4D4D8]',
                          )}
                        >
                          {t.commitment}%
                        </button>
                      ))}
                      <span className="inline-flex items-center rounded-[10px] bg-[#F4F4F5] px-3 py-2.5 text-[11px] font-medium text-[#71717A]">
                        auto-detected
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="mb-2.5 block text-[13px] font-semibold text-[#09090B]">
                      Days in billing month
                    </span>
                    <div className="flex gap-2">
                      {[28, 30, 31].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDaysInMonth(d)}
                          className={cn(
                            'rounded-[10px] border px-4 py-2.5 font-mono text-sm font-semibold tabular-nums transition-all duration-150',
                            d === daysInMonth
                              ? 'border-[#0891B2] bg-[#0891B2]/8 text-[#0891B2]'
                              : 'border-[#E4E4E7] bg-white text-[#52525B] hover:border-[#D4D4D8]',
                          )}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Result */}
            <div className="lg:sticky lg:top-[92px] lg:self-start">
              <div className="overflow-hidden rounded-[22px] border border-[rgba(255,255,255,0.08)] bg-[#0A0A0F] shadow-[0_24px_60px_rgba(8,145,178,0.10)]">
                {/* Headline number */}
                <div
                  className="relative border-b border-[rgba(255,255,255,0.07)] p-7 sm:p-8"
                  style={{
                    background:
                      'radial-gradient(ellipse 90% 100% at 20% 0%, rgba(8,145,178,0.16) 0%, transparent 70%)',
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                    Estimated credit
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span
                      className={cn(
                        'font-mono font-extrabold tabular-nums leading-none tracking-[-0.04em] transition-colors duration-300',
                        creditStr.length > 8
                          ? 'text-[42px] sm:text-[52px]'
                          : 'text-[52px] sm:text-[64px]',
                        result.creditAmount > 0 ? 'text-[#FAFAFA]' : 'text-[#52525B]',
                      )}
                    >
                      {creditStr}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        result.breached
                          ? 'bg-[#0891B2]/15 text-[#67E8F9]'
                          : 'bg-[rgba(255,255,255,0.06)] text-[#A1A1AA]',
                      )}
                    >
                      {result.creditPercent}% credit tier
                    </span>
                    <span className="text-[11px] text-[#71717A]">
                      of {formatCurrency(monthlySpend)} monthly spend
                    </span>
                  </div>
                </div>

                {/* Uptime */}
                <div className="border-b border-[rgba(255,255,255,0.07)] p-7 sm:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                    Observed monthly uptime
                  </p>
                  <p className="mt-2 font-mono text-[40px] font-extrabold leading-none tracking-[-0.03em] text-[#FAFAFA] sm:text-[46px]">
                    {uptimeWhole}
                    <span className="text-[#0891B2]">.{uptimeDecimals}</span>
                    <span className="ml-1 text-2xl text-[#52525B]">%</span>
                  </p>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#A1A1AA]">
                    {result.matchedTierLabel}
                  </p>
                </div>

                {/* Schedule */}
                <div className="p-7 sm:p-8">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#71717A]">
                    {vendor.name} credit schedule
                  </p>
                  <ul className="space-y-2.5">
                    {tier.schedule.map((row) => {
                      const active = result.breached && row.creditPercent === result.creditPercent;
                      return (
                        <li
                          key={`${row.below}-${row.creditPercent}`}
                          className={cn(
                            'flex items-center justify-between rounded-[10px] px-3 py-2.5 text-[13px] transition-colors',
                            active
                              ? 'bg-[#0891B2]/12 text-[#FAFAFA]'
                              : 'bg-[rgba(255,255,255,0.03)] text-[#A1A1AA]',
                          )}
                        >
                          <span className="font-mono tabular-nums">
                            {row.atLeast !== null
                              ? `${row.atLeast}% – <${row.below}%`
                              : `< ${row.below}%`}
                          </span>
                          <span
                            className={cn(
                              'font-mono font-bold tabular-nums',
                              active ? 'text-[#67E8F9]' : 'text-[#71717A]',
                            )}
                          >
                            {row.creditPercent}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3.5">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#71717A]" aria-hidden="true" />
                    <p className="text-[11px] leading-relaxed text-[#71717A]">
                      {vendor.sla!.notes} Claims must normally be filed within{' '}
                      {vendor.sla!.claimWindowDays} days.
                    </p>
                  </div>

                  <a
                    href={vendor.sla!.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0891B2] transition-colors hover:text-[#67E8F9]"
                  >
                    Read the published SLA
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <p className="mt-4 px-2 text-[11px] leading-relaxed text-[#A1A1AA]">
                This is an estimate based on each provider&apos;s published credit schedule. The
                provider&apos;s own measurement, exclusions and approval decision govern the final
                amount.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How credits work ────────────────────────────────────────────── */}
      <section className="border-t border-[#F0F0F0] bg-[#FCFCFD] px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-[1120px]">
          <motion.div className="mx-auto max-w-2xl text-center" {...fadeUp}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#0891B2]">
              How SLA credits work
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#09090B] sm:text-4xl">
              From outage to credit.
            </h2>
            <p className="mt-5 leading-relaxed text-[#52525B]">
              Credits are almost never automatic. The provider expects you to calculate the
              shortfall and evidence it, interval by interval, before the deadline passes.
            </p>
          </motion.div>

          <div className="relative mt-16">
            {/* Connector line */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-[34px] hidden h-px bg-gradient-to-r from-transparent via-[#E4E4E7] to-transparent lg:block"
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  className="relative"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-70px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease }}
                >
                  <div className="group h-full rounded-[18px] border border-[#E4E4E7] bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#0891B2]/30 hover:shadow-[0_8px_28px_rgba(8,145,178,0.08)]">
                    <div className="relative mb-5 flex h-[68px] items-start">
                      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] border border-[#0891B2]/15 bg-[#0891B2]/8 transition-colors duration-200 group-hover:bg-[#0891B2]/12">
                        <step.icon className="h-6 w-6 text-[#0891B2]" aria-hidden="true" />
                      </span>
                      <span className="ml-auto font-mono text-[32px] font-extrabold leading-none text-[#F0F0F0] transition-colors duration-200 group-hover:text-[#0891B2]/15">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-[#09090B]">{step.title}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#52525B]">{step.body}</p>
                  </div>

                  {/* Arrow between cards */}
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-[18px] top-[34px] hidden h-6 w-6 items-center justify-center rounded-full border border-[#E4E4E7] bg-white lg:flex"
                    >
                      <ArrowRight className="h-3 w-3 text-[#A1A1AA]" />
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Reference table */}
          <motion.div className="mt-16 overflow-hidden rounded-[18px] border border-[#E4E4E7] bg-white" {...fadeUp}>
            <div className="border-b border-[#F0F0F0] bg-[#FCFCFD] px-6 py-4">
              <h3 className="text-sm font-semibold text-[#09090B]">
                What each commitment allows per month
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-[#F0F0F0] text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Commitment
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      30-day allowance
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Annual allowance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[99.0, 99.5, 99.9, 99.95, 99.99].map((c, i) => (
                    <tr
                      key={c}
                      className={cn(
                        'border-b border-[#F5F5F5] last:border-0',
                        i % 2 === 1 && 'bg-[#FCFCFD]',
                      )}
                    >
                      <td className="px-6 py-3.5 font-mono font-semibold tabular-nums text-[#09090B]">
                        {c}%
                      </td>
                      <td className="px-6 py-3.5 font-mono tabular-nums text-[#52525B]">
                        {formatMinutesPrecise(allowanceMinutes(c, 30))}
                      </td>
                      <td className="px-6 py-3.5 font-mono tabular-nums text-[#52525B]">
                        {formatMinutesPrecise(allowanceMinutes(c, 365))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 md:px-12 md:py-28">
        <motion.div
          className="relative mx-auto max-w-[1000px] overflow-hidden rounded-[24px] bg-[#0A0A0F] px-8 py-16 text-center sm:px-14"
          {...fadeUp}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 90% at 50% 0%, rgba(8,145,178,0.20) 0%, transparent 70%)',
            }}
          />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-[#FAFAFA] sm:text-4xl">
              The calculation is the easy part.
            </h2>
            <p className="mx-auto mt-5 max-w-xl leading-relaxed text-[#A1A1AA]">
              The hard part is having per-interval, independently observed evidence when the
              deadline arrives. Reliastra records it continuously, from outside your stack.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/register"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#FAFAFA] px-7 text-sm font-semibold text-[#0A0A0F] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start tracking free
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </a>
              <a
                href="/docs/concepts/how-to-claim-sla-credits"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[rgba(255,255,255,0.14)] px-7 text-sm font-semibold text-[#FAFAFA] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.05)]"
              >
                Read the claim guide
              </a>
            </div>
            <p className="mt-7 text-xs text-[#52525B]">
              No credit card required · Free vendor tracking forever
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
