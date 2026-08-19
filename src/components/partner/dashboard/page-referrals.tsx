'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Copy, ArrowRight } from 'lucide-react';
import { usePartnerStore } from '@/stores/partner-store';
import { partnerApi } from '@/lib/partner-api';
import { formatCurrency, maskEmail, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/partner/shared/status-badge';
import { ReferralLinkCard } from '@/components/partner/shared/referral-link-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { Referral } from '@/types/partner';

// --- Loading skeleton ---
function ReferralsSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <Skeleton className="h-3 w-24" />
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-border/30 last:border-b-0">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded" />
            </div>
            <div className="flex items-center justify-between mt-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Empty state ---
function ReferralsEmpty({ referralLink }: { referralLink: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Referrals
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm font-mono">
          0 referrals
        </p>
      </div>
      <div className="py-16 md:py-24 text-center">
        <h3 className="text-lg font-medium tracking-tight mb-2">
          No referrals yet
        </h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          Share your referral link to start earning. When someone subscribes
          through your link, they&apos;ll appear here.
        </p>
        <div className="max-w-md mx-auto">
          <ReferralLinkCard link={referralLink} size="large" showLabel={false} />
        </div>
      </div>
    </motion.div>
  );
}

// --- Main page ---
export function PageReferrals() {
  const dashboardData = usePartnerStore((s) => s.dashboardData);

  const { data: referrals, isLoading, isError } = useQuery<Referral[]>({
    queryKey: ['partner-referrals'],
    queryFn: partnerApi.getReferrals,
    staleTime: 30_000,
  });

  if (isLoading) {
    return <ReferralsSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Unable to load referrals. Please try refreshing.
        </p>
      </div>
    );
  }

  const list = referrals || [];

  if (list.length === 0) {
    return <ReferralsEmpty referralLink={dashboardData?.referralLink || ''} />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-3"
      >
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Referrals
        </h1>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
          {list.length}
        </span>
      </motion.div>

      {/* Table container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="border border-border/60 rounded-lg bg-background overflow-hidden"
      >
        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                  Customer
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                  Plan
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                  Monthly Earned
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground font-normal">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((ref, i) => (
                <motion.tr
                  key={ref.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.03 * i }}
                  className="border-b border-border/30 last:border-b-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs">
                      {ref.referredEmail ? maskEmail(ref.referredEmail) : '---'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">
                    {ref.plan || '---'}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={ref.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-xs">
                    {formatCurrency(ref.monthlyEarned)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-xs text-muted-foreground">
                    {formatDate(ref.createdAt)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border/40">
          {list.map((ref, i) => (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.03 * i }}
              className="px-5 py-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs">
                  {ref.referredEmail ? maskEmail(ref.referredEmail) : '---'}
                </span>
                <StatusBadge status={ref.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{ref.plan || '---'}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formatDate(ref.createdAt)}
                  </span>
                </div>
                <span className="font-mono text-xs tabular-nums">
                  {formatCurrency(ref.monthlyEarned)}/mo
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
