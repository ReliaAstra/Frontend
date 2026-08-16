"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  dashboardService,
  type DashboardSummaryResponse,
  type CheckResultResponse,
  type SlaDegradationResponse,
} from "@/services/dashboardService";
import { incidentService, type Incident } from "@/services/incidentService";
import { clientService, type Client } from "@/services/clientService";
import { billingService } from "@/services/billingService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  Layers,
  AlertTriangle,
  ShieldCheck,
  FileText,
  RefreshCw,
  ChevronRight,
  ExternalLink,
  Activity,
  Zap,
  AlertCircle,
  Lock,
} from "lucide-react";
import { SeverityBadge } from "@/components/dashboard/SeverityBadge";
import {
  ConsoleCard,
  ConsoleCardBody,
  ConsoleCardHeader,
  StatusDot,
  MetricValue,
} from "@/components/dashboard/ConsoleLayout";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getPlanConfig } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";

/* ────────────────────────────── Skeletons ────────────────────────────── */

function KpiCardSkeleton() {
  return (
    <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-16 mb-1.5" />
      <Skeleton className="h-3 w-28" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <ConsoleCard>
      <ConsoleCardHeader>
        <Skeleton className="h-4 w-36" />
      </ConsoleCardHeader>
      <ConsoleCardBody>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </ConsoleCardBody>
    </ConsoleCard>
  );
}

/* ────────────────────────── Incident Table Grid ────────────────────────── */

const INCIDENT_GRID_COLS = "grid-cols-[80px_1fr_120px_120px_40px]";

