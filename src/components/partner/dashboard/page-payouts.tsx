'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Check, Loader2 } from 'lucide-react';
import { usePartnerStore } from '@/stores/partner-store';
import { partnerApi } from '@/lib/partner-api';
import { formatCurrency, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/partner/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { Payout } from '@/types/partner';

// --- Loading skeleton ---
function PayoutsSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 rounded-lg" />
      <div className="border border-border/60 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border/60">
          <Skeleton className="h-3 w-36" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-5 py-4 border-b border-border/30 last:border-b-0 flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="text-right space-y-1.5">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-5 w-20 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Empty state ---
function PayoutsEmpty({ payable, onRequest }: { payable: number; onRequest: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Payouts
        </h1>
      </div>
      <div className="border border-border/60 rounded-lg bg-background p-6 md:p-8">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Available to withdraw
        </p>
        <p className="text-4xl md:text-5xl font-semibold tracking-tight tabular-nums mb-6">
          {formatCurrency(payable)}
        </p>
        <Button
          onClick={onRequest}
          disabled={payable <= 0}
          className="min-w-[200px]"
        >
          REQUEST PAYOUT
        </Button>
      </div>
      <div className="py-16 text-center">
        <h3 className="text-lg font-medium tracking-tight mb-2">
          No payouts yet
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          When you request a payout, it will appear here with its processing
          status.
        </p>
      </div>
    </motion.div>
  );
}

// --- Payout row ---
function PayoutRow({ payout, index }: { payout: Payout; index: number }) {
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
          <p className="text-sm">
            {payout.method || 'Payout'}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {formatDate(payout.createdAt)}
            {payout.paidAt && (
              <span className="ml-2">Paid {formatDate(payout.paidAt)}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-4">
          <StatusBadge status={payout.status} />
          <span className="font-mono text-sm tabular-nums min-w-[80px] text-right">
            {formatCurrency(payout.amount)}
          </span>
        </div>
      </div>
      {/* Mobile card */}
      <div className="md:hidden px-5 py-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm">
            {payout.method || 'Payout'}
          </span>
          <StatusBadge status={payout.status} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-muted-foreground">
            {formatDate(payout.createdAt)}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {formatCurrency(payout.amount)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// --- Main page ---
export function PagePayouts() {
  const queryClient = useQueryClient();
  const dashboardData = usePartnerStore((s) => s.dashboardData);
  const [payoutState, setPayoutState] = useState<'idle' | 'processing' | 'requested'>('idle');

  const { data: payouts, isLoading, isError } = useQuery<Payout[]>({
    queryKey: ['partner-payouts'],
    queryFn: partnerApi.getPayouts,
    staleTime: 30_000,
  });

  const payable = dashboardData?.payable ?? 0;
  const list = payouts || [];

  const handleRequestPayout = useCallback(async () => {
    if (payoutState !== 'idle') return;
    setPayoutState('processing');
    try {
      await partnerApi.requestPayout();
      setPayoutState('requested');
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['partner-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['partner-dashboard'] });
      setTimeout(() => setPayoutState('idle'), 3000);
    } catch {
      setPayoutState('idle');
    }
  }, [payoutState, queryClient]);

  if (isLoading) {
    return <PayoutsSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-4xl">
        <p className="text-sm text-muted-foreground">
          Unable to load payouts. Please try refreshing.
        </p>
      </div>
    );
  }

  if (list.length === 0) {
    return <PayoutsEmpty payable={payable} onRequest={handleRequestPayout} />;
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
          Payouts
        </h1>
      </motion.div>

      {/* Available to withdraw card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="border border-border/60 rounded-lg bg-background p-6 md:p-8"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Available to withdraw
        </p>
        <p className="text-4xl md:text-5xl font-semibold tracking-tight tabular-nums mb-6">
          {formatCurrency(payable)}
        </p>
        <Button
          onClick={handleRequestPayout}
          disabled={payoutState !== 'idle' || payable <= 0}
          className="min-w-[200px]"
        >
          <AnimatePresence mode="wait">
            {payoutState === 'idle' && (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-2"
              >
                <Wallet className="size-4" />
                REQUEST PAYOUT
              </motion.span>
            )}
            {payoutState === 'processing' && (
              <motion.span
                key="processing"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="size-4 animate-spin" />
                PROCESSING
              </motion.span>
            )}
            {payoutState === 'requested' && (
              <motion.span
                key="requested"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex items-center gap-2"
              >
                <Check className="size-4" />
                REQUESTED
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Payout history */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="border border-border/60 rounded-lg bg-background overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border/60">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Payout history
          </p>
        </div>
        {list.map((p, i) => (
          <PayoutRow key={p.id} payout={p} index={i} />
        ))}
      </motion.div>
    </div>
  );
}
