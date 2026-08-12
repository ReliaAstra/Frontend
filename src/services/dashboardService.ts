import { apiClient, getOrgContext } from "@/lib/api";

export interface DashboardSummaryResponse {
  active_dependencies_count: number;
  open_incidents_count: number;
  overall_uptime_percentage: number;
  alerts_today_count: number;
}

export interface LatencyDataPoint {
  timestamp: string;
  region: string;
  latency_ms: number;
  dependency_id: string | null;
}

export interface SlaDegradationResponse {
  total_degradation_pct: number;
  affected_services: number;
  period: string;
}

export interface DependencyHealth {
  dependency_id: string;
  name: string;
  endpoint_url: string;
  current_status: string;
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
}

export interface CheckResultResponse {
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

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<DashboardSummaryResponse>(`/orgs/${orgId}/dashboard/summary`);
    return res.data;
  },

  async getLatency(hours = 24): Promise<LatencyDataPoint[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<LatencyDataPoint[]>(`/orgs/${orgId}/dashboard/latency`, {
      params: { hours },
    });
    return res.data;
  },

  async getSlaDegradation(periodDays = 30): Promise<SlaDegradationResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<SlaDegradationResponse>(`/orgs/${orgId}/dashboard/sla-degradation`, {
      params: { period_days: periodDays },
    });
    return res.data;
  },

  async getDependencyHealth(): Promise<DependencyHealth[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<DependencyHealth[]>(`/orgs/${orgId}/dashboard/dependency-health`);
    return res.data;
  },

  async getRecentChecks(limit = 20): Promise<CheckResultResponse[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<CheckResultResponse[]>(`/orgs/${orgId}/checks/recent`, {
      params: { limit },
    });
    return res.data;
  },
};
