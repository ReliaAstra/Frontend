'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
 sublabel?: string;
 className?: string;
 delay?: number;
}

export function MetricCard({ label, value, sublabel, className, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'border border-border/60 rounded-lg p-5 md:p-6 bg-background transition-colors duration-200 hover:border-border hover:bg-muted/20',
        className
      )}
    >
      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {sublabel && (
        <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
      )}
    </motion.div>
  );
}
