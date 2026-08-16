"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  dependencyService,
  type Dependency,
  type DependencyHistory,
} from "@/services/dependencyService";
import { billingService } from "@/services/billingService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Layers,
  Plus,
  MoreVertical,
  Pause,
  Play,
  Trash2,
  Edit3,
  X,
} from "lucide-react";
import { StatusDot } from "@/components/dashboard/ConsoleLayout";
import { ConsoleCard } from "@/components/dashboard/ConsoleLayout";
import { UpgradeBanner } from "@/components/dashboard/UpgradeBanner";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getPlanConfig } from "@/lib/tierLimits";
import type { Plan } from "@/services/billingService";

// ── Constants ────────────────────────────────────────────────────────────────

const CHECK_INTERVAL_OPTIONS = [
  { value: 15, label: "15s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
  { value: 300, label: "5m" },
  { value: 600, label: "10m" },
];

const REGION_OPTIONS = [
  { value: "us-east", label: "US East" },
  { value: "us-west", label: "US West" },
  { value: "eu-west", label: "EU West" },
  { value: "apac-south", label: "APAC South" },
];

type StatusBadgeType = "operational" | "degraded" | "down" | "unknown";

function deriveStatus(dep: Dependency): StatusBadgeType {
  if (!dep.is_active) return "unknown";
  // If no recent check info, treat as unknown. In a real app you'd check last check result.
  return "operational";
}

const STATUS_CONFIG: Record<
  StatusBadgeType,
  { label: string; color: string; bg: string }
> = {
  operational: {
    label: "Operational",
    color: "#16A34A",
    bg: "rgba(22,163,74,0.12)",
  },
  degraded: {
    label: "Degraded",
    color: "#D97706",
    bg: "rgba(217,119,6,0.12)",
  },
  down: {
    label: "Down",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.12)",
  },
  unknown: {
    label: "Unknown",
    color: "#52525B",
    bg: "rgba(82,82,91,0.12)",
  },
};

function uptimeColor(pct: number | null): string {
  if (pct === null) return "#52525B";
  if (pct >= 99) return "#16A34A";
  if (pct >= 95) return "#D97706";
  return "#DC2626";
}

