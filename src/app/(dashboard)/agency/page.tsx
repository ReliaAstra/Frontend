"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useClients, useDashboardSummary, useIncidents, useBillingPlan } from "@/hooks/useApi";
import { getPlanConfig, canAccessFeature } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Building2,
  Users,
  Layers,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Lock,
  RefreshCw,
  Plus,
  ChevronRight,
  BarChart3,
  Zap,
  Eye,
} from "lucide-react";
import {
  ConsoleCard,
  ConsoleCardBody,
  ConsoleCardHeader,
  StatusDot,
} from "@/components/dashboard/ConsoleLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";

/* ── Helpers ────────────────────────────────────────────────────────────────── */


function portfolioHealthLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Warning";
  return "Critical";
}

function deriveClientHealth(): { score: number; label: string; color: string } {
  // The live API returns client records without per-client incident/site counts,
  // so clients are always shown as active once created.
  return { score: 100, label: "Active", color: "#16A34A" };
}

/* ── Skeletons ─────────────────────────────────────────────────────────────── */

function KpiSkeleton() {
  return (
    <ConsoleCard>
      <ConsoleCardBody>
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-7 w-7 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-16 rounded" />
        <Skeleton className="h-3 w-28 rounded mt-2" />
      </ConsoleCardBody>
    </ConsoleCard>
  );
}

