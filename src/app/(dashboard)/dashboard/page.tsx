"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Radio, ShieldCheck, TrendingUp } from "lucide-react";
import {
  useDashboardSummary,
  useDependencyHealth,
  useVendorStatus,
  useIncidents,
  useDependencies,
} from "@/hooks/useApi";
import type { DependencyHealth } from "@/services/dashboardService";
import type { Incident } from "@/services/incidentService";
import type { VendorDetailResponse } from "@/services/vendorService";
import {
  Card,
  StatusPill,
  StatusDot,
  Skeleton,
  EmptyState,
  SectionHeader,
  SectionLink,
  PageHeader,
  statusMeta,
  severityMeta,
  fmtUptime,
  fmtLatency,
  fmtRelative,
} from "@/components/rs/ui";
import { incidentRef } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

/* ── Data helpers ───────────────────────────────────────────────────────── */

function confidenceFromRootCause(rootCause: string | undefined | null): {
  label: string;
  color: string;
} {
  switch (rootCause) {
    case "vendor_failure":
      return { label: "HIGH", color: "#22C55E" };
    case "network_issue":
      return { label: "MEDIUM", color: "#F59E0B" };
    default:
      return { label: "LOW", color: "#6B7280" };
  }
}

/* ── Stat card ──────────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  valueColor,
  pulse,
  loading,
  delta,
}: {
  label: string;
  value: string;
  valueColor?: string;
  pulse?: boolean;
  loading?: boolean;
  delta?: { direction: "up" | "down" | "neutral"; text: string };
}) {
  return (
    <Card hover className="p-5">
      {loading ? (
        <>
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
        </>
      ) : (
        <>
          <div
            className="text-xs text-[#6B7280] uppercase mb-2"
            style={{ letterSpacing: "0.05em" }}
          >
            {label}
          </div>
          <div
            className={cn("text-[32px] font-bold leading-none", pulse && "rs-value-pulse")}
            style={{ fontFamily: "var(--font-geist-mono)", color: valueColor || "#F9FAFB" }}
          >
            {value}
          </div>
          {delta && (
            <div
              className="flex items-center gap-1 text-xs mt-2"
              style={{ color: delta.direction === "up" ? "#22C55E" : delta.direction === "down" ? "#EF4444" : "#6B7280" }}
            >
              {delta.direction !== "neutral" && <TrendingUp className="h-3 w-3" />}
              {delta.text}
            </div>
          )}
        </>
      )}
    </Card>
  );
}

/* ── Dependency health table ────────────────────────────────────────────── */

