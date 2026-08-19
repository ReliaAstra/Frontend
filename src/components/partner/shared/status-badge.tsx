'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'cancelled' | 'paid' | 'payable' | 'processing' | 'completed' | 'failed';
  className?: string;
}

const statusConfig: Record<StatusBadgeProps['status'], { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
  paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  payable: { label: 'Payable', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  processing: { label: 'Processing', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Failed', className: 'bg-red-50 text-red-700 border-red-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