function ClientRowSkeleton() {
  return (
    <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-40 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export default function AgencyDashboardPage() {
  const { currentOrg, user } = useAuth();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const plan = (currentOrg?.plan || "free") as Plan;
  const planConfig = getPlanConfig(plan);
  const isAgency = plan === "agency";
  const canAccessClients = canAccessFeature(plan, "clients");

  // ── Data hooks ──
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary();
  const { data: clientsData, isLoading: clientsLoading } = useClients();
  const { data: incidentsData, isLoading: incidentsLoading } = useIncidents({ status: "open", limit: 50 });
  const { data: billingData } = useBillingPlan();

  // Normalize responses (live API returns plain arrays)
  const summary = summaryData;
  const clients = clientsData ?? [];
  const incidents = incidentsData ?? [];

  // Derived agency metrics (org-wide; per-client counters are not exposed by the API)
  const totalClients = clients.length;
  const totalDeps = summary?.active_dependencies_count ?? 0;
  const totalIncidents = incidents.length;
  const overallHealthPct =
    totalIncidents === 0 ? 100 : Math.max(0, 100 - Math.min(totalIncidents * 10, 100));

  // Sort clients alphabetically
  const sortedClients = [...clients].sort((a, b) => a.name.localeCompare(b.name));

  function handleRefresh() {
    setIsRefreshing(true);
    queryClient.invalidateQueries({ queryKey: ["dashboard"] }).finally(() => {
      queryClient.invalidateQueries({ queryKey: ["clients"] }).finally(() => {
        queryClient.invalidateQueries({ queryKey: ["incidents"] }).finally(() => {
          setTimeout(() => setIsRefreshing(false), 400);
        });
      });
    });
  }

  // ── Plan gate ──
  if (!canAccessClients.allowed) {
    return (
      <div className="min-h-screen bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <ConsoleCard>
            <ConsoleCardBody className="py-16 text-center">
              <Lock className="w-8 h-8 text-[#52525B] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-[#FAFAFA]">Agency Dashboard</h2>
              <p className="text-sm text-[#A1A1AA] mt-2 max-w-md mx-auto">
                Monitor all your clients and dependencies from a single view. Client
                management and the Agency Dashboard are available on the{" "}
                <span className="font-medium text-[#FAFAFA]">Agency</span> plan.
              </p>
              <Link
                href="/settings?tab=billing"
                className="mt-6 inline-flex items-center gap-2 bg-[#0891B2] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0E7490] transition-colors"
              >
                Upgrade to {getPlanConfig(canAccessClients.requiredPlan).name}
              </Link>
            </ConsoleCardBody>
          </ConsoleCard>
        </div>
      </div>
    );
  }

  // ── Agency-specific KPIs ──
  const kpis = [
    {
      label: "Total Clients",
      value: totalClients,
      icon: Users,
      color: "#0891B2",
      sub: totalClients > 0 ? `${totalClients} registered` : "No clients yet",
    },
    {
      label: "Dependencies",
      value: totalDeps,
      icon: Layers,
      color: "#16A34A",
      sub: "Active monitored checks",
    },
    {
      label: "Open Incidents",
      value: totalIncidents,
      icon: AlertTriangle,
      color: totalIncidents > 0 ? "#DC2626" : "#16A34A",
      sub: totalIncidents > 0 ? "Needs attention" : "All clear",
    },
    {
      label: "Alerts Today",
      value: summary?.alerts_today_count ?? 0,
      icon: Zap,
      color: "#8B5CF6",
      sub: "Across all channels",
    },
    {
      label: "Portfolio Health",
      value: `${overallHealthPct}%`,
      icon: ShieldCheck,
      color: overallHealthPct >= 90 ? "#16A34A" : overallHealthPct >= 70 ? "#D97706" : "#DC2626",
      sub: portfolioHealthLabel(overallHealthPct),
    },
  ];

  const loading = summaryLoading || clientsLoading || incidentsLoading;

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0891B2] to-[#8B5CF6] flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#FAFAFA] tracking-tight">
                Agency Dashboard
              </h1>
              <p className="text-[12px] text-[#A1A1AA] mt-0.5">
                Multi-client infrastructure overview
                {currentOrg && (
                  <span className="ml-2 font-mono text-[#52525B]">
                    {currentOrg.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Agency badge */}
            {isAgency && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(8,145,178,0.15)] to-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.2)] text-[11px] font-semibold text-[#8B5CF6]">
                <Zap className="w-3 h-3" />
                Agency Plan
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#131318] text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:border-[rgba(255,255,255,0.15)] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Refresh
            </button>
            <Link
              href="/clients"
              className="inline-flex items-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Client
            </Link>
          </div>
        </div>

        {/* ── Upgrade banner (non-agency) ───────────────────────────────── */}
        {!isAgency && billingData && (
          <UpgradeBanner
            plan={plan}
            usage={totalClients}
            limit={planConfig.limits.clients === Infinity ? 999 : planConfig.limits.clients}
            resource="clients"
          />
        )}

        {/* ── KPI Grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
            : kpis.map((kpi) => (
                <ConsoleCard key={kpi.label} hover>
                  <ConsoleCardBody>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#52525B]">
                        {kpi.label}
                      </span>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${kpi.color}15` }}
                      >
                        <kpi.icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
                      </div>
                    </div>
                    <p
                      className="font-mono text-2xl font-semibold leading-none"
                      style={{ color: kpi.color }}
                    >
                      {kpi.value}
                    </p>
                    <p className="text-[10px] text-[#52525B] mt-1.5">{kpi.sub}</p>
                  </ConsoleCardBody>
                </ConsoleCard>
              ))}
        </div>

        {/* ── Two-column layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Client Health Grid (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Health Overview */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0891B2]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    Client Health
                  </h2>
                  {clients.length > 0 && (
                    <span className="ml-2 bg-[rgba(8,145,178,0.15)] text-[#0891B2] text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {clients.length}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {/* Health legend */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      <span className="text-[#52525B]">Healthy</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
                      <span className="text-[#52525B]">Minor Issues</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      <span className="text-[#52525B]">At Risk</span>
                    </span>
                  </div>
                  <Link
                    href="/clients"
                    className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors inline-flex items-center gap-1"
                  >
                    View all
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </ConsoleCardHeader>

              {clientsLoading ? (
                <div className="py-2">
                  {Array.from({ length: 4 }).map((_, i) => <ClientRowSkeleton key={i} />)}
                </div>
              ) : clients.length === 0 ? (
                <ConsoleCardBody>
                  <EmptyState
                    icon={Users}
                    title="No clients yet"
                    description="Add your first client to start monitoring their infrastructure from this centralized view."
                    actionLabel="Add Client"
                    onAction={() => {
                      window.location.href = "/clients";
                    }}
                  />
                </ConsoleCardBody>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {sortedClients.map((client, idx: number) => {
                    const health = deriveClientHealth();
                    return (
                      <Link
                        key={client.id}
                        href={`/clients/${client.id}`}
                        className="px-5 py-4 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors group animate-row-in"
                        style={{ animationDelay: `${idx * 40}ms` }}
                      >
                        {/* Health indicator */}
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.06)]"
                          style={{ backgroundColor: `${health.color}12` }}
                        >
                          <span className="text-xs font-bold" style={{ color: health.color }}>
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Client info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                              {client.name}
                            </p>
                            <StatusDot status="operational" />
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[11px] text-[#52525B] truncate">
                              {client.description || "No description"}
                            </span>
                          </div>
                        </div>

                        {/* Added */}
                        <span className="text-[11px] text-[#52525B] font-mono shrink-0 hidden sm:block">
                          Added {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                        </span>

                        {/* Chevron */}
                        <ChevronRight className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </ConsoleCard>

            {/* Active Incidents Across All Clients */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                  <h2 className="text-sm font-semibold text-[#FAFAFA]">
                    Active Incidents
                  </h2>
                  {incidents.length > 0 && (
                    <span className="ml-2 bg-[rgba(220,38,38,0.15)] text-[#DC2626] text-[10px] font-medium px-2 py-0.5 rounded-full">
                      {incidents.length}
                    </span>
                  )}
                </div>
                <Link
                  href="/incidents"
                  className="text-[11px] text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors inline-flex items-center gap-1"
                >
                  View all
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </ConsoleCardHeader>

              {incidentsLoading ? (
                <div className="py-2 space-y-0">
                  {Array.from({ length: 3 }).map((_, i) => <ClientRowSkeleton key={i} />)}
                </div>
              ) : incidents.length === 0 ? (

                <ConsoleCardBody>
                  <div className="py-8 text-center">
                    <ShieldCheck className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                    <p className="text-sm text-[#FAFAFA] font-medium">All systems operational</p>
                    <p className="text-[11px] text-[#52525B] mt-1">No active incidents across any client.</p>
                  </div>
                </ConsoleCardBody>
              ) : (
                <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                  {incidents.slice(0, 8).map((incident, idx: number) => (
                    <Link
                      key={incident.id}
                      href={`/incidents/${incident.id}`}
                      className="px-5 py-3 flex items-center gap-4 hover:bg-[rgba(255,255,255,0.02)] transition-colors group animate-row-in"
                      style={{ animationDelay: `${idx * 40}ms` }}
                    >
                      <StatusDot
                        status={incident.status === "resolved" ? "operational" : "down"}
                        pulse
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#FAFAFA] truncate">
                          {incident.description || "Untitled incident"}
                        </p>
                        <p className="text-[10px] text-[#52525B] mt-0.5 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-[#A1A1AA] font-medium capitalize">
                            {incident.severity}
                          </span>
                          <span>
                            Started {formatDistanceToNow(new Date(incident.started_at), { addSuffix: true })}
                          </span>
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              )}
            </ConsoleCard>
          </div>

          {/* Right: Sidebar widgets (1/3) */}
          <div className="space-y-6">
            {/* Agency Plan Usage */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#8B5CF6]" />
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  Plan Usage
                </h2>
              </ConsoleCardHeader>
              <ConsoleCardBody className="space-y-4">
                {/* Clients */}
                <UsageBar
                  label="Clients"
                  current={totalClients}
                  max={planConfig.limits.clients === Infinity ? Math.max(totalClients + 5, 20) : planConfig.limits.clients}
                  color="#0891B2"
                  infinite={planConfig.limits.clients === Infinity}
                />
                {/* Dependencies */}
                <UsageBar
                  label="Dependencies"
                  current={summary?.active_dependencies_count ?? 0}
                  max={planConfig.limits.dependencies}
                  color="#16A34A"
                />
                {/* Evidence */}
                <UsageBar
                  label="Evidence Reports"
                  current={0}
                  max={planConfig.limits.evidence === Infinity ? 100 : planConfig.limits.evidence}
                  color="#D97706"
                  infinite={planConfig.limits.evidence === Infinity}
                />
                {/* Team Members */}
                <UsageBar
                  label="Team Members"
                  current={1}
                  max={planConfig.limits.team}
                  color="#EC4899"
                />
              </ConsoleCardBody>
            </ConsoleCard>

            {/* Quick Actions */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0891B2]" />
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  Quick Actions
                </h2>
              </ConsoleCardHeader>
              <div className="divide-y divide-[rgba(255,255,255,0.05)]">
                <QuickActionLink href="/clients" icon={Users} label="Manage Clients" desc="Add or edit client configurations" />
                <QuickActionLink href="/dependencies" icon={Layers} label="View Dependencies" desc="All monitored endpoints across clients" />
                <QuickActionLink href="/incidents" icon={AlertTriangle} label="Incident Center" desc="Active incidents and correlation data" />
                <QuickActionLink href="/evidence" icon={FileText} label="Evidence Reports" desc="SLA evidence and vendor reports" />
                <QuickActionLink href="/settings?tab=team" icon={Eye} label="Team Management" desc="Invite members and manage roles" />
                <QuickActionLink href="/settings?tab=billing" icon={ShieldCheck} label="Billing & Plan" desc="Manage subscription and plan limits" />
              </div>
            </ConsoleCard>

            {/* SLA Summary */}
            <ConsoleCard>
              <ConsoleCardHeader className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <h2 className="text-sm font-semibold text-[#FAFAFA]">
                  SLA Summary
                </h2>
              </ConsoleCardHeader>
              <ConsoleCardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Portfolio uptime (30d)</span>
                  <span className="font-mono text-sm font-semibold text-[#16A34A]">
                    {summary?.overall_uptime_percentage != null
                      ? `${summary.overall_uptime_percentage.toFixed(2)}%`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Registered clients</span>
                  <span className="font-mono text-sm font-semibold text-[#FAFAFA]">
                    {totalClients}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Open incidents</span>
                  <span className="font-mono text-sm font-semibold" style={{ color: totalIncidents > 0 ? "#DC2626" : "#16A34A" }}>
                    {totalIncidents}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Data retention</span>
                  <span className="font-mono text-sm font-semibold text-[#FAFAFA]">
                    {planConfig.limits.retentionDays}d
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Check interval</span>
                  <span className="font-mono text-sm font-semibold text-[#FAFAFA]">
                    {planConfig.limits.interval}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Regions</span>
                  <span className="font-mono text-sm font-semibold text-[#FAFAFA]">
                    {planConfig.limits.regions}
                  </span>
                </div>
              </ConsoleCardBody>
            </ConsoleCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function UsageBar({
  label,
  current,
  max,
  color,
  infinite = false,
}: {
  label: string;
  current: number;
  max: number;
  color: string;
  infinite?: boolean;
}) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] text-[#A1A1AA]">{label}</span>
        <span className="font-mono text-[11px] text-[#FAFAFA]">
          {current}
          {infinite ? "" : ` / ${max}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: infinite ? "30%" : `${pct}%`,
            backgroundColor: isCritical ? "#DC2626" : isWarning ? "#D97706" : color,
          }}
        />
      </div>
    </div>
  );
}

function QuickActionLink({
  href,
  icon: Icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="px-5 py-3 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-[rgba(255,255,255,0.04)] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#0891B2] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors">
          {label}
        </p>
        <p className="text-[10px] text-[#52525B] truncate">{desc}</p>
      </div>
      <ChevronRight className="w-3 h-3 text-[#52525B] group-hover:text-[#0891B2] shrink-0 transition-colors" />
    </Link>
  );
}
