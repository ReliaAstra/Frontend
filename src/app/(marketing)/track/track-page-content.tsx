'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { vendorService, type VendorResponse } from '@/services/vendorService';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string }> = {
  up: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
  operational: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
  degraded: { label: 'Degraded', dotColor: 'bg-amber-500', textColor: 'text-amber-600' },
  degraded_performance: { label: 'Degraded', dotColor: 'bg-amber-500', textColor: 'text-amber-600' },
  down: { label: 'Down', dotColor: 'bg-red-500', textColor: 'text-red-600' },
  partial_outage: { label: 'Partial Outage', dotColor: 'bg-orange-500', textColor: 'text-orange-600' },
  major_outage: { label: 'Major Outage', dotColor: 'bg-red-500', textColor: 'text-red-600' },
  unknown: { label: 'Unknown', dotColor: 'bg-gray-400', textColor: 'text-gray-500' },
};

function formatLastObserved(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'N/A';
  }
}

export function TrackPageContent() {
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVendors = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await vendorService.listPublicVendors();
      setVendors(data);
      setLastSuccess(new Date().toISOString());
    } catch {
      setError('Unable to load vendor data. The measurement service may be unavailable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filtered = vendors.filter(
    (v) =>
      v.display_name.toLowerCase().includes(filter.toLowerCase()) ||
      v.category.toLowerCase().includes(filter.toLowerCase()) ||
      v.vendor_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#A1A1AA] mb-2">
          Vendor Intelligence
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#09090B] tracking-[-0.02em]">
              Monitored Vendors
            </h1>
            <p className="text-sm text-[#52525B] mt-1.5">
              Independent reliability measurements across {loading ? '...' : vendors.length} vendors.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSuccess && !loading && (
              <p className="text-[11px] font-mono text-[#A1A1AA]">
                Updated {formatLastObserved(lastSuccess)}
              </p>
            )}
            <button
              onClick={() => fetchVendors(true)}
              disabled={refreshing || loading}
              className="p-1.5 rounded-md hover:bg-[#F8F9FA] transition-colors text-[#A1A1AA] hover:text-[#52525B] disabled:opacity-50"
              aria-label="Refresh"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', refreshing && 'animate-spin')} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      {!loading && !error && vendors.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
          <Input
            placeholder="Filter vendors..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-sm bg-white border-[#E4E4E7] focus-visible:ring-[#0891B2]/20"
          />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-0">
          <Skeleton className="h-10 w-full bg-[#F8F9FA] rounded-t-lg rounded-b-none" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full bg-white" style={{ borderBottom: '1px solid #F0F0F0' }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-8 text-center">
          <AlertCircle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#09090B]">{error}</p>
          <button
            onClick={() => fetchVendors()}
            className="mt-4 text-xs font-medium text-[#0891B2] hover:text-[#0E7490] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && vendors.length === 0 && (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
          <p className="text-sm text-[#52525B]">No vendors are currently being monitored.</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Reliastra has not yet begun collecting observations for public vendors.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA]">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-[0.05em] text-[#A1A1AA] hidden md:table-cell">
                    Last Observed
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor) => {
                  const status = 'unknown';
                  const sConfig = statusConfig[status] || statusConfig.unknown;
                  return (
                    <Link
                      key={vendor.id}
                      href={`/track/${vendor.vendor_name}`}
                      className="contents"
                    >
                      <tr className="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA] transition-colors cursor-pointer group">
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors">
                            {vendor.display_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#52525B] hidden sm:table-cell">
                          {vendor.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'h-1.5 w-1.5 rounded-full shrink-0',
                              sConfig.dotColor,
                              (status === 'degraded' || status === 'degraded_performance' || status === 'partial_outage') && 'animate-pulse'
                            )} />
                            <span className={cn('text-xs font-medium', sConfig.textColor)}>
                              {sConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-[#A1A1AA] font-mono hidden md:table-cell">
                          {formatLastObserved(vendor.last_check_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <ArrowRight className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] transition-colors ml-auto" />
                        </td>
                      </tr>
                    </Link>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && vendors.length > 0 && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-[#A1A1AA]">No vendors match your filter.</p>
        </div>
      )}

      {/* Methodology note */}
      {!loading && vendors.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#E4E4E7]">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#A1A1AA] mb-2">
            Measurement Methodology
          </p>
          <p className="text-xs text-[#52525B] leading-relaxed max-w-2xl">
            Reliastra measures vendor endpoints from independent probe regions at defined intervals.
            Measurements include HTTP availability, response latency, status codes, regional consistency,
            and observation timestamps. Reliability calculations are derived from observed measurements
            and reflect actual endpoint behavior, not vendor-reported SLAs.
          </p>
        </div>
      )}
    </div>
  );
}
