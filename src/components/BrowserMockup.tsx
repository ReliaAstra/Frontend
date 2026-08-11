'use client';
import { cn } from '@/lib/utils';

interface BrowserMockupProps {
  url?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export function BrowserMockup({ url = 'reliastra.com/dashboard', children, className, ...rest }: BrowserMockupProps) {
  return (
    <div className={cn('rounded-2xl border border-[#E4E4E7] overflow-hidden shadow-elevated bg-white', className)} {...rest}>
      <div className="flex items-center gap-2 px-4 py-3.5 bg-[#F8F9FA] border-b border-[#E4E4E7]">
        <div className="flex gap-1.5">
          <div className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#F59E0B]" />
          <div className="w-[10px] h-[10px] rounded-full bg-[#22C55E]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-[#A1A1AA] font-mono">{url}</span>
        </div>
      </div>
      {children}
    </div>
  );
}
