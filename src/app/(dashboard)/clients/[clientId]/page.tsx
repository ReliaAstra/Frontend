"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Layers, RefreshCw, Plus, X, ChevronRight, AppWindow } from "lucide-react";
import {
  ConsoleCard,
  ConsoleCardBody,
} from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useClients, useClientApplications, useCreateApplication } from "@/hooks/useApi";
import { toast } from "sonner";
import { BackendError } from "@/lib/api";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.clientId as string;

  const clientsQuery = useClients();
  const applicationsQuery = useClientApplications(clientId);
  const createApplication = useCreateApplication(clientId);

  const client = (clientsQuery.data ?? []).find((c) => c.id === clientId) ?? null;
  const applications = applicationsQuery.data ?? [];

  const loading = clientsQuery.isLoading || applicationsQuery.isLoading;
  const error = clientsQuery.isError || applicationsQuery.isError;

  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  const refetch = () => {
    clientsQuery.refetch();
    applicationsQuery.refetch();
  };

  const openModal = () => {
    setFormName("");
    setFormDescription("");
    setFormError("");
    setModalOpen(true);
  };

  const handleCreateApplication = async () => {
    if (!formName.trim()) {
      setFormError("Application name is required.");
      return;
    }
    try {
      await createApplication.mutateAsync({
        name: formName.trim(),
        description: formDescription.trim() || null,
      });
      toast.success("Application added.");
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof BackendError ? err.message : "Failed to add application. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-40 bg-[#1A1A20]" />
          <Skeleton className="h-6 w-56 bg-[#1A1A20]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl bg-[#1A1A20]" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl bg-[#1A1A20]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <Link href="/clients" className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors">
            Clients
          </Link>
          <span className="text-[#52525B]">/</span>
          <span className="text-[#52525B]">...</span>
        </div>
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
          <p className="text-sm text-[#FAFAFA] flex-1">Unable to load client data.</p>
          <button onClick={refetch} className="text-xs font-medium text-[#0891B2]">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-[#A1A1AA]">Client not found.</p>
        <button
          onClick={() => router.push("/clients")}
          className="mt-4 text-xs text-[#0891B2] hover:underline"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/clients"
          className="text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
        >
          Clients
        </Link>
        <span className="text-[#52525B]">/</span>
        <span className="text-[#FAFAFA] font-medium">{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-sm font-semibold shrink-0"
            style={{ backgroundColor: "#1A1A20", color: "#A1A1AA" }}
          >
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight truncate">
              {client.name}
            </h1>
            <p className="text-[12px] text-[#A1A1AA] mt-0.5 truncate">
              {client.description || "No description"} · Added{" "}
              {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={refetch}
            className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-[#A1A1AA]"
            style={{ backgroundColor: "#131318" }}
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Add application
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "rgba(8,145,178,0.12)" }}
            >
              <AppWindow className="h-5 w-5" style={{ color: "#0891B2" }} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Applications
              </p>
              <p className="font-mono text-2xl font-semibold text-[#FAFAFA]">
                {applications.length}
              </p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
        <ConsoleCard>
          <ConsoleCardBody className="flex items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
              style={{ backgroundColor: "rgba(22,163,74,0.12)" }}
            >
              <Layers className="h-5 w-5" style={{ color: "#16A34A" }} />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                Client ID
              </p>
              <p className="font-mono text-sm text-[#A1A1AA]">{client.id.slice(0, 18)}…</p>
            </div>
          </ConsoleCardBody>
        </ConsoleCard>
      </div>

      {/* Applications */}
      {applications.length === 0 ? (
        <EmptyState
          icon={AppWindow}
          title="No applications yet"
          description="Applications group this client's monitored dependencies. Add one to start organizing monitoring for this client."
          actionLabel="Add application"
          onAction={openModal}
        />
      ) : (
        <ConsoleCard>
          <div className="px-5 py-3 grid grid-cols-[1fr_2fr_140px_40px] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
            <span>Application</span>
            <span>Description</span>
            <span className="text-right">Created</span>
            <span></span>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.05)]">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/clients/${clientId}/sites/${app.id}`}
                className="px-5 py-3.5 grid grid-cols-[1fr_2fr_140px_40px] gap-4 items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
              >
                <span className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                  {app.name}
                </span>
                <span className="text-[12px] text-[#A1A1AA] truncate">
                  {app.description || "—"}
                </span>
                <span className="text-[12px] font-mono text-[#A1A1AA] text-right tabular-nums">
                  {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 ml-auto transition-colors" />
              </Link>
            ))}
          </div>
        </ConsoleCard>
      )}

      {/* ── Add Application Modal ────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-[#1A1A20] rounded-2xl border border-[rgba(255,255,255,0.08)] max-w-md w-full p-6 animate-[fadeIn_200ms_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#FAFAFA]">Add application</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors text-[#52525B] hover:text-[#A1A1AA]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="Storefront"
                  className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#A1A1AA] mb-1.5 block">
                  Description <span className="text-[#52525B] font-normal">(optional)</span>
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Customer-facing storefront stack"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-[#1C1C22] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-sm rounded-lg px-3.5 py-2.5 placeholder:text-[#52525B] focus:outline-none focus:border-[rgba(8,145,178,0.5)] transition-colors resize-none"
                />
              </div>

              {formError && <p className="text-xs text-[#DC2626]">{formError}</p>}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateApplication}
                  disabled={createApplication.isPending}
                  className="bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white transition-colors inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {createApplication.isPending ? "Adding…" : "Add application"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
