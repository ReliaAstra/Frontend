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
import { apiKeyService, type ApiKeyResponse, type ApiKeyCreateResponse } from "@/services/apiKeyService";

interface ApiKeyManagerProps {
  keys: ApiKeyResponse[];
}

export function ApiKeyManager({ keys: initialKeys }: ApiKeyManagerProps) {
  const [localKeys, setLocalKeys] = useState(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [rawKey, setRawKey] = useState("");
  const [showRaw, setShowRaw] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!keyName) return;
    setCreating(true);
    try {
      const result: ApiKeyCreateResponse = await apiKeyService.create(keyName);
      setLocalKeys([result, ...localKeys]);
      setRawKey(result.full_key);
      setKeyName("");
      setCreateOpen(false);
      toast.success("API key created");
    } catch {
      toast.error("Failed to create API key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiKeyService.revoke(id);
      setLocalKeys(localKeys.filter((k) => k.id !== id));
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key.");
    }
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
        <p className="text-sm text-[#52525B]">{localKeys.length} API keys</p>
        <Dialog open={createOpen && !rawKey} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
            <Plus className="h-3.5 w-3.5" />
            Create Key
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-white border-[#E4E4E7] text-[#09090B]">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-[#52525B] mb-1.5 block">Key Name</label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Integration"
                className="bg-[#F8F9FA] border-[#E4E4E7] text-[#09090B]"
              />
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
              {creating ? "Creating..." : "Create Key"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {/* Raw Key Display (one-time) */}
      {rawKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5 mb-4">
          <p className="text-sm font-medium text-amber-600 mb-2">Save this key now — it won&apos;t be shown again</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[#F8F9FA] px-3 py-2 text-xs text-[#09090B] font-mono break-all">
              {showRaw ? rawKey : "\u2022".repeat(48)}
            </code>
            <button onClick={() => setShowRaw(!showRaw)} className="shrink-0 p-2 rounded-lg hover:bg-[#F8F9FA] text-[#52525B]">
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copyToClipboard(rawKey, "raw")} className="shrink-0 p-2 rounded-lg hover:bg-[#F8F9FA] text-[#52525B]">
              {copiedId === "raw" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <Button onClick={() => setRawKey("")} variant="ghost" className="mt-3 text-xs text-[#52525B] hover:text-[#09090B]">
            Done, I&apos;ve saved it
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-[#E4E4E7] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E4E4E7]">
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Prefix</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Created</th>
              <th className="text-left px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Scopes</th>
              <th className="text-right px-4 py-3 text-[10px] font-medium uppercase tracking-wider text-[#A1A1AA]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {localKeys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#A1A1AA]">
                  No API keys yet.
                </td>
              </tr>
            ) : (
              localKeys.map((key) => (
                <tr key={key.id} className="border-b border-[#E4E4E7] last:border-0 hover:bg-[#F8F9FA] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#09090B]">{key.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-[#52525B] font-mono">{key.prefix}...</code>
                      <button onClick={() => copyToClipboard(key.prefix, key.id)} className="text-[#A1A1AA] hover:text-[#09090B]">
                        {copiedId === key.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#52525B]">{format(new Date(key.created_at), "MMM d, yyyy")}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.slice(0, 3).map((s) => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-[#F8F9FA] text-[#52525B] border border-[#F0F0F0]">
                          {s}
                        </span>
                      ))}
                      {key.scopes.length > 3 && (
                        <span className="text-[10px] text-[#A1A1AA]">+{key.scopes.length - 3}</span>
                      )}
                    </div>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
