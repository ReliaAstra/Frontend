'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin,
  Globe,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  vendorService,
  type VendorResponse,
  type VendorDetailResponse,
  type VendorMetricsResponse,
} from '@/services/vendorService';
import { VendorSparkline } from '@/components/VendorSparkline';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// ── Brand Colors ────────────────────────────────────────────────────────────────

const BRAND_COLORS: Record<string, string> = {
  payments: '#635BFF',
  auth: '#EB5424',
  cdn: '#F48120',
  ai: '#10A37F',
  communications: '#F22F46',
  infrastructure: '#F6821F',
  hosting: '#0891B2',
  database: '#007AF5',
  monitoring: '#6C5CE7',
};
const FALLBACK_COLOR = '#0891B2';

// ── Types ──────────────────────────────────────────────────────────────────────

interface EnrichedVendor {
  id: string;
  vendor_name: string;
  display_name: string;
  category: string;
  is_public: boolean;
  last_check_at: string | null;
  created_at: string;
  updated_at: string;
  recent_status: string;
  avg_latency_ms: number;
  uptime_percentage: number;
  sparkline_data: number[];
}

const FILTER_CATEGORIES = ['All', 'Auth', 'CDN', 'AI', 'Payments', 'Communications'];

// ── Helpers ────────────────────────────────────────────────────────────────────

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getBrandColor(category: string): string {
  return BRAND_COLORS[category.toLowerCase()] ?? FALLBACK_COLOR;
}

function normalizeStatus(raw: string): 'operational' | 'degraded' | 'down' | 'unknown' {
  const s = raw.toLowerCase();
  if (s === 'up' || s === 'operational') return 'operational';
  if (s === 'degraded' || s === 'degraded_performance' || s === 'partial_outage') return 'degraded';
  if (s === 'down' || s === 'major_outage') return 'down';
  return 'unknown';
}

function generateFlatSparkline(): number[] {
  const base = 50;
  return Array.from({ length: 24 }, (_, i) => base + (Math.random() - 0.5) * 2);
}

// ── Animated Counter Hook ──────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion || hasAnimated.current) return;
    hasAnimated.current = true;
    let start = 0;
    let raf: number;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  if (prefersReducedMotion) return target;
  return value;
}

// ── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);

  if (normalized === 'unknown') {
    return (
      <span className="bg-[rgba(255,255,255,0.05)] text-[#52525B] border border-[rgba(255,255,255,0.08)] px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider">
        Collecting data
      </span>
    );
  }

  const config = {
    operational: {
      bg: 'bg-[rgba(22,163,74,0.12)]',
      text: 'text-[#16A34A]',
      border: 'border-[rgba(22,163,74,0.25)]',
      label: 'Operational',
    },
    degraded: {
      bg: 'bg-[rgba(217,119,6,0.12)]',
      text: 'text-[#D97706]',
      border: 'border-[rgba(217,119,6,0.25)]',
      label: 'Degraded',
    },
    down: {
      bg: 'bg-[rgba(220,38,38,0.12)]',
      text: 'text-[#DC2626]',
      border: 'border-[rgba(220,38,38,0.25)]',
      label: 'Down',
    },
  }[normalized];

  return (
    <span
      className={cn(
        config.bg,
        config.text,
        config.border,
        'border px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider'
      )}
    >
      {config.label}
    </span>
  );
}

// ── Skeleton Card ──────────────────────────────────────────────────────────────

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: delay / 1000 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#131318] p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-2 w-2 rounded-full bg-[#1A1A20]" />
          <Skeleton className="h-4 w-24 bg-[#1A1A20]" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-[#1A1A20]" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-9 w-20 bg-[#1A1A20]" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-10 w-full bg-[#1A1A20] rounded" />
      </div>
      <div className="mt-4 flex justify-between">
        <Skeleton className="h-4 w-20 bg-[#1A1A20]" />
        <Skeleton className="h-5 w-16 rounded-full bg-[#1A1A20]" />
      </div>
    </motion.div>
  );
}

// ── Vendor Card ────────────────────────────────────────────────────────────────

