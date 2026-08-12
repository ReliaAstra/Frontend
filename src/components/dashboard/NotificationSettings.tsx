"use client";

import { useState } from "react";
import { Plus, Trash2, Webhook, Mail, Bell, Hash } from "lucide-react";
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
import type { NotificationChannel, ChannelType } from "@/services/notificationService";

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

interface NotificationSettingsProps {
  channels: NotificationChannel[];
}

export function NotificationSettings({ channels: initialChannels }: NotificationSettingsProps) {
  const [localChannels, setLocalChannels] = useState(initialChannels);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("slack");
  const [configValue, setConfigValue] = useState("");

  const configLabel: Record<ChannelType, string> = {
    slack: "Webhook URL",
    email: "Recipients (comma-separated)",
    pagerduty: "Routing Key",
    webhook: "Endpoint URL",
  };

  const handleAdd = () => {
    if (!name || !configValue) return;
    const configKey = type === "slack" || type === "webhook" ? (type === "slack" ? "webhook_url" : "url") : type === "email" ? "recipients" : "routing_key";
    const newChannel: NotificationChannel = {
      id: `ch_${Date.now()}`,
      name,
      type,
      config: { [configKey]: configValue },
      is_active: true,
      created_at: new Date().toISOString(),
    };
    setLocalChannels([...localChannels, newChannel]);
    setName("");
    setConfigValue("");
    setAddOpen(false);
    toast.success("Notification channel added");
  };

  const handleToggle = (id: string, active: boolean) => {
    setLocalChannels(localChannels.map((c) => (c.id === id ? { ...c, is_active: active } : c)));
    toast.success(active ? "Channel enabled" : "Channel disabled");
  };

  const handleDelete = (id: string) => {
    setLocalChannels(localChannels.filter((c) => c.id !== id));
    toast.success("Channel removed");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{localChannels.length} channels</p>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#6366F1] hover:bg-[#6366F1]/90 text-white text-xs h-9">
              <Plus className="h-3.5 w-3.5" />
              Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle>Add Notification Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Channel Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Engineering Alerts" className="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(typeIcons) as ChannelType[]).map((t) => {
                    const Icon = typeIcons[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex flex-col items-center gap-1.5 rounded-lg p-3 border text-xs transition-colors capitalize ${type === t ? "border-[#6366F1] bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-500 hover:border-gray-300"}`}
                      >
                        <Icon className="h-4 w-4" />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">{configLabel[type]}</label>
                <Input value={configValue} onChange={(e) => setConfigValue(e.target.value)} placeholder={`Enter ${configLabel[type].toLowerCase()}`} className="bg-gray-50 border-gray-200 text-gray-900" />
              </div>
              <Button onClick={handleAdd} className="w-full bg-[#6366F1] hover:bg-[#6366F1]/90 text-white">
                Add Channel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {localChannels.map((channel) => {
          const Icon = typeIcons[channel.type];
          return (
            <div key={channel.id} className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColors[channel.type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{channel.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={channel.is_active} onCheckedChange={(checked) => handleToggle(channel.id, checked)} />
                <button onClick={() => handleDelete(channel.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