function HealthTable({ items }: { items: DependencyHealth[] }) {
  return (
    <div className="mt-4 bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hidden md:block">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
            <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
              Name
            </th>
            <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
              Status
            </th>
            <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
              Uptime (24h)
            </th>
            <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 100, letterSpacing: "0.05em" }}>
              Latency
            </th>
            <th className="text-right px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 140, letterSpacing: "0.05em" }}>
              Last check
            </th>
            <th className="text-right pr-4" style={{ width: 60 }} />
          </tr>
        </thead>
        <tbody>
          {items.map((dep, i) => (
            <tr
              key={dep.dependency_id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-[#1F2937]",
                i < items.length - 1 && "border-b border-[#1F2937]"
              )}
              style={{ height: 52 }}
              onClick={() => (window.location.href = `/dependencies/${dep.dependency_id}`)}
            >
              <td className="px-4">
                <div className="text-sm font-medium text-[#F9FAFB]">{dep.name}</div>
                <div
                  className="text-xs text-[#6B7280] truncate mt-0.5"
                  style={{ fontFamily: "var(--font-geist-mono)", maxWidth: 280 }}
                >
                  {dep.endpoint_url}
                </div>
              </td>
              <td>
                <StatusPill status={dep.current_status} />
              </td>
              <td className="text-right text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {fmtUptime(dep.uptime_percentage_24h)}
              </td>
              <td className="text-right text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {fmtLatency(dep.avg_latency_ms_24h)} <span className="text-[#6B7280]">ms</span>
              </td>
              <td className="text-right px-4 text-xs text-[#6B7280]">{fmtRelative(dep.last_check_at)}</td>
              <td className="text-right pr-4">
                <ChevronRight className="h-4 w-4 text-[#374151] inline-block" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HealthCards({ items }: { items: DependencyHealth[] }) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      {items.map((dep) => (
        <Link
          key={dep.dependency_id}
          href={`/dependencies/${dep.dependency_id}`}
          className="block bg-[#111827] border border-[#1F2937] rounded-xl p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#F9FAFB]">{dep.name}</div>
              <div className="text-xs text-[#6B7280] truncate mt-0.5" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {dep.endpoint_url}
              </div>
            </div>
            <StatusPill status={dep.current_status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                Uptime
              </div>
              <div className="text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {fmtUptime(dep.uptime_percentage_24h)}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                Latency
              </div>
              <div className="text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                {fmtLatency(dep.avg_latency_ms_24h)} <span className="text-[#6B7280]">ms</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ── Recent incidents ───────────────────────────────────────────────────── */

function RecentIncidents({
  incidents,
  deps,
}: {
  incidents: Incident[];
  deps: Record<string, string>;
}) {
  if (incidents.length === 0) {
    return (
      <Card>
        <EmptyState icon={ShieldCheck} title="No active incidents" body="Your dependencies are stable." />
      </Card>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {incidents.slice(0, 5).map((inc) => {
        const sev = severityMeta(inc.severity);
        const conf = confidenceFromRootCause(inc.root_cause);
        const vendorName = deps[inc.dependency_id] || "Unknown vendor";

        return (
          <Link
            key={inc.id}
            href={`/incidents/${inc.id}`}
            className="block bg-[#111827] border border-[#1F2937] rounded-xl px-5 py-4 transition-colors hover:border-[#374151]"
            style={{ borderLeft: `3px solid ${sev.color}` }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center min-w-0">
                <span className="text-xs mr-2 text-[#3B82F6]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {incidentRef(inc.id)}
                </span>
                <span className="text-sm font-medium text-[#F9FAFB] truncate">
                  {inc.description || `Incident ${inc.id}`}
                </span>
              </div>
              <span className="text-xs text-[#6B7280] shrink-0">{fmtRelative(inc.started_at)}</span>
            </div>
            <div className="mt-2 text-xs text-[#6B7280]">
              {vendorName} <span className="text-[#374151]">/</span> {inc.root_cause.replace(/_/g, " ")}{" "}
              <span className="text-[#374151]">·</span> Confidence{" "}
              <span style={{ color: conf.color }}>{conf.label}</span>{" "}
              <span className="text-[#374151]">·</span> Started{" "}
              {new Date(inc.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC
            </div>
          </Link>
        );
      })}
    </div>
  );
}

/* ── Vendor status feed ─────────────────────────────────────────────────── */

interface VendorRow {
  id: string;
  vendor: string;
  region: string;
  status: string;
  latency: number | null;
}

function flattenVendors(vendors: VendorDetailResponse[]): VendorRow[] {
  const rows: VendorRow[] = [];
  for (const v of vendors) {
    const name = v.display_name || v.vendor_name;
    if (v.endpoints && v.endpoints.length > 0) {
      for (const ep of v.endpoints) {
        const regions = ep.regions?.length ? ep.regions : ["global"];
        for (const region of regions) {
          rows.push({
            id: `${ep.id}-${region}`,
            vendor: name,
            region,
            status: ep.health_status,
            latency: (ep as unknown as { latency_ms?: number }).latency_ms ?? null,
          });
        }
      }
    } else {
      rows.push({ id: v.id, vendor: name, region: "global", status: v.recent_status, latency: null });
    }
  }
  return rows.slice(0, 6);
}

function VendorFeed({ vendors }: { vendors: VendorDetailResponse[] }) {
  const rows = flattenVendors(vendors);

  if (rows.length === 0) {
    return (
      <Card className="mt-4">
        <EmptyState icon={Radio} title="No vendor data" body="Live vendor observations will appear here." />
      </Card>
    );
  }

  return (
    <div className="mt-4 bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Desktop table */}
      <table className="w-full border-collapse hidden md:table">
        <thead>
          <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
            <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
              Vendor
            </th>
            <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
              Region
            </th>
            <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 160, letterSpacing: "0.05em" }}>
              Status
            </th>
            <th className="text-right px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
              Latency
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const m = statusMeta(row.status);
            return (
              <tr
                key={row.id}
                className={cn("hover:bg-[#1F2937] transition-colors", i < rows.length - 1 && "border-b border-[#1F2937]")}
                style={{ height: 52 }}
              >
                <td className="px-4 text-sm font-medium text-[#F9FAFB]">{row.vendor}</td>
                <td className="text-sm text-[#6B7280] capitalize">{row.region}</td>
                <td>
                  <span className="inline-flex items-center gap-2">
                    <StatusDot status={row.status} />
                    <span className="text-sm" style={{ color: m.text }}>
                      {m.label}
                    </span>
                  </span>
                </td>
                <td className="text-right px-4 text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {row.latency != null ? `${fmtLatency(row.latency)} ms` : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile horizontal scroll */}
      <div className="md:hidden overflow-x-auto rs-no-scrollbar snap-x snap-mandatory flex gap-3 p-3">
        {rows.map((row) => {
          const m = statusMeta(row.status);
          return (
            <div key={row.id} className="snap-start min-w-[200px] shrink-0 border border-[#1F2937] rounded-lg p-3">
              <div className="text-sm font-medium text-[#F9FAFB]">{row.vendor}</div>
              <div className="text-xs text-[#6B7280] capitalize mt-0.5">{row.region}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={row.status} />
                  <span className="text-xs" style={{ color: m.text }}>
                    {m.label}
                  </span>
                </span>
                <span className="text-xs text-[#9CA3AF]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                  {row.latency != null ? `${fmtLatency(row.latency)} ms` : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const summary = useDashboardSummary();
  const health = useDependencyHealth();
  const vendors = useVendorStatus();
  const incidents = useIncidents({ status: "open", limit: 5 });
  const { data: depsList } = useDependencies();

  const deps = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of depsList || []) map[d.id] = d.name;
    return map;
  }, [depsList]);

  const summaryData = summary.data;
  const healthItems = health.data || [];
  const vendorItems = vendors.data || [];
  const incidentItems = incidents.data || [];

  const uptime = summaryData?.overall_uptime_percentage ?? null;
  const uptimeColor =
    uptime == null ? undefined : uptime < 99 ? "#EF4444" : uptime < 99.9 ? "#F59E0B" : undefined;

  const openIncidents = summaryData?.open_incidents_count ?? 0;
  const alertsToday = summaryData?.alerts_today_count ?? 0;

  return (
    <div>
      {/* Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Monitor your external dependencies and incident correlation."
        right={
          <button
            onClick={() => router.push("/dependencies?new=1")}
            className="inline-flex items-center gap-2 bg-[#3B82F6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-[filter]"
          >
            <Plus className="h-4 w-4" />
            Add dependency
          </button>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Dependencies"
          value={String(summaryData?.active_dependencies_count ?? 0)}
          loading={summary.isLoading}
        />
        <StatCard
          label="Open Incidents"
          value={String(openIncidents)}
          loading={summary.isLoading}
          valueColor={openIncidents > 0 ? "#EF4444" : undefined}
          pulse={openIncidents > 0}
        />
        <StatCard
          label="Overall Uptime"
          value={uptime != null ? `${uptime.toFixed(2)}%` : "—"}
          loading={summary.isLoading}
          valueColor={uptimeColor}
        />
        <StatCard
          label="Alerts Today"
          value={String(alertsToday)}
          loading={summary.isLoading}
          valueColor={alertsToday === 0 ? "#6B7280" : undefined}
        />
      </div>

      {/* Dependency health */}
      <div className="mt-8">
        <SectionHeader
          title="Dependency health"
          subtitle="Real-time status from independent regional checks."
          right={<SectionLink href="/dependencies">View all →</SectionLink>}
        />

        {health.isLoading ? (
          <div className="mt-4 bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : healthItems.length === 0 ? (
          <Card className="mt-4">
            <EmptyState
              icon={Radio}
              title="No dependencies monitored"
              body="Add your first vendor to start tracking external health."
              actionLabel="Add dependency"
              actionHref="/dependencies?new=1"
            />
          </Card>
        ) : (
          <>
            <HealthTable items={healthItems} />
            <HealthCards items={healthItems} />
          </>
        )}
      </div>

      {/* Recent incidents */}
      <div className="mt-8">
        <SectionHeader title="Recent incidents" right={<SectionLink href="/incidents">View all →</SectionLink>} />

        {incidents.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/3" />
              </Card>
            ))}
          </div>
        ) : (
          <RecentIncidents incidents={incidentItems} deps={deps} />
        )}
      </div>

      {/* Vendor status feed */}
      <div className="mt-8">
        <SectionHeader
          title="Live vendor status"
          subtitle="Independent observations from our global monitoring network."
          right={<SectionLink href="/vendors">Explore all →</SectionLink>}
        />

        {vendors.isLoading ? (
          <div className="mt-4 bg-[#111827] border border-[#1F2937] rounded-xl p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <VendorFeed vendors={vendorItems} />
        )}
      </div>
    </div>
  );
}
