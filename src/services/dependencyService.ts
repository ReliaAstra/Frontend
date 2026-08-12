import { apiClient, getOrgContext } from "@/lib/api";

export type DependencyStatus = "up" | "down" | "degraded" | "unknown";

export interface Dependency {
  id: string;
  org_id: string;
  application_id: string | null;
  name: string;
  endpoint_url: string;
  method: string;
  headers: Record<string, string> | null;
  expected_status_codes: number[];
  timeout_seconds: number;
  check_interval_seconds: number;
  next_check_at: string | null;
  regions: string[];
  alert_threshold_ms: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DependencyHistory {
  dependency_id: string;
  uptime_percentage: number;
  avg_latency_ms: number;
  total_checks: number;
  total_up: number;
  total_down: number;
}

export interface CheckResult {
  id: string;
  dependency_id: string;
  org_id: string;
  region: string;
  executed_at: string;
  latency_ms: number;
  status_code: number;
  is_up: boolean;
  error_message: string | null;
  quorum_confirmed: boolean;
}

export interface CreateDependencyRequest {
  name: string;
  endpoint_url: string;
  method?: string;
  headers?: Record<string, string> | null;
  expected_status_codes?: number[];
  timeout_seconds?: number;
  check_interval_seconds?: number;
  regions?: string[];
  alert_threshold_ms?: number | null;
  application_id?: string | null;
  is_active?: boolean;
}

export const dependencyService = {
  async list(limit = 50): Promise<Dependency[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Dependency[]>(`/orgs/${orgId}/dependencies`, { params: { limit } });
    return res.data;
  },

  async getById(id: string): Promise<Dependency> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Dependency>(`/orgs/${orgId}/dependencies/${id}`);
    return res.data;
  },

  async getHistory(id: string): Promise<DependencyHistory> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<DependencyHistory>(`/orgs/${orgId}/dependencies/${id}/history`);
    return res.data;
  },

  async getResults(id: string, limit = 50): Promise<CheckResult[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<CheckResult[]>(`/orgs/${orgId}/dependencies/${id}/results`, { params: { limit } });
    return res.data;
  },

  async create(data: CreateDependencyRequest): Promise<Dependency> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<Dependency>(`/orgs/${orgId}/dependencies`, data);
    return res.data;
  },

  async update(id: string, data: Partial<CreateDependencyRequest>): Promise<Dependency> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.patch<Dependency>(`/orgs/${orgId}/dependencies/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    await apiClient.delete(`/orgs/${orgId}/dependencies/${id}`);
  },
};
