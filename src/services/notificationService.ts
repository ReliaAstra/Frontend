import { apiClient } from "@/lib/api";

export type ChannelType = "email" | "slack" | "pagerduty" | "webhook";

/** Matches live schema AlertConfigResponse */
export interface AlertConfig {
  id: string;
  org_id: string;
  channel_type: ChannelType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Matches live schema AlertConfigCreateRequest */
export interface CreateAlertConfigRequest {
  channel_type: ChannelType;
  config: Record<string, string>;
  is_active?: boolean;
}

/** Matches live schema AlertTestResponse */
export interface AlertTestResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  /** GET /v1/notifications/configs */
  async list(): Promise<AlertConfig[]> {
    const res = await apiClient.get<AlertConfig[]>("/notifications/configs");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/notifications/configs */
  async create(data: CreateAlertConfigRequest): Promise<AlertConfig> {
    const res = await apiClient.post<AlertConfig>("/notifications/configs", data);
    return res.data;
  },

  /** GET /v1/notifications/configs/{config_id} */
  async getById(id: string): Promise<AlertConfig> {
    const res = await apiClient.get<AlertConfig>(`/notifications/configs/${id}`);
    return res.data;
  },

  /** PATCH /v1/notifications/configs/{config_id} */
  async update(id: string, data: Partial<CreateAlertConfigRequest>): Promise<AlertConfig> {
    const res = await apiClient.patch<AlertConfig>(`/notifications/configs/${id}`, data);
    return res.data;
  },

  /** DELETE /v1/notifications/configs/{config_id} */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/notifications/configs/${id}`);
  },

  /** POST /v1/notifications/test */
  async test(id: string): Promise<AlertTestResponse> {
    const res = await apiClient.post<AlertTestResponse>("/notifications/test", {
      config_id: id,
    });
    return res.data;
  },
};
