"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Radio, Pencil, Trash2, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import {
  useDependencies,
  useDependencyHealth,
  useCreateDependency,
  useUpdateDependency,
  useDeleteDependency,
} from "@/hooks/useApi";
import type { Dependency, CreateDependencyRequest, HttpMethod } from "@/services/dependencyService";
import type { DependencyHealth } from "@/services/dashboardService";
import { Card, EmptyState, PageHeader, Skeleton, StatusPill, Button, fmtUptime, fmtLatency } from "@/components/rs/ui";
import { cn } from "@/lib/utils";

/* ── Modal ──────────────────────────────────────────────────────────────── */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-[520px] max-w-[92vw] rounded-xl bg-[#111827] border border-[#1F2937] shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <h3 className="text-base font-semibold text-[#F9FAFB]">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-[#6B7280] hover:text-[#F9FAFB] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#F9FAFB] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#6B7280] mt-1">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-[#0B0F19] border border-[#374151] rounded-lg px-3.5 py-2.5 text-sm text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_2px_rgba(59,130,246,0.2)] transition-[border-color,box-shadow]";

/* ── Dependency form ────────────────────────────────────────────────────── */

function DependencyForm({
  initial,
  onSubmit,
  submitLabel,
  submitting,
  onCancel,
}: {
  initial?: Dependency;
  onSubmit: (data: CreateDependencyRequest) => void;
  submitLabel: string;
  submitting: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = React.useState(initial?.name || "");
  const [endpointUrl, setEndpointUrl] = React.useState(initial?.endpoint_url || "");
  const [method, setMethod] = React.useState<HttpMethod>((initial?.method as HttpMethod) || "GET");
  const [regions, setRegions] = React.useState((initial?.regions || ["us-east"]).join(", "));
  const [timeoutSec, setTimeoutSec] = React.useState(String(initial?.timeout_seconds ?? 10));
  const [intervalSec, setIntervalSec] = React.useState(String(initial?.check_interval_seconds ?? 60));
  const [thresholdMs, setThresholdMs] = React.useState(
    initial?.alert_threshold_ms != null ? String(initial.alert_threshold_ms) : "300",
  );
  const [expectedCodes, setExpectedCodes] = React.useState(
    (initial?.expected_status_codes || [200]).join(", "),
  );

  const valid = name.trim().length > 0 && endpointUrl.trim().length > 0;

  const handleSubmit = () => {
    if (!valid) return;
    onSubmit({
      name: name.trim(),
      endpoint_url: endpointUrl.trim(),
      method,
      regions: regions.split(",").map((r) => r.trim()).filter(Boolean),
      timeout_seconds: parseInt(timeoutSec) || 10,
      check_interval_seconds: parseInt(intervalSec) || 60,
      alert_threshold_ms: thresholdMs.trim() ? parseInt(thresholdMs) || null : null,
      expected_status_codes: expectedCodes.split(",").map((c) => parseInt(c.trim())).filter((n) => !Number.isNaN(n)),
    });
  };

  return (
    <div className="space-y-4">
      <Field label="Name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Stripe API" />
      </Field>
      <Field label="Endpoint URL" hint="Full URL of the endpoint to monitor.">
        <input
          className={inputCls}
          value={endpointUrl}
          onChange={(e) => setEndpointUrl(e.target.value)}
          placeholder="https://api.stripe.com/v1/charges"
          style={{ fontFamily: "var(--font-geist-mono)" }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Method">
          <select
            className={inputCls}
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
          >
            <option value="GET">GET</option>
            <option value="HEAD">HEAD</option>
            <option value="POST">POST</option>
          </select>
        </Field>
        <Field label="Regions" hint="Comma-separated check regions.">
          <input className={inputCls} value={regions} onChange={(e) => setRegions(e.target.value)} placeholder="us-east, eu-west" />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Timeout (s)">
          <input className={inputCls} value={timeoutSec} onChange={(e) => setTimeoutSec(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Interval (s)">
          <input className={inputCls} value={intervalSec} onChange={(e) => setIntervalSec(e.target.value)} inputMode="numeric" />
        </Field>
        <Field label="Alert at (ms)">
          <input className={inputCls} value={thresholdMs} onChange={(e) => setThresholdMs(e.target.value)} inputMode="numeric" />
        </Field>
      </div>
      <Field label="Expected status codes" hint="Comma-separated, e.g. 200, 202.">
        <input className={inputCls} value={expectedCodes} onChange={(e) => setExpectedCodes(e.target.value)} placeholder="200" />
      </Field>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!valid || submitting}>
          {submitting ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function DependenciesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: deps = [], isLoading, isError, refetch } = useDependencies();
  const { data: health = [] } = useDependencyHealth();
  const createDep = useCreateDependency();
  const updateDep = useUpdateDependency();
  const deleteDep = useDeleteDependency();

  const [modal, setModal] = React.useState<"add" | "edit" | "delete" | null>(null);
  const [editing, setEditing] = React.useState<Dependency | null>(null);
  const [deleting, setDeleting] = React.useState<Dependency | null>(null);

  // Auto-open the "add" modal via ?new=1
  React.useEffect(() => {
    if (searchParams.get("new") === "1") setModal("add");
  }, [searchParams]);

  const healthById = React.useMemo(() => {
    const map: Record<string, DependencyHealth> = {};
    for (const h of health) map[h.dependency_id] = h;
    return map;
  }, [health]);

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setDeleting(null);
    if (searchParams.get("new")) router.replace("/dependencies");
  };

  const handleCreate = async (data: CreateDependencyRequest) => {
    try {
      await createDep.mutateAsync(data);
      toast.success("Dependency added.");
      closeModal();
      refetch();
    } catch {
      toast.error("Could not add dependency.");
    }
  };

  const handleUpdate = async (data: CreateDependencyRequest) => {
    if (!editing) return;
    try {
      await updateDep.mutateAsync({ id: editing.id, data });
      toast.success("Dependency updated.");
      closeModal();
    } catch {
      toast.error("Could not update dependency.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDep.mutateAsync(deleting.id);
      toast.success("Dependency deleted.");
      closeModal();
    } catch {
      toast.error("Could not delete dependency.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Dependencies"
        subtitle="External services and endpoints your stack depends on."
        right={
          <button
            onClick={() => setModal("add")}
            className="inline-flex items-center gap-2 bg-[#3B82F6] text-white text-sm font-medium px-4 py-2 rounded-lg hover:brightness-110 transition-[filter]"
          >
            <Plus className="h-4 w-4" />
            Add dependency
          </button>
        }
      />

      {/* Error */}
      {isError && (
        <Card className="p-4">
          <p className="text-sm text-[#EF4444]">
            Unable to load dependencies.{" "}
            <button onClick={() => refetch()} className="text-[#3B82F6] hover:underline">
              Retry
            </button>
          </p>
        </Card>
      )}

      {/* Loading */}
      {isLoading && !isError && (
        <Card className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      )}

      {/* Empty */}
      {!isLoading && !isError && deps.length === 0 && (
        <Card>
          <EmptyState
            icon={Radio}
            title="No dependencies monitored"
            body="Add your first vendor to start tracking external health."
            actionLabel="Add dependency"
            onAction={() => setModal("add")}
          />
        </Card>
      )}

      {/* Table (desktop) */}
      {!isLoading && !isError && deps.length > 0 && (
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937]" style={{ height: 40 }}>
                <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>
                  Name
                </th>
                <th className="text-left text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 140, letterSpacing: "0.05em" }}>
                  Status
                </th>
                <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 120, letterSpacing: "0.05em" }}>
                  Uptime (24h)
                </th>
                <th className="text-right text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 110, letterSpacing: "0.05em" }}>
                  Latency
                </th>
                <th className="text-left px-4 text-[11px] font-medium uppercase text-[#6B7280]" style={{ width: 160, letterSpacing: "0.05em" }}>
                  Regions
                </th>
                <th className="text-right pr-4" style={{ width: 100 }} />
              </tr>
            </thead>
            <tbody>
              {deps.map((dep, i) => {
                const h = healthById[dep.id];
                return (
                  <tr
                    key={dep.id}
                    className={cn("cursor-pointer hover:bg-[#1F2937] transition-colors", i < deps.length - 1 && "border-b border-[#1F2937]")}
                    style={{ height: 52 }}
                    onClick={() => router.push(`/dependencies/${dep.id}`)}
                  >
                    <td className="px-4">
                      <div className="text-sm font-medium text-[#F9FAFB]">{dep.name}</div>
                      <div className="text-xs text-[#6B7280] truncate mt-0.5" style={{ fontFamily: "var(--font-geist-mono)", maxWidth: 280 }}>
                        {dep.endpoint_url}
                      </div>
                    </td>
                    <td>
                      <StatusPill status={h?.current_status || (dep.is_active ? "unknown" : "unknown")} />
                    </td>
                    <td className="text-right text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {h ? fmtUptime(h.uptime_percentage_24h) : "—"}
                    </td>
                    <td className="text-right text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {h ? `${fmtLatency(h.avg_latency_ms_24h)} ms` : "—"}
                    </td>
                    <td className="px-4">
                      <span className="text-xs text-[#9CA3AF] capitalize">{(dep.regions || []).join(", ")}</span>
                    </td>
                    <td className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setEditing(dep);
                            setModal("edit");
                          }}
                          className="p-1.5 rounded-md text-[#374151] hover:text-[#9CA3AF] transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleting(dep);
                            setModal("delete");
                          }}
                          className="p-1.5 rounded-md text-[#374151] hover:text-[#EF4444] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-[#374151]" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards (mobile) */}
      {!isLoading && !isError && deps.length > 0 && (
        <div className="md:hidden space-y-3">
          {deps.map((dep) => {
            const h = healthById[dep.id];
            return (
              <div
                key={dep.id}
                className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 cursor-pointer"
                onClick={() => router.push(`/dependencies/${dep.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#F9FAFB]">{dep.name}</div>
                    <div className="text-xs text-[#6B7280] truncate mt-0.5" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {dep.endpoint_url}
                    </div>
                  </div>
                  <StatusPill status={h?.current_status} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>Uptime</div>
                    <div className="text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {h ? fmtUptime(h.uptime_percentage_24h) : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase text-[#6B7280]" style={{ letterSpacing: "0.05em" }}>Latency</div>
                    <div className="text-sm text-[#F9FAFB]" style={{ fontFamily: "var(--font-geist-mono)" }}>
                      {h ? `${fmtLatency(h.avg_latency_ms_24h)} ms` : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {modal === "add" && (
        <Modal title="Add dependency" onClose={closeModal}>
          <DependencyForm
            onSubmit={handleCreate}
            submitLabel="Add dependency"
            submitting={createDep.isPending}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modal === "edit" && editing && (
        <Modal title="Edit dependency" onClose={closeModal}>
          <DependencyForm
            initial={editing}
            onSubmit={handleUpdate}
            submitLabel="Save changes"
            submitting={updateDep.isPending}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {modal === "delete" && deleting && (
        <Modal title="Delete dependency" onClose={closeModal}>
          <p className="text-sm text-[#9CA3AF]">
            This will permanently remove <span className="text-[#F9FAFB] font-medium">{deleting.name}</span> and
            stop all checks for it. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="ghost" onClick={closeModal}>
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
        </Modal>
      )}
    </div>
  );
}
