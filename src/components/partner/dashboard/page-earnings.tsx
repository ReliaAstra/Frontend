'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { usePartnerStore } from '@/stores/partner-store';
import { partnerApi } from '@/lib/partner-api';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/partner/shared/status-badge';
import { MetricCard } from '@/components/partner/shared/metric-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Commission } from '@/types/partner';

// --- Loading skeleton ---
function EarningsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-4xl"
    >
      <Skeleton className="h-8 w-48" />
      {/* Hero metric card */}
      <div className="border border-border/60 rounded-lg bg-background p-6 md:p-8">
        <Skeleton className="h-3 w-28 mb-2" />
        <Skeleton className="h-12 w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg border border-border/60" />
        ))}
      </div>
      {/* Earnings history table */}
      <div className="border border-border/60 rounded-lg bg-background overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <Skeleton className="h-3 w-36" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-border/30 last:border-b-0 flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-5 w-16 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Empty state with projected earnings ---
function EarningsEmpty() {
  const projections = [
    { referrals: 1, monthly: 14.7, yearly: 176.4 },
    { referrals: 5, monthly: 73.5, yearly: 882 },
    { referrals: 10, monthly: 147, yearly: 1764 },
    { referrals: 25, monthly: 367.5, yearly: 4410 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Earnings
        </h1>
      </div>

      {/* Projected earnings */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="border border-border/60 rounded-lg bg-background overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border/60">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Projected earnings at $49/mo Pro plan
          </p>
        </div>
        <div className="divide-y divide-border/30">
          {projections.map((p, i) => {
            const barWidth = Math.min((p.referrals / 25) * 100, 100);
            return (
              <motion.div
                key={p.referrals}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                className="px-5 py-4 flex items-center gap-4"
              >
                <div className="w-20 shrink-0">
                  <span className="font-mono text-xs text-muted-foreground">
                    {p.referrals} {p.referrals === 1 ? 'referral' : 'referrals'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-2 bg-muted/60 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                      className="h-full bg-foreground/80 rounded-full"
                    />
                  </div>
                </div>
                <div className="w-28 text-right shrink-0">
                  <p className="font-mono text-sm tabular-nums">
                    {formatCurrency(p.monthly)}/mo
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {formatCurrency(p.yearly)}/yr
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="px-5 py-3 border-t border-border/60 bg-muted/20">
          <p className="text-[11px] text-muted-foreground">
            Projections based on 30% commission of $49/mo subscription. Actual earnings depend on referral plan and retention.
          </p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="py-8 text-center"
      >
        <h3 className="text-lg font-medium tracking-tight mb-2">
          No earnings yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When your referrals subscribe, your commissions will appear here.
          Share your referral link to get started.
        </p>
      </motion.div>
    </motion.div>
  );
}

// --- Commission row ---
function CommissionRow({ commission, index }: { commission: Commission; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.02 * index }}
      className="border-b border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors"
    >
      {/* Desktop row */}
      <div className="hidden md:flex items-center justify-between px-5 py-3.5">
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {commission.period
              ? `Commission for ${commission.period}`
              : 'Referral commission'}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {formatDate(commission.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <StatusBadge status={commission.status} />
          <span className="font-mono text-sm tabular-nums min-w-[80px] text-right">
            {formatCurrency(commission.amount)}
          </span>
        </div>
      </div>
      {/* Mobile card */}
      <div className="md:flex md:hidden px-5 py-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm truncate">
            {commission.period
              ? `Commission for ${commission.period}`
              : 'Referral commission'}
          </span>
          <StatusBadge status={commission.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatDate(commission.createdAt)}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {formatCurrency(commission.amount)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main page ---
export function PageEarnings() {
  const { data: commissions, isLoading, isError } = useQuery<Commission[]>({
    queryKey: ['partner-commissions'],
    queryFn: partnerApi.getCommissions,
    staleTime: 30_000,
  });

  const list = commissions || [];

  // Calculate summary from commissions
  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    let thisMonthTotal = 0;
    let pendingTotal = 0;
    let payableTotal = 0;
    let paidTotal = 0;
    let totalEarned = 0;

    for (const c of list) {
      const d = new Date(c.createdAt);
      totalEarned += c.amount;

      if (c.status === 'pending') pendingTotal += c.amount;
      if (c.status === 'payable') payableTotal += c.amount;
      if (c.status === 'paid') paidTotal += c.amount;

      if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
        thisMonthTotal += c.amount;
      }
    }

    return { totalEarned, thisMonthTotal, pendingTotal, payableTotal, paidTotal };
  }, [list]);

  if (isLoading) {
    return <EarningsSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Unable to load earnings. Please try refreshing.
        </p>
      </div>
    );
  }

  if (list.length === 0) {
    return <EarningsEmpty />;
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Earnings
        </h1>
      </motion.div>

      {/* Hero metric */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="border border-border/60 rounded-lg bg-background p-6 md:p-8">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Total earned
          </p>
          <p className="text-4xl md:text-5xl font-semibold tracking-tight tabular-nums">
            {formatCurrency(summary.totalEarned)}
          </p>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="This Month"
          value={formatCurrency(summary.thisMonthTotal)}
          delay={0.1}
        />
        <MetricCard
          label="Pending"
          value={formatCurrency(summary.pendingTotal)}
          delay={0.15}
        />
        <MetricCard
          label="Payable"
          value={formatCurrency(summary.payableTotal)}
          delay={0.2}
        />
        <MetricCard
          label="Paid"
          value={formatCurrency(summary.paidTotal)}
          delay={0.25}
        />
      </div>

      {/* Earnings history */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="border border-border/60 rounded-lg bg-background overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border/60">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Earnings history
          </p>
        </div>
        {list.map((c, i) => (
          <CommissionRow key={c.id} commission={c} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
