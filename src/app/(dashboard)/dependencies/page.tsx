"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
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

export default function DependenciesPage() {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CreateDependencyRequest>({
    name: "",
    target_url: "",
    check_interval_seconds: 60,
    expected_status_code: 200,
  });

  const fetchDeps = async () => {
    setLoading(true);
    const data = await dependencyService.list(statusFilter, search);
    setDependencies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDeps();
  }, [statusFilter, search]);

  const handleAdd = async () => {
    if (!form.name || !form.target_url) return;
    await dependencyService.create(form);
    setAddOpen(false);
    setForm({ name: "", target_url: "", check_interval_seconds: 60, expected_status_code: 200 });
    toast.success("Dependency added");
    fetchDeps();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await dependencyService.toggleActive(id, active);
    setDependencies(dependencies.map((d) => (d.id === id ? { ...d, is_active: active } : d)));
  };

  const handleDelete = async (id: string) => {
    await dependencyService.delete(id);
    setDependencies(dependencies.filter((d) => d.id !== id));
    toast.success("Dependency removed");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dependencies</h1>
          <p className="text-sm text-gray-400 mt-1">Monitor and manage your external services</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
              <Plus className="h-3.5 w-3.5" />
              Add Dependency
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-md">
            <DialogHeader>
              <DialogTitle>Add Dependency</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Stripe API"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Target URL</label>
                <Input
                  value={form.target_url}
                  onChange={(e) => setForm({ ...form, target_url: e.target.value })}
                  placeholder="https://api.stripe.com/v1/charges"
                  className="bg-gray-50 border-gray-200 text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Check Interval (s)</label>
                  <Input
                    type="number"
                    value={form.check_interval_seconds}
                    onChange={(e) => setForm({ ...form, check_interval_seconds: Number(e.target.value) })}
                    className="bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Expected Status</label>
                  <Input
                    type="number"
                    value={form.expected_status_code}
                    onChange={(e) => setForm({ ...form, expected_status_code: Number(e.target.value) })}
                    className="bg-gray-50 border-gray-200 text-gray-900"
                  />
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
                Add Dependency
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dependencies..."
            className="pl-9 h-9 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-1 rounded-lg bg-white border border-gray-200 p-1">
          {["all", "up", "down", "degraded"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-400 hover:text-gray-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg bg-white" />
          ))}
        </div>
      ) : (
        <DependencyGrid dependencies={dependencies} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </div>
  );
}