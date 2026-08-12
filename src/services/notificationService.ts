import { apiClient, getOrgContext } from "@/lib/api";

export type ChannelType = "email" | "slack" | "pagerduty" | "webhook";

export interface AlertConfig {
  id: string;
  org_id: string;
  channel_type: ChannelType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAlertConfigRequest {
  channel_type: ChannelType;
  config: Record<string, string>;
  is_active?: boolean;
}

export const notificationService = {
  async list(): Promise<AlertConfig[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<AlertConfig[]>(`/orgs/${orgId}/notifications/configs`);
    return res.data;
  },

  async create(data: CreateAlertConfigRequest): Promise<AlertConfig> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<AlertConfig>(`/orgs/${orgId}/notifications/configs`, data);
    return res.data;
  },

  async update(id: string, data: Partial<CreateAlertConfigRequest>): Promise<AlertConfig> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.patch<AlertConfig>(`/orgs/${orgId}/notifications/configs/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    await apiClient.delete(`/orgs/${orgId}/notifications/configs/${id}`);
  },

  async test(id: string): Promise<{ success: boolean; message: string }> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<{ success: boolean; message: string }>(`/orgs/${orgId}/notifications/test`, {
      config_id: id,
    });
    return res.data;
  },
};
