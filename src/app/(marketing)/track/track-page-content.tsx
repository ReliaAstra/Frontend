'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { vendorService, type VendorResponse } from '@/services/vendorService';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

const statusConfig: Record<string, { label: string; dotColor: string; textColor: string }> = {
  operational: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
  degraded_performance: { label: 'Degraded', dotColor: 'bg-amber-500', textColor: 'text-amber-600' },
  partial_outage: { label: 'Partial Outage', dotColor: 'bg-orange-500', textColor: 'text-orange-600' },
  major_outage: { label: 'Major Outage', dotColor: 'bg-red-500', textColor: 'text-red-600' },
  unknown: { label: 'Unknown', dotColor: 'bg-gray-400', textColor: 'text-gray-500' },
};

export function TrackPageContent() {
  const [vendors, setVendors] = useState<VendorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('');
  const [lastSuccess, setLastSuccess] = useState<string | null>(null);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await vendorService.listPublicVendors();
      setVendors(data);
      setLastSuccess(new Date().toISOString());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const filtered = vendors.filter(
    (v) =>
      v.display_name.toLowerCase().includes(filter.toLowerCase()) ||
      v.category.toLowerCase().includes(filter.toLowerCase()) ||
      v.slug.toLowerCase().includes(filter.toLowerCase())
  );

  const formatLastObserved = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2">
          Vendor Intelligence
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#09090B] tracking-tight">
              All Monitored Vendors
            </h1>
            <p className="text-sm text-[#52525B] mt-1">
              Independent reliability observations across {loading ? '—' : vendors.length} vendors.
            </p>
          </div>
          {lastSuccess && !loading && (
            <p className="text-xs text-gray-400 font-mono">
              Last refresh: {new Date(lastSuccess).toISOString().replace('T', ' ').slice(0, 19)} UTC
            </p>
          )}
        </div>
      </motion.div>

      {/* Search filter */}
      {!loading && !error && vendors.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Filter vendors..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-9 text-sm bg-[#F8F9FA] border-gray-200 focus-visible:ring-[#0891B2]/20"
          />
        </div>
      )}

      {/* Loading State — Skeleton Table */}
      {loading && (
        <div className="space-y-0">
          <Skeleton className="h-10 w-full bg-gray-100 rounded-t-lg rounded-b-none" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full bg-gray-50" style={{ borderBottom: '1px solid #F4F4F5' }} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="rounded-lg border border-[#E4E4E7] bg-[#F8F9FA] p-8 text-center">
          <AlertCircle className="h-8 w-8 text-[#A1A1AA] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#09090B]">Data unavailable</p>
          {lastSuccess && (
            <p className="text-xs text-gray-400 mt-1">
              Last successful observation: {new Date(lastSuccess).toISOString().replace('T', ' ').slice(0, 19)} UTC
            </p>
          )}
          <button
            onClick={fetchVendors}
            className="mt-4 text-xs font-medium text-[#0891B2] hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && vendors.length === 0 && (
        <div className="rounded-lg border border-[#E4E4E7] bg-[#F8F9FA] p-12 text-center">
          <p className="text-sm text-[#52525B]">No vendors being monitored</p>
        </div>
      )}

      {/* Vendor Table */}
      {!loading && !error && filtered.length > 0 && (
        <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8F9FA] border-b border-[#E4E4E7]">
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Vendor
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden sm:table-cell">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    Reliability
                  </th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden lg:table-cell">
                    P95 Latency
                  </th>
                  <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-gray-400 hidden md:table-cell">
                    Last Observed
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((vendor) => {
                  const sConfig = statusConfig[vendor.current_status] || statusConfig.unknown;
                  return (
                    <Link
                      key={vendor.id}
                      href={`/track/${vendor.slug}`}
                      className="contents"
                    >
                      <tr className="border-b border-gray-100 last:border-0 hover:bg-[#F8F9FA] transition-colors cursor-pointer group">
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors">
                            {vendor.display_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 hidden sm:table-cell">
                          {vendor.category}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'h-2 w-2 rounded-full shrink-0',
                              sConfig.dotColor,
                              (vendor.current_status === 'degraded_performance' || vendor.current_status === 'partial_outage') && 'animate-pulse'
                            )} />
                            <span className={cn('text-xs font-medium', sConfig.textColor)}>
                              {sConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono text-sm font-semibold text-[#09090B]">
                            {vendor.uptime_90d.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-gray-500 hidden lg:table-cell">
                          —
                        </td>
                        <td className="py-3.5 px-4 text-right text-xs text-gray-400 hidden md:table-cell">
                          {formatLastObserved(vendor.last_checked_at)}
                        </td>
                        <td className="py-3.5 px-4">
                          <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#0891B2] transition-colors ml-auto" />
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
          <p className="text-sm text-gray-400">No vendors match your filter.</p>
        </div>
      )}
    </div>
  );
}