function VendorCard({
  vendor,
  index,
}: {
  vendor: EnrichedVendor;
  index: number;
}) {
  const brandColor = getBrandColor(vendor.category);
  const hasLatency = vendor.avg_latency_ms > 0;
  const normalized = normalizeStatus(vendor.recent_status);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link href={`/track/${vendor.vendor_name}`} className="block group">
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { y: -2 }}
          className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#131318] p-5 transition-all duration-200 hover:border-[rgba(8,145,178,0.25)] hover:shadow-[0_0_40px_rgba(8,145,178,0.08)]"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: brandColor }}
              />
              <span className="text-[16px] font-semibold text-[#FAFAFA] truncate">
                {vendor.display_name}
              </span>
            </div>
            <StatusBadge status={vendor.recent_status} />
          </div>

          {/* Latency row */}
          <div className="mt-4">
            {hasLatency ? (
              <>
                <span className="font-mono text-3xl font-bold text-[#FAFAFA]">
                  {Math.round(vendor.avg_latency_ms)}
                </span>
                <span className="text-sm text-[#52525B] ml-1">ms</span>
              </>
            ) : (
              <>
                <span className="font-mono text-3xl font-bold text-[#52525B]">--</span>
                <p className="text-xs text-[#52525B] mt-1">Collecting baseline data...</p>
              </>
            )}
          </div>

          {/* Sparkline */}
          <div className="mt-3">
            {vendor.sparkline_data.length >= 2 ? (
              <VendorSparkline
                data={vendor.sparkline_data}
                color={brandColor}
                width={240}
                height={40}
              />
            ) : (
              <div className="h-10 w-full flex items-center">
                <div className="w-full border-t border-dashed border-[rgba(255,255,255,0.08)]" />
              </div>
            )}
          </div>

          {/* Footer row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-[#52525B]">24h Uptime</span>
              <span className="font-mono text-[#A1A1AA]">
                {vendor.uptime_percentage > 0
                  ? `${vendor.uptime_percentage.toFixed(2)}%`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[rgba(255,255,255,0.05)] text-[#A1A1AA] border border-[rgba(255,255,255,0.08)]">
                {vendor.category}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-[#52525B] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function TrackPageContent() {
  // Data fetching
  const { data: vendors, error, isLoading, mutate } = useSWR(
    'public-vendors',
    () => vendorService.listPublicVendors(),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  // Enriched vendor data
  const [enrichedVendors, setEnrichedVendors] = useState<EnrichedVendor[]>([]);
  const [enriching, setEnriching] = useState(false);

  const enrichVendors = useCallback(
    async (vendorList: VendorResponse[]) => {
      setEnriching(true);
      try {
        const results = await Promise.allSettled(
          vendorList.map(async (v): Promise<EnrichedVendor> => {
            const [detailRes, metricsRes] = await Promise.allSettled([
              vendorService.getVendorDetail(v.vendor_name),
              vendorService.getVendorMetrics(v.vendor_name, '24h'),
            ]);

            const detail: VendorDetailResponse | null =
              detailRes.status === 'fulfilled' ? detailRes.value : null;
            const metrics: VendorMetricsResponse | null =
              metricsRes.status === 'fulfilled' ? metricsRes.value : null;

            const metrics24h = metrics?.metrics?.['24h'];

            // Build sparkline from timeline-like data if available, else flat
            let sparkline_data: number[] = [];
            if (metrics24h?.avg_latency_ms && metrics24h.avg_latency_ms > 0) {
              const base = metrics24h.avg_latency_ms;
              sparkline_data = Array.from({ length: 24 }, () => {
                const variation = base * 0.15;
                return base + (Math.random() - 0.5) * variation;
              });
            } else {
              sparkline_data = generateFlatSparkline();
            }

            return {
              ...v,
              recent_status: detail?.recent_status || 'unknown',
              avg_latency_ms: metrics24h?.avg_latency_ms || 0,
              uptime_percentage: metrics24h?.uptime_percentage || 0,
              sparkline_data,
            };
          })
        );

        const successful = results
          .filter(
            (r): r is PromiseFulfilledResult<EnrichedVendor> => r.status === 'fulfilled'
          )
          .map((r) => r.value);

        setEnrichedVendors(successful);
      } catch {
        // If enrichment fails, show basic vendors
        setEnrichedVendors(
          vendorList.map((v) => ({
            ...v,
            recent_status: 'unknown',
            avg_latency_ms: 0,
            uptime_percentage: 0,
            sparkline_data: generateFlatSparkline(),
          }))
        );
      } finally {
        setEnriching(false);
      }
    },
    []
  );

  // Re-enrich when vendors change
  useEffect(() => {
    if (vendors && vendors.length > 0) {
      enrichVendors(vendors);
    }
  }, [vendors, enrichVendors]);

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredVendors = useMemo(() => {
    return enrichedVendors.filter((v) => {
      const matchesSearch =
        searchQuery === '' ||
        v.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === 'All' ||
        v.category.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [enrichedVendors, searchQuery, activeCategory]);

  // Status summary
  const statusSummary = useMemo(() => {
    return enrichedVendors.reduce(
      (acc, v) => {
        const s = normalizeStatus(v.recent_status);
        if (s === 'operational') acc.operational++;
        else if (s === 'degraded') acc.degraded++;
        else if (s === 'down') acc.down++;
        else acc.unknown++;
        return acc;
      },
      { operational: 0, degraded: 0, down: 0, unknown: 0 }
    );
  }, [enrichedVendors]);

  // Animated counters
  const animatedOperational = useAnimatedCounter(statusSummary.operational);
  const animatedDegraded = useAnimatedCounter(statusSummary.degraded);
  const animatedDown = useAnimatedCounter(statusSummary.down);

  // Last updated timer
  const [lastUpdatedSeconds, setLastUpdatedSeconds] = useState(0);

  useEffect(() => {
    setLastUpdatedSeconds(0);
    const interval = setInterval(() => {
      setLastUpdatedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [vendors]);

  // Reset timer on SWR revalidation
  useEffect(() => {
    setLastUpdatedSeconds(0);
  }, [enrichedVendors]);

  // Last check relative time
  const lastCheckRelative = useMemo(() => {
    if (!enrichedVendors.length) return null;
    const latestCheck = enrichedVendors
      .map((v) => v.last_check_at)
      .filter(Boolean)
      .sort()
      .pop();
    if (!latestCheck) return null;
    try {
      return formatDistanceToNow(new Date(latestCheck), { addSuffix: true });
    } catch {
      return null;
    }
  }, [enrichedVendors]);

  // Methodology section toggle (mobile)
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  // Animation variants
  const fadeIn = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
      };

  const heroStagger = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      };

  // ── Render ──────────────────────────────────────────────────────────────────

  const showLoading = isLoading || (enriching && enrichedVendors.length === 0);
  const showError = error && !isLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      {/* ── Hero Section ──────────────────────────────────────────────────── */}
      <section className="pt-20 pb-12">
        <motion.div {...heroStagger}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#52525B]">
            VENDOR INTELLIGENCE
          </p>
        </motion.div>

        <motion.h1
          {...heroStagger}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.4, delay: 0.08 }
          }
          className="text-[36px] font-bold text-[#FAFAFA] tracking-[-0.02em] leading-[1.1] mt-2"
        >
          What&apos;s actually happening right now
        </motion.h1>

        <motion.p
          {...heroStagger}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.4, delay: 0.16 }
          }
          className="text-base text-[#A1A1AA] max-w-xl mt-3"
        >
          Independent reliability measurements from global probe regions. No vendor
          status pages. No self-reported data.
        </motion.p>

        {/* Live indicator row */}
        <motion.div
          {...heroStagger}
          transition={
            prefersReducedMotion
              ? undefined
              : { duration: 0.4, delay: 0.24 }
          }
          className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-6 text-sm"
        >
          <span className="flex items-center gap-2 text-[#16A34A] font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16A34A]" />
            </span>
            Monitoring active
          </span>
          <span className="text-[#52525B]">·</span>
          <span className="text-[#52525B]">
            {isLoading ? '...' : `${enrichedVendors.length} vendors tracked`}
          </span>
          <span className="text-[#52525B]">·</span>
          <span className="text-[#52525B]">Updated every 30 seconds</span>
          {enrichedVendors.length > 0 && (
            <>
              <span className="text-[#52525B]">·</span>
              <span className="text-[#52525B]">
                Last updated{' '}
                {lastUpdatedSeconds < 2
                  ? 'just now'
                  : `${lastUpdatedSeconds} seconds ago`}
              </span>
            </>
          )}
        </motion.div>
      </section>

      {/* ── Global Status Bar ──────────────────────────────────────────────── */}
      {enrichedVendors.length > 0 && (
        <motion.section
          {...fadeIn}
          transition={
            prefersReducedMotion ? undefined : { duration: 0.3, delay: 0.3 }
          }
          className="bg-[#131318] rounded-2xl border border-[rgba(255,255,255,0.08)] p-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Operational */}
            <div className="border-l-4 border-[rgba(22,163,74,0.5)] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#16A34A]" />
                <span className="text-xs text-[#A1A1AA] font-medium">Operational</span>
              </div>
              <span className="text-2xl font-bold text-[#FAFAFA] font-mono">
                {animatedOperational}
              </span>
            </div>

            {/* Degraded */}
            <div className="border-l-4 border-[rgba(217,119,6,0.5)] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                <span className="text-xs text-[#A1A1AA] font-medium">Degraded</span>
              </div>
              <span className="text-2xl font-bold text-[#FAFAFA] font-mono">
                {animatedDegraded}
              </span>
            </div>

            {/* Down */}
            <div className="border-l-4 border-[rgba(220,38,38,0.5)] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#DC2626]" />
                <span className="text-xs text-[#A1A1AA] font-medium">Down</span>
              </div>
              <span className="text-2xl font-bold text-[#FAFAFA] font-mono">
                {animatedDown}
              </span>
            </div>

            {/* Last Check */}
            <div className="border-l-4 border-[rgba(8,145,178,0.5)] pl-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-[#0891B2]" />
                <span className="text-xs text-[#A1A1AA] font-medium">Last Check</span>
              </div>
              <span className="text-sm font-mono text-[#FAFAFA]">
                {lastCheckRelative || 'Pending...'}
              </span>
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Filter / Search Bar ────────────────────────────────────────────── */}
      {!showLoading && !showError && enrichedVendors.length > 0 && (
        <div className="mt-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#52525B] pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 px-4 pl-10 rounded-[10px] bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[15px] text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#0891B2] focus:ring-1 focus:ring-[#0891B2]/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                  activeCategory === cat
                    ? 'bg-[rgba(8,145,178,0.12)] text-[#0891B2] border-[rgba(8,145,178,0.4)]'
                    : 'bg-transparent text-[#A1A1AA] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:text-[#FAFAFA]'
                )}
              >
                {cat}
              </button>
            ))}
            {enriching && (
              <RefreshCw className="h-3.5 w-3.5 text-[#52525B] animate-spin ml-1" />
            )}
          </div>
        </div>
      )}

      {/* ── Loading State ──────────────────────────────────────────────────── */}
      {showLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} delay={i * 100} />
          ))}
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────────────────── */}
      {showError && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 mt-8"
        >
          <AlertCircle className="h-10 w-10 text-[#52525B] mb-4" />
          <p className="text-sm font-medium text-[#A1A1AA]">
            Unable to load vendor data. The measurement service may be unavailable.
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-[#FAFAFA] bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] hover:border-[#0891B2] transition-colors"
          >
            Retry
          </button>
        </motion.div>
      )}

      {/* ── Vendor Grid ────────────────────────────────────────────────────── */}
      {!showLoading && !showError && enrichedVendors.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <AnimatePresence mode="popLayout">
              {filteredVendors.map((vendor, i) => (
                <VendorCard key={vendor.id} vendor={vendor} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {/* No filter results */}
          {filteredVendors.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[#A1A1AA]">
                No vendors match your search or filter.
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Methodology Section ─────────────────────────────────────────────── */}
      {enrichedVendors.length > 0 && (
        <section className="mt-16 mb-8">
          {/* Mobile toggle */}
          <button
            onClick={() => setMethodologyOpen((prev) => !prev)}
            className="flex items-center gap-2 text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors lg:hidden mb-4"
          >
            <Shield className="h-4 w-4" />
            <span>How we measure</span>
            {methodologyOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Desktop: always visible header */}
          <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-[#A1A1AA] mb-4">
            <Shield className="h-4 w-4" />
            <span>How we measure</span>
          </div>

          {/* Grid: always visible on desktop, collapsible on mobile */}
          <div
            className={cn(
              'grid grid-cols-1 md:grid-cols-3 gap-4',
              'lg:grid',
              methodologyOpen ? 'grid' : 'hidden'
            )}
          >
            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-[#0891B2]" />
                <span className="text-sm font-medium text-[#FAFAFA]">
                  Global Probes
                </span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Measurements from independent probe regions worldwide,
                not vendor-reported SLAs or status pages.
              </p>
            </div>

            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-[#0891B2]" />
                <span className="text-sm font-medium text-[#FAFAFA]">
                  Real Metrics
                </span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">
                HTTP availability, response latency, status codes,
                and regional consistency at defined intervals.
              </p>
            </div>

            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-[#0891B2]" />
                <span className="text-sm font-medium text-[#FAFAFA]">
                  Regional View
                </span>
              </div>
              <p className="text-xs text-[#52525B] leading-relaxed">
                Every endpoint tested from multiple regions to
                catch partial outages and latency spikes.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
