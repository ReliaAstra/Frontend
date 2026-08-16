'use client';

import { cn } from '@/lib/utils';

const WINDOWS = ['1h', '24h', '7d', '30d', '90d'] as const;
type Window = typeof WINDOWS[number];

interface Props {
  active: Window | string;
  onChange: (w: string) => void;
}

export function TimeRangeSelector({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1">
      {WINDOWS.map(w => (
        <button
          key={w}
          onClick={() => onChange(w)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-all duration-150',
            active === w
              ? 'bg-[#1A1A20] text-[#FAFAFA] border border-[rgba(255,255,255,0.12)] font-medium'
              : 'text-[#52525B] hover:text-[#A1A1AA]'
          )}
        >
          {w}
        </button>
      ))}
    </div>
  );
}
