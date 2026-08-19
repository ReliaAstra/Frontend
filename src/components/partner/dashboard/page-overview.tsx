'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { usePartnerStore } from '@/stores/partner-store';
import { partnerApi } from '@/lib/partner-api';
import { formatCurrency, maskEmail, formatDate } from '@/lib/format';
import { MetricCard } from '@/components/partner/shared/metric-card';
import { ReferralLinkCard } from '@/components/partner/shared/referral-link-card';
import { StatusBadge } from '@/components/partner/shared/status-badge';
import { EmptyState } from '@/components/partner/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Referral } from '@/types/partner';

// --- How it works strip ---
function HowItWorks() {
  const steps = [
    { label: 'SHARE', detail: 'Your link' },
    { label: 'THEY SUBSCRIBE', detail: 'To RELIASTRA' },
    { label: 'YOU EARN 30%', detail: 'Every month' },
  ];

  return (
    <div className="flex items-center justify-center gap-0 py-5">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center text-center">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground font-medium">
              {step.label}
            </span>
            <span className="text-[11px] text-muted-foreground mt-0.5">
              {step.detail}
            </span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="size-3.5 text-border mx-4 md:mx-6 shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// --- Recent referrals table ---
function RecentReferrals({ referrals }: { referrals: Referral[] }) {
  const recent = referrals.slice(0, 5);

  if (recent.length === 0) return null;

  return (
    <div className="border border-border/60 rounded-lg bg-background overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border/60">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Recent referrals
        </p>
      </div>
      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                Customer
              </th>
              <th className="text-left px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                Plan
              </th>
              <th className="text-left px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                Status
              </th>
              <th className="text-right px-5 py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                Monthly earned
              </th>
            </tr>
          </thead>
          <tbody>
            {recent.map((ref) => (
              <tr
                key={ref.id}
                className="border-b border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-5 py-3">
                  <span className="font-mono text-xs">
                    {ref.referredEmail ? maskEmail(ref.referredEmail) : '---'}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{ref.plan || '---'}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={ref.status} />
                </td>
                <td className="px-5 py-3 text-right font-mono tabular-nums">
                  {formatCurrency(ref.monthlyEarned)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-border/40">
        {recent.map((ref) => (
          <div key={ref.id} className="px-5 py-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-xs">
                {ref.referredEmail ? maskEmail(ref.referredEmail) : '---'}
              </span>
              <StatusBadge status={ref.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{ref.plan || '---'}</span>
              <span className="font-mono text-xs tabular-nums">
                {formatCurrency(ref.monthlyEarned)}/mo
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Loading skeleton ---
function OverviewSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-48 rounded-lg" />
    </div>
  );
}

// --- Main page ---
export function PageOverview() {
  const dashboardData = usePartnerStore((s) => s.dashboardData);
  const navigate = usePartnerStore((s) => s.navigate);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: partnerApi.getDashboard,
    staleTime: 30_000,
  });

  // Use query data if available, fall back to store
  const d = data || dashboardData;

  // Check if truly empty (no referrals and zero earnings)
  const isEmpty =
    d &&
    (!d.referrals || d.referrals.length === 0) &&
    d.totalEarned === 0;

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (isError || !d) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Unable to load dashboard data. Please try refreshing.
        </p>
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyState referralLink={d.referralLink} onGoToDashboard={() => navigate('dashboard')} />;
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
          Your Partner Network
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Turn your referrals into recurring revenue.
        </p>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Earned"
          value={formatCurrency(d.totalEarned)}
          delay={0.05}
        />
        <MetricCard
          label="This Month"
          value={formatCurrency(d.thisMonth)}
          delay={0.1}
        />
        <MetricCard
          label="Active Customers"
          value={String(d.activeCustomers)}
          delay={0.15}
        />
        <MetricCard
          label="Payable"
          value={formatCurrency(d.payable)}
          sublabel="Available to withdraw"
          delay={0.2}
        />
      </div>

      {/* Referral link card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <ReferralLinkCard link={d.referralLink} size="large" />
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="border border-border/40 rounded-lg bg-muted/20 py-1">
          <HowItWorks />
        </div>
      </motion.div>

      {/* Recent referrals */}
      {d.referrals && d.referrals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
        >
          <RecentReferrals referrals={d.referrals} />
        </motion.div>
      )}
    </div>
  );
}
