import { apiClient, unwrapItems, type PaginatedResponse } from "@/lib/api";

export type DependencyStatus = "up" | "down" | "degraded" | "unknown";
export type HttpMethod = "GET" | "HEAD" | "POST";

/** Matches live schema DependencyResponse */
export interface Dependency {
  id: string;
  org_id: string;
  application_id: string | null;
  name: string;
  endpoint_url: string;
  method: string;
  headers: Record<string, unknown> | null;
  has_headers?: boolean;
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

/** Matches live schema DependencyHistoryResponse */
export interface DependencyHistory {
  dependency_id: string;
  uptime_percentage: number;
  avg_latency_ms: number;
  total_checks: number;
  total_up: number;
  total_down: number;
}

/** Matches live schema CheckResultResponse */
export interface CheckResult {
  id: string;
  dependency_id: string;
  org_id: string;
  region: string;
  executed_at: string;
  latency_ms: number;
  status_code: number | null;
  is_up: boolean;
  error_message: string | null;
  quorum_confirmed: boolean;
}

/** Matches live schema DependencyCreateRequest */
export interface CreateDependencyRequest {
  name: string;
  endpoint_url: string;
  application_id?: string | null;
  method?: HttpMethod;
  headers?: Record<string, unknown> | null;
  expected_status_codes?: number[];
  timeout_seconds?: number;
  check_interval_seconds?: number;
  regions?: string[];
  alert_threshold_ms?: number | null;
  is_active?: boolean;
}

/** Matches live schema DependencyUpdateRequest */
export type UpdateDependencyRequest = Partial<CreateDependencyRequest>;

export const dependencyService = {
  async list(limit = 50, cursor?: string): Promise<Dependency[]> {
    const res = await apiClient.get<PaginatedResponse<Dependency>>("/dependencies", {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return unwrapItems(res.data);
  },

  async listPaginated(limit = 50, cursor?: string): Promise<PaginatedResponse<Dependency>> {
    const res = await apiClient.get<PaginatedResponse<Dependency>>("/dependencies", {
      params: { limit, ...(cursor ? { cursor } : {}) },
    });
    return res.data;
  },

  async getById(id: string): Promise<Dependency> {
    const res = await apiClient.get<Dependency>(`/dependencies/${id}`);
    return res.data;
  },

  async getHistory(id: string): Promise<DependencyHistory> {
    const res = await apiClient.get<DependencyHistory>(`/dependencies/${id}/history`);
    return res.data;
  },

  async getResults(id: string, limit = 50): Promise<CheckResult[]> {
    const res = await apiClient.get<PaginatedResponse<CheckResult>>(
      `/dependencies/${id}/results`,
      { params: { limit } }
    );
    return unwrapItems(res.data);
  },

  async create(data: CreateDependencyRequest): Promise<Dependency> {
    const res = await apiClient.post<Dependency>("/dependencies", data);
    return res.data;
  },

  async update(id: string, data: UpdateDependencyRequest): Promise<Dependency> {
    const res = await apiClient.patch<Dependency>(`/dependencies/${id}`, data);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/dependencies/${id}`);
  },
};
