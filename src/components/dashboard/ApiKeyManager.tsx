"use client";

import { useState } from "react";
import { Copy, Plus, Trash2, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { toast } from "sonner";
import type { ApiKey } from "@/services/apiKeyService";

interface ApiKeyManagerProps {
  keys: ApiKey[];
}

export function ApiKeyManager({ keys: initialKeys }: ApiKeyManagerProps) {
  const [localKeys, setLocalKeys] = useState(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rawKey, setRawKey] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!keyName) return;
    const raw = `rla_${crypto.randomUUID().replace(/-/g, "")}`;
    const newKey: ApiKey = {
      id: `key_${Date.now()}`,
      name: keyName,
      prefix: raw.slice(0, 20),
      created_at: new Date().toISOString(),
      last_used_at: null,
      is_active: true,
    };
    setLocalKeys([newKey, ...localKeys]);
    setRawKey(raw);
    setKeyName("");
    toast.success("API key created");
  };

  const handleRevoke = (id: string) => {
    setLocalKeys(localKeys.filter((k) => k.id !== id));
    toast.success("API key revoked");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#94A3B8]">{localKeys.length} API keys</p>
        <Dialog open={createOpen && !rawKey} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs h-9">
            <Plus className="h-3.5 w-3.5" />
            Create Key
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#1A1D27] border-[#2A2D3A] text-[#F1F5F9]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-[#94A3B8] mb-1.5 block">Key Name</label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Integration"
                className="bg-[#0F1117] border-[#2A2D3A] text-[#F1F5F9]"
              />
            </div>
            <Button onClick={handleCreate} className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
              Create Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Raw Key Display (one-time) */}
      {rawKey && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 mb-4">
          <p className="text-sm font-medium text-amber-400 mb-2">Save this key now — it won't be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[#0F1117] px-3 py-2 text-xs text-[#F1F5F9] font-mono break-all">
              {showRaw ? rawKey : "••••••••••••••••••••••••••••••••••••••••"}
            </code>
            <button onClick={() => setShowRaw(!showRaw)} className="shrink-0 p-2 rounded-lg hover:bg-[#2A2D3A] text-[#94A3B8]">
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copyToClipboard(rawKey, "raw")} className="shrink-0 p-2 rounded-lg hover:bg-[#2A2D3A] text-[#94A3B8]">
              {copiedId === "raw" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={() => setRawKey("")} variant="ghost" className="mt-3 text-xs text-[#94A3B8] hover:text-[#F1F5F9]">
            Done, I've saved it
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-[#2A2D3A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2D3A]">
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Prefix</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Created</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Status</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#64748B]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localKeys.map((key) => (
              <tr key={key.id} className="border-b border-[#2A2D3A] last:border-0 hover:bg-[#141B2D] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-[#F1F5F9]">{key.name}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-[#94A3B8] font-mono">{key.prefix}...</code>
                    <button onClick={() => copyToClipboard(key.prefix, key.id)} className="text-[#64748B] hover:text-[#F1F5F9]">
                      {copiedId === key.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-[#94A3B8]">{format(new Date(key.created_at), "MMM d, yyyy")}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${key.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${key.is_active ? "bg-emerald-500" : "bg-slate-500"}`} />
                    {key.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