/* ════════════════════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const { currentOrg, isLoading: authLoading } = useAuth();

  /* ── State ──────────────────────────────────────────────────────────────── */
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [recentChecks, setRecentChecks] = useState<CheckResultResponse[]>([]);
  const [slaDegradation, setSlaDegradation] = useState<SlaDegradationResponse>({
    total_degradation_pct: 0,
    affected_services: 0,
    period: "30d",
  });
  const [plan, setPlan] = useState<Plan>("free");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /* ── Derived ────────────────────────────────────────────────────────────── */
  const isAgency = currentOrg?.has_agency_mode === true;
  const isFreePlan = plan === "free";
  const planConfig = getPlanConfig(plan);
  const depLimit = planConfig.limits.dependencies;
  const atDepLimit =
    summary != null &&
    isFinite(depLimit) &&
    summary.active_dependencies_count >= depLimit;
  const evidenceCount = incidents.filter(
    (i) => i.evidence_report_id !== null
  ).length;

  const slaColor =
    slaDegradation.total_degradation_pct <= 0.1
      ? "#16A34A"
      : slaDegradation.total_degradation_pct <= 1
        ? "#D97706"
        : "#DC2626";

  /* ── Data fetching ────────────────────────────────────────────────────── */
  const fetchDashboard = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        // Core fetches — failure triggers the error banner
        const [summaryData, incidentsData] = await Promise.all([
          dashboardService.getSummary(),
          incidentService.list("open"),
        ]);
        setSummary(summaryData);
        setIncidents(incidentsData);
        setLastUpdated(new Date());

        // Non-critical fetches — degrade gracefully
        try {
          const clientRes = await clientService.list({ per_page: 5 });
          setClients(
            Array.isArray(clientRes)
              ? clientRes
              : clientRes?.items ?? []
          );
        } catch {
          setClients([]);
        }

        try {
          const planRes = await billingService.getPlan();
          setPlan(planRes.plan);
        } catch {
          setPlan("free");
        }

        try {
          const checks = await dashboardService.getRecentChecks(5);
          setRecentChecks(checks);
        } catch {
          setRecentChecks([]);
        }

        try {
          const sla = await dashboardService.getSlaDegradation(30);
          setSlaDegradation(sla);
        } catch {
          setSlaDegradation({
            total_degradation_pct: 0,
            affected_services: 0,
            period: "30d",
          });
        }
      } catch {
        setError(
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [authLoading, fetchDashboard]);

  /* ── Auth loading shell ────────────────────────────────────────────────── */
  if (authLoading) {
    return (
      <div className="space-y-6 animate-[fadeIn_200ms_ease-out]">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>

        {/* KPI skeletons */}
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            isAgency ? "lg:grid-cols-5" : "lg:grid-cols-4"
          )}
        >
          {Array.from({ length: isAgency ? 5 : 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>

        {/* Two-column skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
          <SectionSkeleton />
          <div className="space-y-4">
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-6 animate-[fadeIn_200ms_ease-out]">
      {/* ────────────────────────── Header ─────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#FAFAFA]">
            Operations overview
          </h1>
          <p className="text-sm text-[#52525B] mt-1">
            {currentOrg?.name || "Organization"}&nbsp;·&nbsp;Last updated{" "}
            {lastUpdated
              ? formatDistanceToNow(lastUpdated, { addSuffix: true })
              : "just now"}
          </p>
        </div>
        <button
          onClick={() => fetchDashboard(true)}
          disabled={refreshing || loading}
          className="p-2.5 rounded-lg bg-[#131318] border border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[rgba(255,255,255,0.15)] transition-all disabled:opacity-50"
          aria-label="Refresh dashboard"
        >
          <RefreshCw
            className={cn("w-4 h-4", refreshing && "animate-spin")}
          />
        </button>
      </div>

      {/* ────────────────────── Upgrade Banner ────────────────────────── */}
      {(plan === "free" || plan === "starter") && summary && (
        <UpgradeBanner
          plan={plan}
          usage={summary.active_dependencies_count}
          limit={depLimit}
          resource="dependencies"
        />
      )}

      {/* ────────────────────── Error Banner ───────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.06)] px-5 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#FAFAFA]">{error}</p>
            <p className="text-xs text-[#A1A1AA] mt-0.5">
              Check that the backend is accessible and your session is valid.
            </p>
          </div>
          <button
            onClick={() => fetchDashboard()}
            className="text-xs font-semibold text-[#DC2626] hover:text-[#FAFAFA] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* ────────────────── Global Stats Row ──────────────────────────── */}
      {loading ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            isAgency ? "lg:grid-cols-5" : "lg:grid-cols-4"
          )}
        >
          {Array.from({ length: isAgency ? 5 : 4 }).map((_, i) => (
            <KpiCardSkeleton key={i} />
          ))}
        </div>
      ) : summary ? (
        <div
          className={cn(
            "grid grid-cols-2 gap-4",
            isAgency ? "lg:grid-cols-5" : "lg:grid-cols-4"
          )}
        >
          {/* ── Clients (agency only) ──────────────────────────────────── */}
          {isAgency && (
            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#52525B]" />
                <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                  Clients
                </span>
              </div>
              <MetricValue value={clients.length} className="mt-2" />
              <p className="text-xs text-[#52525B] mt-1">
                {clients.length} managed
              </p>
            </div>
          )}

          {/* ── Dependencies ──────────────────────────────────────────── */}
          <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#52525B]" />
              <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                Dependencies
              </span>
              {atDepLimit && (
                <span className="text-[10px] font-semibold text-[#DC2626] bg-[rgba(220,38,38,0.12)] px-2 py-0.5 rounded-full">
                  At limit
                </span>
              )}
            </div>
            <MetricValue
              value={summary.active_dependencies_count}
              className="mt-2"
              color={atDepLimit ? "#DC2626" : undefined}
            />
            <p className="text-xs text-[#52525B] mt-1">
              of {depLimit === Infinity ? "\u221E" : depLimit} allowed
            </p>
          </div>

          {/* ── Open Incidents ────────────────────────────────────────── */}
          <div
            className={cn(
              "bg-[#131318] rounded-xl border p-5 transition-colors",
              summary.open_incidents_count > 0
                ? "border-[rgba(220,38,38,0.2)]"
                : "border-[rgba(255,255,255,0.08)]"
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={cn(
                  "w-4 h-4",
                  summary.open_incidents_count > 0
                    ? "text-[#DC2626] animate-pulse"
                    : "text-[#52525B]"
                )}
              />
              <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                Open Incidents
              </span>
            </div>
            <MetricValue
              value={summary.open_incidents_count}
              className="mt-2"
            />
            <p className="text-xs text-[#52525B] mt-1">
              {summary.open_incidents_count > 0
                ? "requiring attention"
                : "all clear"}
            </p>
          </div>

          {/* ── Evidence ───────────────────────────────────────────────── */}
          {isFreePlan ? (
            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#52525B]" />
                <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                  Evidence
                </span>
                <Lock className="w-3 h-3 text-[#52525B]" />
              </div>
              <MetricValue value="\u2014" className="mt-2" />
              <p className="text-xs text-[#52525B] mt-1">
                Upgrade to generate
              </p>
            </div>
          ) : (
            <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#52525B]" />
                <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                  Evidence
                </span>
              </div>
              <MetricValue value={evidenceCount} className="mt-2" />
              <p className="text-xs text-[#52525B] mt-1">reports generated</p>
            </div>
          )}

          {/* ── SLA ───────────────────────────────────────────────────── */}
          <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#52525B]" />
              <span className="text-[11px] uppercase tracking-wider text-[#52525B]">
                SLA
              </span>
            </div>
            <MetricValue
              value={`${slaDegradation.total_degradation_pct.toFixed(2)}%`}
              className="mt-2"
              color={slaColor}
            />
            <p className="text-xs text-[#52525B] mt-1">degradation (30d)</p>
          </div>
        </div>
      ) : null}

      {/* ────────────────── Active Incidents ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#FAFAFA]">
            Active incidents
          </h2>
          <Link
            href="/incidents"
            className="text-sm text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ConsoleCard>
            <ConsoleCardBody>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        ) : incidents.length > 0 ? (
          <ConsoleCard>
            {/* Table header */}
            <div
              className={cn(
                "px-5 py-3 grid gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)]",
                INCIDENT_GRID_COLS
              )}
            >
              <span>Severity</span>
              <span>Title</span>
              <span>Dependency</span>
              <span>Opened</span>
              <span />
            </div>

            {/* Rows */}
            {incidents.slice(0, 5).map((inc, index) => (
              <div
                key={inc.id}
                className="px-5 py-3.5 grid gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center group"
                style={{
                  gridTemplateColumns: "80px 1fr 120px 120px 40px",
                  animationDelay: `${index * 60}ms`,
                }}
              >
                <SeverityBadge severity={inc.severity} />
                <Link
                  href={`/incidents/${inc.id}`}
                  className="text-sm font-medium text-[#FAFAFA] hover:text-[#67E8F9] transition-colors truncate block"
                >
                  {inc.description || `Incident ${inc.id.slice(0, 8)}`}
                </Link>
                <span className="font-mono text-xs text-[#A1A1AA] truncate">
                  {inc.dependency_id.slice(0, 12)}
                </span>
                <span className="text-xs text-[#52525B]">
                  {formatDistanceToNow(new Date(inc.started_at), {
                    addSuffix: true,
                  })}
                </span>
                <Link
                  href={`/incidents/${inc.id}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#52525B] hover:text-[#FAFAFA]" />
                </Link>
              </div>
            ))}

            {/* "View all" footer */}
            {incidents.length > 5 && (
              <div className="px-5 py-3 border-t border-[rgba(255,255,255,0.05)]">
                <Link
                  href="/incidents"
                  className="text-xs font-medium text-[#0891B2] hover:text-[#67E8F9] transition-colors flex items-center gap-1"
                >
                  View all {incidents.length} incidents
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </ConsoleCard>
        ) : (
          <EmptyState
            icon={ShieldCheck}
            title="All systems operational"
            description={
              "No active incidents. Last check: " +
              (lastUpdated
                ? formatDistanceToNow(lastUpdated, { addSuffix: true })
                : "just now") +
              "."
            }
            variant="success"
          />
        )}
      </div>

      {/* ────────────────── Two-Column Layout (65/35) ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        {/* ── Left: Latency Overview ─────────────────────────────────── */}
        {loading ? (
          <ConsoleCard>
            <ConsoleCardHeader>
              <Skeleton className="h-4 w-32" />
            </ConsoleCardHeader>
            <ConsoleCardBody>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Skeleton className="h-16 w-16 rounded-xl" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        ) : (
          <ConsoleCard>
            <ConsoleCardHeader>
              <span className="text-sm font-semibold text-[#FAFAFA]">
                Latency Overview
              </span>
            </ConsoleCardHeader>
            <ConsoleCardBody>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center">
                  <Activity
                    className="w-8 h-8 text-[#52525B]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm text-[#A1A1AA] text-center max-w-sm">
                  Latency data will appear once checks begin
                </p>
                {summary && summary.active_dependencies_count === 0 && (
                  <Link
                    href="/dependencies"
                    className="inline-flex items-center bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-lg transition-all mt-2"
                  >
                    Add your first dependency
                  </Link>
                )}
              </div>
            </ConsoleCardBody>
          </ConsoleCard>
        )}

        {/* ── Right Column ───────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* SLA Card */}
          {loading ? (
            <ConsoleCard>
              <ConsoleCardBody>
                <div className="flex flex-col items-center py-6 space-y-3">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </ConsoleCardBody>
            </ConsoleCard>
          ) : (
            <ConsoleCard>
              <ConsoleCardBody className="flex flex-col items-center text-center py-8">
                <ShieldCheck
                  className="w-8 h-8 text-[#52525B] mb-3"
                  strokeWidth={1.5}
                />
                <span
                  className="font-mono text-3xl font-semibold"
                  style={{ color: slaColor }}
                >
                  {slaDegradation.total_degradation_pct.toFixed(2)}%
                </span>
                <span className="text-xs text-[#52525B] mt-2 uppercase tracking-wider">
                  30-day degradation
                </span>
                {slaDegradation.affected_services > 0 && (
                  <span className="text-xs text-[#A1A1AA] mt-1">
                    {slaDegradation.affected_services} service
                    {slaDegradation.affected_services !== 1 && "s"} affected
                  </span>
                )}
              </ConsoleCardBody>
            </ConsoleCard>
          )}

          {/* Recent Checks Card */}
          {loading ? (
            <ConsoleCard>
              <ConsoleCardHeader>
                <Skeleton className="h-4 w-28" />
              </ConsoleCardHeader>
              <ConsoleCardBody>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </ConsoleCardBody>
            </ConsoleCard>
          ) : (
            <ConsoleCard>
              <ConsoleCardHeader>
                <span className="text-sm font-semibold text-[#FAFAFA]">
                  Recent checks
                </span>
              </ConsoleCardHeader>
              <ConsoleCardBody>
                {recentChecks.length > 0 ? (
                  <div className="space-y-0">
                    {recentChecks.map((check) => (
                      <div
                        key={check.id}
                        className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-b-0"
                      >
                        <StatusDot
                          status={check.is_up ? "operational" : "down"}
                          pulse={!check.is_up}
                        />
                        <span className="text-sm text-[#FAFAFA] flex-1 truncate font-mono text-xs">
                          {check.dependency_id.slice(0, 12)}
                        </span>
                        <span className="font-mono text-xs text-[#A1A1AA]">
                          {check.latency_ms}ms
                        </span>
                        <span className="text-xs text-[#52525B] shrink-0">
                          {formatDistanceToNow(
                            new Date(check.executed_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#52525B] text-center py-8">
                    No checks recorded yet
                  </p>
                )}
              </ConsoleCardBody>
            </ConsoleCard>
          )}
        </div>
      </div>

      {/* ────────────────────── Quick Actions Bar ────────────────────── */}
      <div className="flex gap-3 mt-8">
        <Link
          href="/dependencies"
          className="inline-flex items-center bg-[#FAFAFA] text-[#0A0A0F] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-white hover:shadow-lg transition-all"
        >
          Add dependency
        </Link>
        <Link
          href="/incidents"
          className="inline-flex items-center bg-[#131318] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[rgba(255,255,255,0.15)] transition-all"
        >
          View incidents
        </Link>

        {isFreePlan ? (
          <div className="relative group">
            <button
              disabled
              className="inline-flex items-center bg-[rgba(8,145,178,0.3)] text-[rgba(255,255,255,0.4)] px-5 py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed"
            >
              Generate report
              <Lock className="w-3.5 h-3.5 ml-2" />
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#1A1A22] border border-[rgba(255,255,255,0.1)] rounded-lg text-xs text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-10">
              Upgrade to Starter to generate reports
            </div>
          </div>
        ) : (
          <Link
            href="/evidence"
            className="inline-flex items-center bg-[#0891B2] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0E7490] transition-all"
          >
            Generate report
          </Link>
        )}
      </div>
    </div>
  );
}
