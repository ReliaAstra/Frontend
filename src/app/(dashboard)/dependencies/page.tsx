"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Search, AlertCircle, RefreshCw } from "lucide-react";
import { DependencyGrid } from "@/components/dashboard/DependencyGrid";
import { dependencyService, type Dependency, type CreateDependencyRequest } from "@/services/dependencyService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function DependenciesPage() {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CreateDependencyRequest>({
    name: "",
    endpoint_url: "",
    check_interval_seconds: 60,
    expected_status_codes: [200],
  });

  const fetchDeps = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await dependencyService.list();
      if (search) {
        const q = search.toLowerCase();
        setDependencies(data.filter(d => d.name.toLowerCase().includes(q) || d.endpoint_url.toLowerCase().includes(q)));
      } else {
        setDependencies(data);
      }
    } catch {
      setError("Unable to load dependencies.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDeps();
  }, [fetchDeps]);

  const handleAdd = async () => {
    if (!form.name || !form.endpoint_url) {
      toast.error("Name and endpoint URL are required.");
      return;
    }
    try {
      await dependencyService.create(form);
      setAddOpen(false);
      setForm({ name: "", endpoint_url: "", check_interval_seconds: 60, expected_status_codes: [200] });
      toast.success("Dependency added successfully.");
      fetchDeps();
    } catch {
      toast.error("Failed to add dependency. Check that the URL is valid.");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await dependencyService.update(id, { is_active: active });
      setDependencies(dependencies.map(d => (d.id === id ? { ...d, is_active: active } : d)));
    } catch {
      toast.error("Failed to update dependency.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dependencyService.delete(id);
      setDependencies(dependencies.filter(d => d.id !== id));
      toast.success("Dependency removed.");
    } catch {
      toast.error("Failed to remove dependency.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[15px] font-semibold text-[#09090B] tracking-tight">DEPENDENCIES</h1>
          <p className="text-[12px] text-[#A1A1AA] mt-1">
            Monitor and manage your external service endpoints
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDeps(true)}
            disabled={refreshing || loading}
            className="p-2 rounded-md border border-[#E4E4E7] hover:bg-[#F8F9FA] transition-colors text-[#52525B] disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          </button>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-[#0891B2] hover:bg-[#0E7490] text-white text-xs h-9">
                <Plus className="h-3.5 w-3.5" />
                Add Dependency
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-[#E4E4E7] text-[#09090B] max-w-md">
              <DialogHeader>
                <DialogTitle>Add Dependency</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Name</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Stripe API"
                    className="bg-white border-[#E4E4E7] text-[#09090B]"
                  />
                </div>
                <div>
                  <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Endpoint URL</label>
                  <Input
                    value={form.endpoint_url}
                    onChange={(e) => setForm({ ...form, endpoint_url: e.target.value })}
                    placeholder="https://api.stripe.com/v1/charges"
                    className="bg-white border-[#E4E4E7] text-[#09090B] font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Check Interval (s)</label>
                    <Input
                      type="number"
                      value={form.check_interval_seconds}
                      onChange={(e) => setForm({ ...form, check_interval_seconds: Number(e.target.value) })}
                      className="bg-white border-[#E4E4E7] text-[#09090B]"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#09090B] mb-1.5 block">Expected Status</label>
                    <Input
                      type="number"
                      value={form.expected_status_codes?.[0] || 200}
                      onChange={(e) => setForm({ ...form, expected_status_codes: [Number(e.target.value)] })}
                      className="bg-white border-[#E4E4E7] text-[#09090B]"
                    />
                  </div>
                </div>
                <Button onClick={handleAdd} className="w-full bg-[#0891B2] hover:bg-[#0E7490] text-white">
                  Add Dependency
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => fetchDeps()} className="text-xs font-medium text-red-600 ml-auto">Retry</button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dependencies..."
          className="pl-9 h-9 bg-white border-[#E4E4E7] text-[#09090B] placeholder:text-[#A1A1AA]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg bg-white" />
          ))}
        </div>
      ) : dependencies.length === 0 ? (
        <div className="rounded-lg border border-[#E4E4E7] bg-white p-12 text-center">
          <p className="text-sm text-[#09090B] font-medium">No dependencies configured</p>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Add a dependency to start monitoring its reliability.
          </p>
        </div>
      ) : (
        <DependencyGrid dependencies={dependencies} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </div>
  );
}
