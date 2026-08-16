"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { formatDistanceToNow } from "date-fns";
import {
  useDashboardSummary,
  useLatencyData,
  useSlaDegradation,
  useRecentChecks,
  useIncidents,
  useBillingPlan,
} from "@/hooks/useApi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { getPlanConfig } from "@/lib/tierLimits";
import {
  Users,
  Layers,
  AlertTriangle,
  ShieldCheck,
  FileText,
  RefreshCw,
  ChevronRight,
  Activity,
  Zap,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import {
  ConsoleCard,
  ConsoleCardBody,
  ConsoleCardHeader,
  StatusDot,
} from "@/components/dashboard/ConsoleLayout";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { EmptyState } from "@/components/dashboard/EmptyState";

// -- Constants --

const TIME_PILLS = [
  { label: "1h", hours: 1 },
  { label: "24h", hours: 24 },
  { label: "7d", hours: 168 },
  { label: "30d", hours: 720 },
] as const;

// -- Helpers --

function aggregateMedianLatency(
  data: { timestamp: string; region: string; latency_ms: number }[] | null | undefined
): { timestamp: string; latency_ms: number }[] {
  if (!data || data.length === 0) return [];

  const grouped = new Map<string, number[]>();
  for (const point of data) {
    const existing = grouped.get(point.timestamp);
    if (existing) {
      existing.push(point.latency_ms);
    } else {
      grouped.set(point.timestamp, [point.latency_ms]);
    }
  }

  return Array.from(grouped.entries())
    .map(([timestamp, latencies]) => {
      const sorted = [...latencies].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const median =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;
      return { timestamp, latency_ms: Math.round(median * 100) / 100 };
    })
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
}

// -- Sub-components --

function LatencyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-[#1C1C24] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 shadow-lg">
      <p className="text-[11px] text-[#A1A1AA]">
        {label
          ? new Date(label).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : ""}
      </p>
      <p className="text-sm font-mono font-semibold text-[#0891B2]">
        {payload[0].value.toFixed(1)} ms
      </p>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <ConsoleCard>
      <ConsoleCardBody>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-16 rounded mb-2" />
        <Skeleton className="h-3 w-32 rounded" />
      </ConsoleCardBody>
    </ConsoleCard>
  );
}

function SectionSkeleton() {
  return (
    <ConsoleCard>
      <ConsoleCardHeader>
        <Skeleton className="h-4 w-36 rounded" />
      </ConsoleCardHeader>
      <ConsoleCardBody>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
          <Skeleton className="h-12 w-full rounded" />
        </div>
      </ConsoleCardBody>
    </ConsoleCard>
  );
}