function formatUptime(pct: number | null): string {
  if (pct === null) return "—";
  return pct.toFixed(2) + "%";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DependenciesPage() {
  const { user } = useAuth();

  // Data
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, DependencyHistory>>({});
  const [plan, setPlan] = useState<Plan>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEndpoint, setFormEndpoint] = useState("");
  const [formExpectedStatus, setFormExpectedStatus] = useState(200);
  const [formInterval, setFormInterval] = useState(60);
  const [formRegions, setFormRegions] = useState<string[]>(["us-east"]);
  const [formEndpointError, setFormEndpointError] = useState("");
  const [creating, setCreating] = useState(false);

  // Actions
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const planConfig = getPlanConfig(plan);
  const depLimit = planConfig.limits.dependencies;
  const maxRegions = planConfig.limits.regions;
  const minInterval = planConfig.limits.interval;
  const atLimit = dependencies.length >= depLimit;
  const isFreeOrStarter = plan === "free" || plan === "starter";

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [deps, billing] = await Promise.all([
        dependencyService.list(),
        billingService.getPlan(),
      ]);
      setDependencies(deps);
      setPlan(billing.plan);
    } catch {
      setError("Unable to load dependencies. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (id: string) => {
    try {
      const history = await dependencyService.getHistory(id);
      setHistoryMap((prev) => ({ ...prev, [id]: history }));
    } catch {
      // Silently ignore history fetch failures
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch history for all deps once they load
  useEffect(() => {
    dependencies.forEach((dep) => {
      if (!historyMap[dep.id]) {
        fetchHistory(dep.id);
      }
    });
  }, [dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openModal = () => {
    setFormName("");
    setFormEndpoint("");
    setFormExpectedStatus(200);
    setFormInterval(60);
    setFormRegions(["us-east"]);
    setFormEndpointError("");
    setModalOpen(true);
  };

  const handleCreate = async () => {
    // Validate HTTPS
    if (
      !formEndpoint.startsWith("https://") &&
      !formEndpoint.startsWith("http://")
    ) {
      setFormEndpointError("Endpoint must be a valid URL (https:// or http://)");
      return;
    }
    if (!formName.trim() || !formEndpoint.trim()) {
      setFormEndpointError("Name and endpoint URL are required.");
      return;
    }
    setFormEndpointError("");
    setCreating(true);
    try {
      await dependencyService.create({
        name: formName.trim(),
        endpoint_url: formEndpoint.trim(),
        expected_status_codes: [formExpectedStatus],
        check_interval_seconds: formInterval,
        regions: formRegions,
      });
      setModalOpen(false);
      fetchData();
    } catch {
      setFormEndpointError("Failed to create dependency. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (dep: Dependency) => {
    setActiveMenuId(null);
    setTogglingId(dep.id);
    try {
      await dependencyService.update(dep.id, { is_active: !dep.is_active });
      setDependencies((prev) =>
        prev.map((d) =>
          d.id === dep.id ? { ...d, is_active: !dep.is_active } : d
        )
      );
    } catch {
      // Silently ignore
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setActiveMenuId(null);
    setDeletingId(id);
    try {
      await dependencyService.delete(id);
      setDependencies((prev) => prev.filter((d) => d.id !== id));
      setHistoryMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch {
      // Silently ignore
    } finally {
      setDeletingId(null);
    }
  };

  const toggleRegion = (region: string) => {
    setFormRegions((prev) => {
      if (prev.includes(region)) {
        if (prev.length > 1) return prev.filter((r) => r !== region);
        return prev;
      }
      if (plan === "free" && prev.length >= 1) return prev;
      if (plan === "starter" && prev.length >= 2) return prev;
      return [...prev, region];
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#FAFAFA]">Dependencies</h1>
            <p className="text-sm text-[#52525B] mt-1">
              Monitor and manage your external service endpoints
            </p>
          </div>
          <button
            onClick={openModal}
            className="bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white transition-colors inline-flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add dependency
          </button>
        </div>

        {/* Upgrade Banner */}
        {isFreeOrStarter && (
          <UpgradeBanner
            plan={plan}
            usage={dependencies.length}
            limit={depLimit}
            resource="dependencies"
            onUpgrade={() => {}}
          />
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-[rgba(220,38,38,0.2)] bg-[rgba(220,38,38,0.08)] px-5 py-4 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
            <p className="text-sm text-[#FAFAFA]">{error}</p>
            <button
              onClick={fetchData}
              className="text-xs font-medium text-[#0891B2] ml-auto shrink-0 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <ConsoleCard>
            <div className="px-5 py-3 grid grid-cols-[1.5fr,1fr,auto,auto,auto,auto] gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-3 w-12 rounded bg-[rgba(255,255,255,0.06)]"
                />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="px-5 py-4 grid grid-cols-[1.5fr,1fr,auto,auto,auto,auto] gap-4 border-t border-[rgba(255,255,255,0.05)]"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-4 w-full rounded bg-[rgba(255,255,255,0.06)]"
                  />
                ))}
              </div>
            ))}
          </ConsoleCard>
        )}

        {/* Empty State */}
        {!loading && dependencies.length === 0 && !error && (
          <EmptyState
            icon={Layers}
            title="No dependencies configured"
            description="Add a dependency to start monitoring its uptime and reliability. Track response times, get alerted on outages, and correlate incidents automatically."
            actionLabel="Add dependency"
            onAction={openModal}
          />
        )}

        {/* Dependencies Table */}
        {!loading && dependencies.length > 0 && (
          <ConsoleCard className="overflow-hidden">
            {/* Table Header */}
            <div className="px-5 py-3 grid grid-cols-[1.5fr,1fr,auto,auto,auto,auto] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
              <div>Name</div>
              <div>Endpoint</div>
              <div>Status</div>
              <div>Uptime</div>
              <div>Last check</div>
              <div className="w-8" />
            </div>

            {/* Rows */}
            {dependencies.map((dep, idx) => {
              const status = deriveStatus(dep);
              const statusCfg = STATUS_CONFIG[status];
              const history = historyMap[dep.id] || null;
              const uptime = history ? history.uptime_percentage : null;

              return (
                <div
                  key={dep.id}
                  className="px-5 py-3.5 grid grid-cols-[1.5fr,1fr,auto,auto,auto,auto] gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center"
                >
                  {/* Name */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#FAFAFA] truncate">
                      {dep.name}
                    </div>
                    <div className="text-xs text-[#52525B] font-mono truncate mt-0.5">
                      {dep.regions.length > 0
                        ? dep.regions.join(", ")
                        : "—"}
                    </div>
                  </div>

                  {/* Endpoint */}
                  <div className="min-w-0">
                    <div className="text-xs text-[#A1A1AA] font-mono truncate">
                      {dep.endpoint_url}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <StatusDot status={status} pulse={status === "down"} />
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{
                        color: statusCfg.color,
                        backgroundColor: statusCfg.bg,
                      }}
                    >
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Uptime */}
                  <div
                    className="font-mono text-sm"
                    style={{ color: uptimeColor(uptime) }}
                  >
                    {formatUptime(uptime)}
                  </div>

                  {/* Last check */}
                  <div className="text-xs text-[#52525B] font-mono whitespace-nowrap">
                    {dep.updated_at
                      ? formatDistanceToNow(new Date(dep.updated_at), {
                          addSuffix: true,
                        })
                      : "—"}
                  </div>

                  {/* Actions */}
                  <div className="relative w-8 flex justify-center" ref={idx === dependencies.findIndex(d => d.id === activeMenuId) ? menuRef : undefined}>
                    <button
                      onClick={() =>
                        setActiveMenuId(
                          activeMenuId === dep.id ? null : dep.id
                        )
                      }
                      className="p-1 rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#52525B] hover:text-[#A1A1AA]"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Dropdown */}
                    {activeMenuId === dep.id && (
                      <div className="absolute right-0 top-full mt-1 z-20 bg-[#1A1A20] border border-[rgba(255,255,255,0.08)] rounded-lg shadow-console-dropdown py-1 min-w-[160px]">
                        <button
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                          onClick={() => setActiveMenuId(null)}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.06)] transition-colors",
                            togglingId === dep.id && "opacity-50 pointer-events-none"
                          )}
                          onClick={() => handleToggle(dep)}
                        >
                          {dep.is_active ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Resume
                            </>
                          )}
                        </button>
                        <div className="my-1 border-t border-[rgba(255,255,255,0.06)]" />
                        <button
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#DC2626] hover:bg-[rgba(220,38,38,0.08)] transition-colors",
                            deletingId === dep.id && "opacity-50 pointer-events-none"
                          )}
                          onClick={() => handleDelete(dep.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </ConsoleCard>
        )}
      </div>

      {/* ── Add Dependency Modal ──────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-[#1A1A20] rounded-2xl border border-[rgba(255,255,255,0.08)] max-w-lg w-full p-6 animate-[fadeIn_200ms_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#FAFAFA]">
                Add dependency
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#52525B] hover:text-[#A1A1AA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">
                  Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Stripe API"
                  className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors"
                />
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={formEndpoint}
                  onChange={(e) => {
                    setFormEndpoint(e.target.value);
                    setFormEndpointError("");
                  }}
                  placeholder="https://api.stripe.com/v1/charges"
                  className={cn(
                    "w-full bg-[#1C1C22] border text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors font-mono",
                    formEndpointError
                      ? "border-[rgba(220,38,38,0.5)]"
                      : "border-[rgba(255,255,255,0.08)]"
                  )}
                />
                {formEndpointError && (
                  <p className="text-xs text-[#DC2626] mt-1.5">
                    {formEndpointError}
                  </p>
                )}
              </div>

              {/* Expected status + Check interval */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">
                    Expected status
                  </label>
                  <input
                    type="number"
                    value={formExpectedStatus}
                    onChange={(e) =>
                      setFormExpectedStatus(Number(e.target.value))
                    }
                    className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">
                    Check interval
                  </label>
                  <select
                    value={formInterval}
                    onChange={(e) => setFormInterval(Number(e.target.value))}
                    className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors appearance-none cursor-pointer"
                  >
                    {CHECK_INTERVAL_OPTIONS.map((opt) => {
                      const disabled = opt.value < minInterval;
                      return (
                        <option
                          key={opt.value}
                          value={opt.value}
                          disabled={disabled}
                          className={disabled ? "opacity-40" : ""}
                        >
                          {opt.label}
                          {disabled && " (upgrade)"}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Regions */}
              <div>
                <label className="text-sm font-medium text-[#A1A1AA] mb-2 block">
                  Regions
                  {(plan === "free" || plan === "starter") && (
                    <span className="text-[#52525B] ml-1.5 font-normal">
                      (max {maxRegions} on {planConfig.name})
                    </span>
                  )}
                </label>
                <div className="flex flex-wrap gap-2">
                  {REGION_OPTIONS.map((region) => {
                    const isSelected = formRegions.includes(region.value);
                    const canSelect =
                      !isSelected &&
                      plan === "free" &&
                      formRegions.length >= 1;
                    const canSelectStarter =
                      !isSelected &&
                      plan === "starter" &&
                      formRegions.length >= 2;

                    return (
                      <button
                        key={region.value}
                        type="button"
                        onClick={() => toggleRegion(region.value)}
                        disabled={canSelect || canSelectStarter}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                          isSelected
                            ? "bg-[rgba(8,145,178,0.15)] border-[rgba(8,145,178,0.3)] text-[#0891B2]"
                            : canSelect || canSelectStarter
                              ? "bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)] text-[#52525B] opacity-50 cursor-not-allowed"
                              : "bg-[#1C1C22] border-[rgba(255,255,255,0.08)] text-[#A1A1AA] hover:border-[rgba(255,255,255,0.15)] hover:text-[#FAFAFA]"
                        )}
                      >
                        {region.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error message */}
              {formEndpointError && !formEndpoint.startsWith("http") && null}

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                >
                  Cancel
                </button>
                <div className="relative">
                  <button
                    onClick={handleCreate}
                    disabled={creating || atLimit}
                    className={cn(
                      "bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2",
                      atLimit || creating
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-white hover:shadow-lg"
                    )}
                  >
                    {creating ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-[#0A0A0F] border-t-transparent rounded-full animate-spin" />
                        Adding…
                      </span>
                    ) : (
                      "Add dependency"
                    )}
                  </button>
                  {atLimit && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1A1A20] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-[#A1A1AA] whitespace-nowrap shadow-console-dropdown pointer-events-none">
                      Upgrade to add more dependencies
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 bg-[#1A1A20] border-r border-b border-[rgba(255,255,255,0.08)] rotate-45" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
