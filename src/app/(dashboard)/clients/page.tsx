"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, ChevronRight, X } from "lucide-react";
import { ConsoleCard } from "@/components/dashboard/ConsoleLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useClients, useCreateClient } from "@/hooks/useApi";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { BackendError } from "@/lib/api";

export default function ClientsPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: clients = [], isLoading: loading, isError: error, refetch } = useClients();
  const createClient = useCreateClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState("");

  const openModal = () => {
    setFormName("");
    setFormDescription("");
    setFormError("");
    setModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formName.trim()) {
      setFormError("Client name is required.");
      return;
    }
    try {
      await createClient.mutateAsync({
        name: formName.trim(),
        description: formDescription.trim() || null,
      });
      toast.success("Client created.");
      setModalOpen(false);
    } catch (err) {
      setFormError(
        err instanceof BackendError ? err.message : "Failed to create client. Please try again."
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-28 bg-[#1A1A20]" />
            <Skeleton className="h-4 w-48 bg-[#1A1A20]" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg bg-[#1A1A20]" />
        </div>
        <ConsoleCard>
          <div className="px-5 py-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]">
            <div className="grid grid-cols-[1fr_2fr_140px_40px] gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-16 bg-[#1A1A20]" />
              ))}
            </div>
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-t border-[rgba(255,255,255,0.05)]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md bg-[#1A1A20]" />
                <Skeleton className="h-3.5 w-36 bg-[#1A1A20]" />
              </div>
            </div>
          ))}
        </ConsoleCard>
      </div>
    );
  }

    return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-[#FAFAFA] tracking-tight">Clients</h1>
          <p className="text-[12px] text-[#A1A1AA] mt-1">
            Manage and monitor your client infrastructure
          </p>
        </div>
        <button
          onClick={openModal}
          className="inline-flex items-center gap-2 bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-white hover:shadow-lg transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          Add client
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#131318] rounded-xl border border-[rgba(255,255,255,0.08)] p-4 flex items-start gap-3">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] mt-1.5 shrink-0" />
          <p className="text-sm text-[#FAFAFA] flex-1">Unable to load clients.</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-medium text-[#0891B2]"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!error && clients.length === 0 && (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start monitoring their infrastructure reliability and group their applications."
          actionLabel="Add client"
          onAction={openModal}
        />
      )}

      {/* Table */}
      {!error && clients.length > 0 && (
        <ConsoleCard>
          {/* Table Header */}
          <div className="px-5 py-3 grid grid-cols-[1fr_2fr_140px_40px] gap-4 text-[11px] font-semibold uppercase tracking-wider text-[#52525B] bg-[rgba(255,255,255,0.02)]">
            <span>Client</span>
            <span>Description</span>
            <span className="text-right">Added</span>
            <span></span>
          </div>

          {/* Rows */}
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="px-5 py-3.5 grid grid-cols-[1fr_2fr_140px_40px] gap-4 border-t border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors items-center group"
            >
              {/* Client Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[rgba(255,255,255,0.08)] text-xs font-medium shrink-0"
                  style={{ backgroundColor: "#1A1A20", color: "#A1A1AA" }}
                >
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-[13px] font-medium text-[#FAFAFA] group-hover:text-[#0891B2] transition-colors truncate">
                  {client.name}
                </p>
              </div>

              {/* Description */}
              <span className="text-[12px] text-[#A1A1AA] truncate">
                {client.description || "—"}
              </span>

              {/* Added */}
              <span className="text-[12px] font-mono text-[#A1A1AA] text-right tabular-nums">
                {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
              </span>

              {/* Chevron */}
              <ChevronRight className="h-3.5 w-3.5 text-[#52525B] group-hover:text-[#0891B2] shrink-0 ml-auto transition-colors" />
            </Link>
          ))}
        </ConsoleCard>
      )}

      {/* ── Add Client Modal ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-[#1A1A20] rounded-2xl border border-[rgba(255,255,255,0.08)] max-w-md w-full p-6 animate-[fadeIn_200ms_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#FAFAFA]">Add client</h2>
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
                  placeholder="Acme Corp"
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
                  placeholder="Production infrastructure for Acme Corp"
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
                  onClick={handleCreate}
                  disabled={createClient.isPending}
                  className="bg-[#FAFAFA] text-[#0A0A0F] px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-white transition-colors inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {createClient.isPending ? "Adding…" : "Add client"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
