import { apiClient } from "@/lib/api";

export type ChannelType = "slack" | "email" | "pagerduty" | "webhook";

export interface NotificationChannel {
  id: string;
  name: string;
  type: ChannelType;
  config: Record<string, string>;
  is_active: boolean;
  created_at: string;
}

export const mockChannels: NotificationChannel[] = [
  { id: "ch_001", name: "Engineering Slack", type: "slack", config: { webhook_url: "https://hooks.slack.com/services/T00/B00/xxx", channel: "#incidents" }, is_active: true, created_at: "2025-03-01T00:00:00Z" },
  { id: "ch_002", name: "On-Call Email", type: "email", config: { recipients: "oncall@acme.com, sre@acme.com" }, is_active: true, created_at: "2025-03-15T00:00:00Z" },
  { id: "ch_003", name: "PagerDuty", type: "pagerduty", config: { routing_key: "pd_key_xxx", severity: "high,critical" }, is_active: true, created_at: "2025-05-20T00:00:00Z" },
  { id: "ch_004", name: "Status Page Webhook", type: "webhook", config: { url: "https://status.acme.com/api/hooks/reliability", secret: "whsec_xxx" }, is_active: false, created_at: "2025-08-01T00:00:00Z" },
];

export const notificationService = {
  async list(): Promise<NotificationChannel[]> {
    try {
      const res = await apiClient.get("/notifications/channels");
      return res.data;
    } catch {
      return mockChannels;
    }
  },

  async create(data: { name: string; type: ChannelType; config: Record<string, string> }): Promise<NotificationChannel> {
    try {
      const res = await apiClient.post("/notifications/channels", data);
      return res.data;
    } catch {
      return {
        id: `ch_${Date.now()}`,
        name: data.name,
        type: data.type,
        config: data.config,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }
  },

  async toggleActive(id: string, active: boolean): Promise<void> {
    try {
      await apiClient.patch(`/notifications/channels/${id}`, { is_active: active });
    } catch {
      // mock ok
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/channels/${id}`);
    } catch {
      // mock ok
    }
  },
};