// -- Main component --

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedHours, setSelectedHours] = useState(24);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const summary = useDashboardSummary();
  const latency = useLatencyData(selectedHours);
  const slaDegradation = useSlaDegradation(30);
  const recentChecks = useRecentChecks(8);
  const incidents = useIncidents({ status: "open", limit: 5 });
  const billing = useBillingPlan();

  const planConfig = billing.data
    ? getPlanConfig(billing.data.plan)
    : null;

  const showUpgradeBanner =
    billing.data &&
    (billing.data.plan === "free" || billing.data.plan === "starter");

  const hasError =
    summary.isError ||
    latency.isError ||
    incidents.isError ||
    billing.isError;

  const chartData = aggregateMedianLatency(latency.data);

  function handleRefresh() {
    setIsRefreshing(true);
    queryClient
      .invalidateQueries({ queryKey: ["dashboard"] })
      .finally(() => {
        setTimeout(() => setIsRefreshing(false), 600);
      });
  }

  // -- KPI cards data --
  const kpis = [
    {
      label: "Dependencies",
      value: summary.data?.active_dependencies_count ?? 0,
      icon: Layers,
      color: "#0891B2",
      href: "/dashboard/dependencies",
    },
    {
      label: "Open Incidents",
      value: summary.data?.open_incidents_count ?? 0,
      icon: AlertTriangle,
      color: "#DC2626",
      href: "/dashboard/incidents",
    },
    {
      label: "Overall Uptime",
      value:
        summary.data?.overall_uptime_percentage != null
          ? `${summary.data.overall_uptime_percentage.toFixed(2)}%`
          : "0%",
      icon: ShieldCheck,
      color: "#16A34A",
      href: null,
    },
    {
      label: "Evidence Reports",
      value: summary.data?.alerts_today_count ?? 0,
      icon: FileText,
      color: "#8B5CF6",
      href: "/dashboard/evidence",
    },
    {
      label: "SLA Degradation",
      value:
        slaDegradation.data?.total_degradation_pct != null
          ? `${slaDegradation.data.total_degradation_pct.toFixed(2)}%`
          : "0%",
      icon: Activity,
      color:
        slaDegradation.data &&
        slaDegradation.data.total_degradation_pct > 0.5
          ? "#D97706"
          : "#16A34A",
      href: null,
    },
  ];

  const isLoadingKpis =
    summary.isLoading ||
    slaDegradation.isLoading;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* -- Header -- */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#FAFAFA]">
              Dashboard
            </h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Welcome back{user?.full_name ? `, ${user.full_name}` : ""}.
              Here is your infrastructure overview.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#131318] text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[rgba(255,255,255,0.15)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </button>
        </div>

        {/* -- Upgrade banner -- */}
        {showUpgradeBanner && billing.data && summary.data && (
          <UpgradeBanner
            plan={billing.data.plan}
            usage={summary.data.active_dependencies_count}
            limit={billing.data.max_dependencies}
            resource="dependencies"
          />
        )}

        {/* -- Error banner -- */}
        {hasError && (
          <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-gradient-to-r from-[rgba(220,38,38,0.12)] to-[rgba(220,38,38,0.04)] p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626] shrink-0" />
            <p className="text-sm text-[#FAFAFA]">
              Failed to load some dashboard data.{" "}
              <button
                onClick={handleRefresh}
                className="underline underline-offset-2 hover:text-[#DC2626] transition-colors"
              >
                Retry
              </button>
            </p>
          </div>
        )}

        {/* -- KPI cards grid -- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {isLoadingKpis
            ? Array.from({ length: 5 }).map((_, i) => <KpiCardSkeleton key={i} />)
            : kpis.map((kpi) => (
                <ConsoleCard key={kpi.label} hover>
                  <ConsoleCardBody>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#52525B]">
                        {kpi.label}
                      </span>
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${kpi.color}18` }}
                      >
                        <kpi.icon
                          className="w-4 h-4"
                          style={{ color: kpi.color }}
                        />
                      </div>
                    </div>
                    <p
                      className="font-mono text-2xl font-semibold"
                      style={{ color: kpi.color }}
                    >
                      {kpi.value}
                    </p>
                  </ConsoleCardBody>
                </ConsoleCard>
              ))}
        </div>

        {/* -- Active incidents -- */}
        <ConsoleCard>
          <ConsoleCardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <h2 className="text-sm font-semibold text-[#FAFAFA]">
                Active Incidents
              </h2>
              {incidents.data && incidents.data.length > 0 && (
                <span className="ml-2 bg-[rgba(220,38,38,0.15)] text-[#DC2626] text-[11px] font-medium px-2 py-0.5 rounded-full">
                  {incidents.data.length}
                </span>
              )}
            </div>
            <Link
              href="/dashboard/incidents"
              className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors inline-flex items-center gap-1"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </Link>
          </ConsoleCardHeader>

          {incidents.isLoading ? (
            <ConsoleCardBody>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded" />
                <Skeleton className="h-12 w-full rounded" />
                <Skeleton className="h-12 w-full rounded" />
              </div>
            </ConsoleCardBody>
          ) : !incidents.data || incidents.data.length === 0 ? (
            <ConsoleCardBody>
              <EmptyState
                icon={ShieldCheck}
                title="All systems operational"
                description="No active incidents detected. Your dependencies are running smoothly."
                variant="success"
              />
            </ConsoleCardBody>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.05)]">
              {incidents.data.map((incident) => (
                <Link
                  key={incident.id}
                  href={`/dashboard/incidents/${incident.id}`}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <StatusDot status={incident.status === "resolved" ? "operational" : "down"} pulse />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#FAFAFA] truncate">
                      {incident.description || "Untitled incident"}
                    </p>
                    <p className="text-[11px] text-[#52525B] mt-0.5">
                      <SeverityBadge severity={incident.severity} />
                      <span className="ml-2">
                        Started{" "}
                        {formatDistanceToNow(new Date(incident.started_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#52525B] shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </ConsoleCard>

        {/* -- Two-column layout: Chart + Sidebar -- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Latency chart (65%) */}
          <div className="lg:col-span-3">
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0891B2]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    Response Latency
                  </h2>
                </div>
                <div className="flex items-center gap-1">
                  {TIME_PILLS.map((pill) => (
                    <button
                      key={pill.label}
                      onClick={() => setSelectedHours(pill.hours)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                        selectedHours === pill.hours
                          ? "bg-[rgba(8,145,178,0.15)] text-[#0891B2]"
                          : "text-[#52525B] hover:text-[#A1A1AA]"
                      )}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </ConsoleCardHeader>
              <ConsoleCardBody>
                {latency.isLoading ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <Skeleton className="w-full h-full rounded" />
                  </div>
                ) : !chartData || chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-[220px]">
                    <p className="text-sm text-[#52525B]">
                      No latency data available for this time range.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData}>
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={(v) =>
                          new Date(v).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        }
                        stroke="#52525B"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#52525B" }}
                      />
                      <YAxis
                        stroke="#52525B"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: "#52525B" }}
                        width={40}
                      />
                      <Tooltip content={<LatencyTooltip />} />
                      <defs>
                        <linearGradient
                          id="latencyGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#0891B2"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0891B2"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="latency_ms"
                        stroke="#0891B2"
                        strokeWidth={2}
                        fill="url(#latencyGradient)"
                        isAnimationActive={false}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ConsoleCardBody>
            </ConsoleCard>
          </div>

          {/* Right: SLA card + Recent checks (35%) */}
          <div className="lg:col-span-2 space-y-6">
            {/* SLA degradation card */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  SLA (30 days)
                </h2>
              </ConsoleCardHeader>
              <ConsoleCardBody>
                {slaDegradation.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-12 w-full rounded" />
                  </div>
                ) : slaDegradation.data ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn(
                          "font-mono text-2xl font-semibold",
                          slaDegradation.data.total_degradation_pct > 0.5
                            ? "text-[#D97706]"
                            : "text-[#16A34A]"
                        )}
                      >
                        {slaDegradation.data.total_degradation_pct.toFixed(2)}%
                      </span>
                      <span className="text-xs text-[#52525B]">
                        degradation
                      </span>
                    </div>
                    {slaDegradation.data.affected_services > 0 && (
                      <div className="text-xs text-[#A1A1AA]">
                        <p className="text-[#52525B] font-medium uppercase tracking-wider text-[10px]">
                          Affected services
                        </p>
                        <div className="flex items-center gap-2 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                          {slaDegradation.data.affected_services} service{slaDegradation.data.affected_services !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#52525B]">
                    SLA data unavailable.
                  </p>
                )}
              </ConsoleCardBody>
            </ConsoleCard>

            {/* Recent checks */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0891B2]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    Recent Checks
                  </h2>
                </div>
                <Link
                  href="/dashboard/dependencies"
                  className="text-xs text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
                >
                  Details
                </Link>
              </ConsoleCardHeader>

              {recentChecks.isLoading ? (
                <ConsoleCardBody>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded" />
                    ))}
                  </div>
                </ConsoleCardBody>
              ) : !recentChecks.data || recentChecks.data.length === 0 ? (
                <ConsoleCardBody>
                  <p className="text-sm text-[#52525B] text-center py-4">
                    No recent checks.
                  </p>
                </ConsoleCardBody>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {recentChecks.data.map((check) => (
                    <div
                      key={check.id}
                      className="px-5 py-2.5 flex items-center gap-3"
                    >
                      <StatusDot
                        status={check.is_up ? "operational" : "down"}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#FAFAFA] truncate font-mono">
                          {check.region}
                        </p>
                        <p className="text-[10px] text-[#52525B]">
                          {check.status_code ?? "--"} |{" "}
                          {check.latency_ms != null
                            ? `${check.latency_ms.toFixed(0)}ms`
                            : "--"}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#52525B] shrink-0">
                        {formatDistanceToNow(new Date(check.executed_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ConsoleCard>
          </div>
        </div>

        {/* -- Quick actions bar -- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/dependencies/new">
            <ConsoleCard hover className="group">
              <ConsoleCardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(8,145,178,0.12)] flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-[#0891B2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#FAFAFA]">
                    Add Dependency
                  </p>
                  <p className="text-[11px] text-[#52525B]">
                    Monitor a new endpoint or service
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors" />
              </ConsoleCardBody>
            </ConsoleCard>
          </Link>

          <Link href="/dashboard/incidents">
            <ConsoleCard hover className="group">
              <ConsoleCardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(220,38,38,0.12)] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#FAFAFA]">
                    View Incidents
                  </p>
                  <p className="text-[11px] text-[#52525B]">
                    Review and manage active incidents
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors" />
              </ConsoleCardBody>
            </ConsoleCard>
          </Link>

          <Link href="/dashboard/evidence">
            <ConsoleCard hover className="group">
              <ConsoleCardBody className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.12)] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#FAFAFA]">
                    Generate Evidence
                  </p>
                  <p className="text-[11px] text-[#52525B]">
                    Create vendor accountability reports
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#FAFAFA] transition-colors" />
              </ConsoleCardBody>
            </ConsoleCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
