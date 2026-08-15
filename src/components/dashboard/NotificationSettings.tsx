"use client";

import { useState } from "react";
import { Plus, Trash2, Webhook, Mail, Bell, Hash, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { notificationService, type AlertConfig, type ChannelType } from "@/services/notificationService";

const typeIcons: Record<ChannelType, React.ComponentType<{ className?: string }>> = {
  slack: Hash,
  email: Mail,
  pagerduty: Bell,
  webhook: Webhook,
};

const typeColors: Record<ChannelType, string> = {
  slack: "bg-purple-50 text-purple-600",
  email: "bg-blue-50 text-blue-600",
  pagerduty: "bg-amber-50 text-amber-600",
  webhook: "bg-emerald-50 text-emerald-600",
};

const configLabels: Record<ChannelType, string> = {
  slack: "Webhook URL",
  email: "Recipients (comma-separated)",
  pagerduty: "Routing Key",
  webhook: "Endpoint URL",
};

interface NotificationSettingsProps {
  channels: AlertConfig[];
}

export function NotificationSettings({ channels: initialChannels }: NotificationSettingsProps) {
  const [localChannels, setLocalChannels] = useState(initialChannels);
  const [addOpen, setAddOpen] = useState(false);
  const [type, setType] = useState<ChannelType>("slack");
  const [configValue, setConfigValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!configValue) return;
    setAdding(true);
    const configKey = type === "slack" ? "webhook_url" : type === "email" ? "email" : type === "pagerduty" ? "routing_key" : "url";
    try {
      const newChannel = await notificationService.create({
        channel_type: type,
        config: { [configKey]: configValue },
        is_active: true,
      });
      setLocalChannels([...localChannels, newChannel]);
      setConfigValue("");
      setAddOpen(false);
      toast.success("Notification channel added");
    } catch {
      toast.error("Failed to add notification channel.");
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    setTogglingId(id);
    try {
      const updated = await notificationService.update(id, { is_active: active });
      setLocalChannels(localChannels.map((c) => (c.id === id ? updated : c)));
      toast.success(active ? "Channel enabled." : "Channel disabled.");
    } catch {
      toast.error("Could not update channel.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await notificationService.delete(id);
      setLocalChannels(localChannels.filter((c) => c.id !== id));
      toast.success("Channel removed.");
    } catch {
      toast.error("Could not remove channel.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#52525B]">{localChannels.length} channels</p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#0891B2] hover:bg-[#0891B2]/90 text-white text-xs h-9">
              <Plus className="h-3.5 w-3.5" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-[#E4E4E7] text-[#09090B]">
            <DialogHeader>
              <DialogTitle>Add Notification Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-[#52525B] mb-1.5 block">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(typeIcons) as ChannelType[]).map((t) => {
                    const Icon = typeIcons[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg p-3 border text-xs transition-colors capitalize ${type === t ? "border-[#0891B2] bg-[#0891B2]/8 text-[#0891B2]" : "border-[#E4E4E7] text-[#52525B] hover:border-[#D4D4D8]"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-[#52525B] mb-1.5 block">{configLabels[type]}</label>
                <Input value={configValue} onChange={(e) => setConfigValue(e.target.value)} placeholder={`Enter ${configLabels[type].toLowerCase()}`} className="bg-[#F8F9FA] border-[#E4E4E7] text-[#09090B]" />
              </div>
              <Button onClick={handleAdd} disabled={adding} className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white">
                {adding ? "Adding..." : "Add Channel"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {localChannels.length === 0 ? (
          <div className="rounded-lg border border-[#E4E4E7] bg-white p-8 text-center">
            <p className="text-sm text-[#A1A1AA]">No notification channels configured.</p>
          </div>
        ) : (
          localChannels.map((channel) => {
            const Icon = typeIcons[channel.channel_type];
            return (
              <div key={channel.id} className="rounded-lg border border-[#E4E4E7] bg-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[channel.channel_type] || "bg-[#F8F9FA] text-[#52525B]"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#09090B] capitalize">{channel.channel_type}</p>
                    <p className="text-xs text-[#A1A1AA]">ID: {channel.id.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={channel.is_active}
                    onCheckedChange={(checked) => handleToggle(channel.id, checked)}
                    disabled={togglingId === channel.id || deletingId === channel.id}
                  />
                  <button
                    onClick={() => handleDelete(channel.id)}
                    disabled={deletingId === channel.id}
                    className="text-[#A1A1AA] hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    {deletingId === channel.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
