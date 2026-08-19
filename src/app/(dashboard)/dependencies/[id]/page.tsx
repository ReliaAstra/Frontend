"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, X, Pencil, Trash2, AlertTriangle } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import {
  useDependency,
  useDependencyHistory,
  useDependencyResults,
  useUpdateDependency,
  useDeleteDependency,
} from "@/hooks/useApi";
import { Card, Skeleton, StatusPill, Button } from "@/components/rs/ui";
import { cn } from "@/lib/utils";

/* ── Small stat card ────────────────────────────────────────────────────── */

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card hover className="p-4">
      <div className="text-xs text-[#6B7280] uppercase mb-2" style={{ letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div className="text-2xl font-bold text-[#F9FAFB] leading-none" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {value}
      </div>
    </Card>
  );
}

/* ── Chart tooltip ──────────────────────────────────────────────────────── */

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
    <div className="bg-[#111827] border border-[#374151] rounded-md px-3 py-2">
      <div className="text-[11px] text-[#6B7280]">
        {label ? new Date(label).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
      </div>
      <div className="text-sm font-medium text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {Math.round(payload[0].value)} ms
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function DependencyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: dep, isLoading, isError } = useDependency(id);
  const { data: history } = useDependencyHistory(id);
  const { data: results = [] } = useDependencyResults(id, 50);
  const updateDep = useUpdateDependency();
  const deleteDep = useDeleteDependency();

  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  // Edit form state
  const [name, setName] = React.useState("");
  const [endpointUrl, setEndpointUrl] = React.useState("");
  const [thresholdMs, setThresholdMs] = React.useState("");

  React.useEffect(() => {
    if (dep) {
      setName(dep.name);
      setEndpointUrl(dep.endpoint_url);
      setThresholdMs(dep.alert_threshold_ms != null ? String(dep.alert_threshold_ms) : "");
    }
  }, [dep]);

  const chartData = React.useMemo(
    () =>
      [...results]
        .sort((a, b) => new Date(a.executed_at).getTime() - new Date(b.executed_at).getTime())
        .map((r) => ({ t: r.executed_at, v: r.latency_ms })),
    [results],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!dep || isError) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-[#374151] mx-auto mb-4" strokeWidth={1.5} />
        <p className="text-[#9CA3AF]">Dependency not found.</p>
        <Link href="/dependencies" className="mt-4 inline-block text-sm text-[#3B82F6] hover:underline">
          Back to dependencies
        </Link>
      </div>
    );
  }

  const status = dep.is_active ? "up" : "unknown";

  const handleSave = async () => {
    try {
      await updateDep.mutateAsync({
        id,
        data: {
          name: name.trim(),
          endpoint_url: endpointUrl.trim(),
          alert_threshold_ms: thresholdMs.trim() ? parseInt(thresholdMs) || null : null,
        },
      });
      toast.success("Dependency updated.");
      setEditOpen(false);
    } catch {
      toast.error("Could not update dependency.");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDep.mutateAsync(id);
      toast.success("Dependency deleted.");
      router.push("/dependencies");
    } catch {
      toast.error("Could not delete dependency.");
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-2">
        <Link href="/dependencies" className="text-[#6B7280] hover:text-[#9CA3AF] transition-colors">
          Dependencies
        </Link>
        <span className="text-[#374151] mx-1.5">/</span>
        <span className="text-[#F9FAFB]">{dep.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#F9FAFB] tracking-tight">{dep.name}</h1>
            <StatusPill status={status} className="ml-3" />
          </div>
          <div className="text-[13px] text-[#6B7280] mt-1" style={{ fontFamily: "var(--font-geist-mono)" }}>
            {dep.endpoint_url}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MiniStat label="Uptime" value={history ? `${history.uptime_percentage.toFixed(2)}%` : "—"} />
        <MiniStat label="Avg latency" value={history ? `${Math.round(history.avg_latency_ms)}ms` : "—"} />
        <MiniStat label="Total checks" value={history ? String(history.total_checks) : "—"} />
        <MiniStat label="Total up" value={history ? String(history.total_up) : "—"} />
        <MiniStat label="Total down" value={history ? String(history.total_down) : "—"} />
      </div>

      {/* Latency chart */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Latency · last 24h</h2>
        <Card className="mt-4 p-5">
          <div style={{ height: 240 }}>
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-[#6B7280]">
                No check results recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#1F2937" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#1F2937" }}
                    tickCount={6}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip content={<LatencyTooltip />} cursor={{ stroke: "#374151" }} />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="rgba(59,130,246,0.08)"
                    isAnimationActive
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Check results */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[#F9FAFB]">Check results</h2>
        <div className="mt-4 bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
          {results.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#6B7280]">No check results recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[560px]">
                <thead>
                  <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
                    <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Region
                    </th>
                    <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Time
                    </th>
                    <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Latency
                    </th>
                    <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Status code
                    </th>
                    <th className="text-center text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Up
                    </th>
                    <th className="text-center pr-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                      Quorum
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 50).map((r, i) => (
                    <tr
                      key={r.id}
                      className={cn("hover:bg-[#1F2937] transition-colors", i < Math.min(results.length, 50) - 1 && "border-b border-[#1F2937]")}
                      style={{ height: 44 }}
                    >
                      <td className="px-4 text-sm text-[#F9FAFB] capitalize">{r.region}</td>
                      <td className="text-xs text-[#6B7280] whitespace-nowrap">
                        {new Date(r.executed_at).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="text-right text-sm text-[#9CA3AF]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {r.latency_ms} ms
                      </td>
                      <td className="text-right text-sm text-[#9CA3AF]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                        {r.status_code ?? "—"}
                      </td>
                      <td className="text-center">
                        {r.is_up ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#22C55E]" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-[#EF4444]" />
                        )}
                      </td>
                      <td className="text-center pr-4">
                        {r.quorum_confirmed ? (
                          <Check className="h-4 w-4 text-[#22C55E] inline-block" />
                        ) : (
                          <X className="h-4 w-4 text-[#EF4444] inline-block" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setEditOpen(false)}
        >
          <div
            className="w-[480px] max-w-[92vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#1F2937]">
              <h3 className="text-base font-semibold text-[#F9FAFB]">Edit dependency</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Name</label>
                <input
                  className="w-full bg-[#0B0F19] border border-[#374151] rounded-lg px-3.5 py-2.5 text-sm text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Endpoint URL</label>
                <input
                  className="w-full bg-[#0B0F19] border border-[#374151] rounded-lg px-3.5 py-2.5 text-sm text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]"
                  style={{ fontFamily: "var(--font-geist-mono)" }}
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">Alert threshold (ms)</label>
                <input
                  className="w-full bg-[#0B0F19] border border-[#374151] rounded-lg px-3.5 py-2.5 text-sm text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]"
                  value={thresholdMs}
                  onChange={(e) => setThresholdMs(e.target.value)}
                  inputMode="numeric"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateDep.isPending}>
                  {updateDep.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-[440px] max-w-[92vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-[#1F2937]">
              <h3 className="text-base font-semibold text-[#F9FAFB]">Delete dependency</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-[#9CA3AF]">
                This will permanently remove <span className="text-[#F9FAFB] font-medium">{dep.name}</span> and stop
                all checks for it. This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-5">
                <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
                <button
                  onClick={handleDelete}
                  disabled={deleteDep.isPending}
                  className="inline-flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-4 py-2 bg-[#EF4444] text-white hover:brightness-110 transition-[filter] disabled:opacity-50"
                >
                  {deleteDep.isPending ? "Deleting…" : "Delete dependency"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
