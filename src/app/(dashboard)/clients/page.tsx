"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { clientService, type Client, type ClientListParams } from "@/services/clientService";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, RefreshCw, Search, ChevronUp, ChevronDown, ChevronRight, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type SortField = "name" | "sites_count" | "dependencies_count" | "open_incidents_count" | "created_at";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const fetchClients = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const params: ClientListParams = {
        sort_by: sortField,
        sort_dir: sortDir,
        page,
        per_page: perPage,
      };
      if (statusFilter !== "all") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await clientService.list(params);
      // API may return bare array or paginated response
      const items = Array.isArray(res) ? res : res?.items ?? [];
      const totalCount = Array.isArray(res) ? res.length : res?.total ?? 0;
      setClients(items);
      setTotal(totalCount);
    } catch {
      setError("Unable to load clients.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sortField, sortDir, page, statusFilter, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const totalPages = Math.ceil(total / perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-[#D4D4D8]" />;
    return sortDir === "asc"
      ? <ChevronUp className="h-3 w-3 text-[#0891B2]" />
      : <ChevronDown className="h-3 w-3 text-[#0891B2]" />;
  };

  const columns: { key: SortField; label: string; align: string }[] = [
    { key: "name", label: "Client", align: "text-left" },
    { key: "sites_count", label: "Sites", align: "text-right" },
    { key: "dependencies_count", label: "Dependencies", align: "text-right" },
    { key: "open_incidents_count", label: "Incidents", align: "text-right" },
    { key: "created_at", label: "Added", align: "text-right" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">CLIENTS</h1>
          <p className="text-[12px] text-[#A1A1AA] mt-1">
            {loading ? "Loading..." : `${total} client${total !== 1 ? "s" : ""} across your organization`}
          </p>
        </div>
        <button
          onClick={() => fetchClients(true)}
          disabled={refreshing || loading}
          className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchClients()} className="text-xs font-medium text-red-600 ml-auto">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-8 bg-white border border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA] rounded-md text-[13px] pl-9 pr-3 focus:outline-none focus:ring-1 focus:ring-[#0891B2] focus:border-[#0891B2]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-1 rounded-lg bg-white border border-[#E4E4E7] p-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                statusFilter === s
                  ? "bg-[#F8F9FA] text-[#09090B]"
                  : "text-[#A1A1AA] hover:text-[#52525B]"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#E4E4E7] bg-white overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_80px_120px_100px_120px] items-center px-5 py-2.5 border-b border-[#E4E4E7] bg-[#FAFAFA]">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={cn(
                "flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-[#A1A1AA] hover:text-[#52525B] transition-colors",
                col.align,
                col.key !== "name" && "justify-end"
              )}
            >
              {col.label}
              <SortIcon field={col.key} />
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="divide-y divide-[#F0F0F0]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <Skeleton className="h-8 w-8 rounded-md bg-[#F8F9FA]" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-40 bg-[#F8F9FA]" />
                  <Skeleton className="h-2.5 w-24 bg-[#F8F9FA]" />
                </div>
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          /* Empty */
          <div className="p-12 text-center">
            <Users className="h-8 w-8 text-[#E4E4E7] mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-[#09090B] font-medium">
              {search || statusFilter !== "all" ? "No clients match your filters" : "No clients yet"}
            </p>
            <p className="text-xs text-[#A1A1AA] mt-1">
              {search || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Clients will appear once they are added to your organization."}
            </p>
          </div>
        ) : (
          /* Rows */
          <div className="divide-y divide-[#F0F0F0]">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="grid grid-cols-[1fr_80px_120px_100px_120px] items-center px-5 py-3 hover:bg-[#FAFAFA] transition-colors group"
              >
                {/* Client Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#F8F9FA] border border-[#E4E4E7] text-xs font-medium text-[#52525B] shrink-0">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#09090B] group-hover:text-[#0891B2] transition-colors truncate">
                      {client.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        client.status === "active" ? "bg-emerald-500" : "bg-[#71717A]"
                      )} />
                      <span className="text-[11px] text-[#A1A1AA] capitalize">{client.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#E4E4E7] group-hover:text-[#0891B2] shrink-0 ml-auto lg:hidden" />
                </div>

                {/* Sites */}
                <p className="text-[13px] font-medium text-[#09090B] font-mono text-right tabular-nums">
                  {client.sites_count}
                </p>

                {/* Dependencies */}
                <p className="text-[13px] font-medium text-[#09090B] font-mono text-right tabular-nums">
                  {client.dependencies_count}
                </p>

                {/* Incidents */}
                <p className={cn(
                  "text-[13px] font-medium font-mono text-right tabular-nums",
                  client.open_incidents_count > 0 ? "text-amber-600" : "text-[#09090B]"
                )}>
                  {client.open_incidents_count}
                </p>

                {/* Added */}
                <p className="text-[11px] text-[#A1A1AA] text-right">
                  {formatDistanceToNow(new Date(client.created_at), { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && clients.length > 0 && totalPages > 1 && (
          <div className="px-5 py-2.5 border-t border-[#E4E4E7] flex items-center justify-between">
            <p className="text-[11px] text-[#A1A1AA]">
              Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} of {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1 rounded text-xs font-medium text-[#52525B] border border-[#E4E4E7] hover:bg-[#F8F9FA] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-xs font-medium text-[#09090B]">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1 rounded text-xs font-medium text-[#52525B] border border-[#E4E4E7] hover:bg-[#F8F9FA] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
