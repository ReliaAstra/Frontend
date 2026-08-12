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
        <p className="text-sm text-gray-500">{localKeys.length} API keys</p>
        <Dialog open={createOpen && !rawKey} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
            <Plus className="h-3.5 w-3.5" />
            Create Key
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Key Name</label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Integration"
                className="bg-gray-50 border-gray-200 text-gray-900"
              />
            </div>
            <Button onClick={handleCreate} className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
              Create Key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Raw Key Display (one-time) */}
      {rawKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 mb-4">
          <p className="text-sm font-medium text-amber-600 mb-2">Save this key now — it won't be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-900 font-mono break-all">
              {showRaw ? rawKey : "••••••••••••••••••••••••••••••••••••••••"}
            </code>
            <button onClick={() => setShowRaw(!showRaw)} className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copyToClipboard(rawKey, "raw")} className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              {copiedId === "raw" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={() => setRawKey("")} variant="ghost" className="mt-3 text-xs text-gray-500 hover:text-gray-900">
            Done, I've saved it
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">Prefix</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">Created</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localKeys.map((key) => (
              <tr key={key.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-900">{key.name}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-gray-500 font-mono">{key.prefix}...</code>
                    <button onClick={() => copyToClipboard(key.prefix, key.id)} className="text-gray-400 hover:text-gray-900">
                      {copiedId === key.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(key.created_at), "MMM d, yyyy")}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${key.is_active ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-300"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${key.is_active ? "bg-emerald-500" : "bg-slate-500"}`} />
                    {key.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRevoke(key.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
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
