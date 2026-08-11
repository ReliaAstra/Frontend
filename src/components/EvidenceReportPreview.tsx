'use client';
import { BrowserMockup } from '@/components/BrowserMockup';

export function EvidenceReportPreview() {
  return (
    <BrowserMockup url="reliastra.com/reports/RPT-2024-0847.pdf" className="max-w-md">
      <div className="relative p-5 space-y-4 bg-white scan-line">
        {/* Report Header */}
        <div className="border-b border-[#E4E4E7] pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#A1A1AA] font-mono uppercase tracking-wider">SLA Evidence Report</p>
              <p className="text-sm font-bold text-[#09090B]">RPT-2024-0847</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span className="text-[10px] font-medium text-[#16A34A]">VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Incident Summary</p>
          <div className="bg-[#F8F9FA] rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#52525B]">Vendor</span>
              <span className="font-semibold text-[#09090B]">Stripe Payments API</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#52525B]">Duration</span>
              <span className="font-semibold text-[#DC2626]">47 min 12s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#52525B]">Impact</span>
              <span className="font-semibold text-[#09090B]">1,247 failed transactions</span>
            </div>
          </div>
        </div>

        {/* Verification Regions */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Independent Verification</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'US East', status: '✓', color: 'text-[#16A34A]' },
              { label: 'US West', status: '✓', color: 'text-[#16A34A]' },
              { label: 'EU West', status: '✓', color: 'text-[#16A34A]' },
            ].map((region) => (
              <div key={region.label} className="bg-[#F8F9FA] rounded-lg p-2 text-center">
                <span className={`text-sm font-bold ${region.color}`}>{region.status}</span>
                <p className="text-[10px] text-[#52525B] mt-0.5">{region.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Timeline */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-wider">Evidence Timeline</p>
          <div className="space-y-1.5">
            {[
              { time: '14:31:52 UTC', event: 'First 5xx detected', type: 'error' },
              { time: '14:31:54 UTC', event: 'Latency spike 4,200ms', type: 'warning' },
              { time: '14:32:01 UTC', event: 'Independent confirmation', type: 'info' },
              { time: '14:32:15 UTC', event: 'All 3 regions affected', type: 'error' },
              { time: '15:18:39 UTC', event: 'Service restored', type: 'success' },
            ].map((entry) => (
              <div key={entry.time} className="flex items-center gap-2 text-[11px]">
                <span className="font-mono text-[#A1A1AA] w-24 shrink-0">{entry.time}</span>
                <div
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.type === 'error'
                      ? 'bg-[#DC2626]'
                      : entry.type === 'warning'
                      ? 'bg-[#D97706]'
                      : entry.type === 'success'
                      ? 'bg-[#16A34A]'
                      : 'bg-[#0891B2]'
                  }`}
                />
                <span className="text-[#52525B]">{entry.event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Impact */}
        <div className="bg-[#ECFEFF] border border-[#0891B2]/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#0891B2] uppercase tracking-wider">SLA Credit Eligible</p>
              <p className="text-lg font-bold text-[#09090B] mt-0.5">~$2,840</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#0891B2]">Confidence</p>
              <p className="text-lg font-bold text-[#0891B2]">98.7%</p>
            </div>
          </div>
        </div>
      </div>
    </BrowserMockup>
  );
}