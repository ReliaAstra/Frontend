import { apiClient, unwrapItems, type PaginatedResponse } from "@/lib/api";
import type { IncidentDetail } from "@/services/incidentService";
import type { CheckResult } from "@/services/dependencyService";
import type { VendorDetailResponse } from "@/services/vendorService";

/** Matches live schema DashboardSummaryResponse */
export interface DashboardSummaryResponse {
  active_dependencies_count: number;
  open_incidents_count: number;
  overall_uptime_percentage: number;
  alerts_today_count: number;
}

/** Matches live schema LatencyPointResponse */
export interface LatencyDataPoint {
  timestamp: string;
  region: string;
  latency_ms: number;
  dependency_id: string | null;
}

/** Matches live schema SLADegradationResponse */
export interface SlaDegradationResponse {
  total_degradation_pct: number;
  affected_services: number;
  period: string;
}

/** Matches live schema DependencyHealthResponse */
export interface DependencyHealth {
  dependency_id: string;
  name: string;
  endpoint_url: string;
  current_status: string;
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
}

export type CheckResultResponse = CheckResult;

export const dashboardService = {
  /** GET /v1/dashboard/summary */
  async getSummary(): Promise<DashboardSummaryResponse> {
    const res = await apiClient.get<DashboardSummaryResponse>("/dashboard/summary");
    return res.data;
  },

  /** GET /v1/dashboard/latency?hours= */
  async getLatency(hours = 24): Promise<LatencyDataPoint[]> {
    const res = await apiClient.get<LatencyDataPoint[]>("/dashboard/latency", {
      params: { hours },
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /v1/dashboard/sla-degradation?period_days= */
  async getSlaDegradation(periodDays = 30): Promise<SlaDegradationResponse> {
    const res = await apiClient.get<SlaDegradationResponse>("/dashboard/sla-degradation", {
      params: { period_days: periodDays },
    });
    return res.data;
  },

  /** GET /v1/dashboard/dependency-health */
  async getDependencyHealth(): Promise<DependencyHealth[]> {
    const res = await apiClient.get<DependencyHealth[]>("/dashboard/dependency-health");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /v1/dashboard/incident-timeline (cursor-paginated) */
  async getIncidentTimeline(limit = 20, cursor?: string): Promise<IncidentDetail[]> {
    const res = await apiClient.get<PaginatedResponse<IncidentDetail>>(
      "/dashboard/incident-timeline",
      { params: { limit, ...(cursor ? { cursor } : {}) } }
    );
    return unwrapItems(res.data);
  },

  /** GET /v1/dashboard/vendor-status */
  async getVendorStatus(): Promise<VendorDetailResponse[]> {
    const res = await apiClient.get<VendorDetailResponse[]>("/dashboard/vendor-status");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /v1/checks/recent?limit= */
  async getRecentChecks(limit = 20): Promise<CheckResult[]> {
    const res = await apiClient.get<CheckResult[]>("/checks/recent", { params: { limit } });
    return Array.isArray(res.data) ? res.data : [];
  },
};
