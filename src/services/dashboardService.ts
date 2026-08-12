import { apiClient } from "@/lib/api";

export interface DashboardSummary {
  total_dependencies: number;
  active_incidents: number;
  uptime_24h: number;
  uptime_7d: number;
  avg_latency_ms: number;
  checks_24h: number;
}

export interface LatencyPoint {
  timestamp: string;
  us_east_1: number;
  eu_west_1: number;
  ap_southeast_1: number;
}

export interface SlaDegradation {
  current_sla: number;
  target_sla: number;
  degradation_pct: number;
  affected_services: number;
  trend: "improving" | "stable" | "degrading";
}

export interface CheckResult {
  id: string;
  dependency_name: string;
  status: "up" | "down" | "degraded";
  response_time_ms: number;
  status_code: number;
  checked_at: string;
}

export const mockDashboardSummary: DashboardSummary = {
  total_dependencies: 12,
  active_incidents: 1,
  uptime_24h: 99.94,
  uptime_7d: 99.88,
  avg_latency_ms: 142.5,
  checks_24h: 8640,
};

export const mockLatencyData: LatencyPoint[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `2026-08-12T${String(i).padStart(2, "0")}:00:00Z`,
  us_east_1: 95 + Math.random() * 80 + (i > 15 && i < 19 ? 60 : 0),
  eu_west_1: 130 + Math.random() * 70 + (i > 16 && i < 20 ? 40 : 0),
  ap_southeast_1: 180 + Math.random() * 90 + (i > 17 && i < 21 ? 50 : 0),
}));

export const mockSlaDegradation: SlaDegradation = {
  current_sla: 99.82,
  target_sla: 99.95,
  degradation_pct: 0.13,
  affected_services: 2,
  trend: "improving",
};

export const mockCheckResults: CheckResult[] = [
  { id: "chk_001", dependency_name: "Stripe API", status: "up", response_time_ms: 89, status_code: 200, checked_at: "2026-08-12T18:47:00Z" },
  { id: "chk_002", dependency_name: "Twilio SMS", status: "down", response_time_ms: 0, status_code: 503, checked_at: "2026-08-12T18:47:00Z" },
  { id: "chk_003", dependency_name: "Auth0 OIDC", status: "degraded", response_time_ms: 2450, status_code: 200, checked_at: "2026-08-12T18:46:00Z" },
  { id: "chk_004", dependency_name: "SendGrid Email", status: "up", response_time_ms: 112, status_code: 200, checked_at: "2026-08-12T18:46:00Z" },
  { id: "chk_005", dependency_name: "Cloudflare DNS", status: "up", response_time_ms: 12, status_code: 200, checked_at: "2026-08-12T18:45:00Z" },
];

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    try {
      const res = await apiClient.get("/dashboard/summary");
      return res.data;
    } catch {
      return mockDashboardSummary;
    }
  },

  async getLatency(hours = 24): Promise<LatencyPoint[]> {
    try {
      const res = await apiClient.get("/dashboard/latency", { params: { hours } });
      return res.data;
    } catch {
      return mockLatencyData;
    }
  },

  async getSlaDegradation(): Promise<SlaDegradation> {
    try {
      const res = await apiClient.get("/dashboard/sla-degradation");
      return res.data;
    } catch {
      return mockSlaDegradation;
    }
  },

  async getRecentChecks(limit = 5): Promise<CheckResult[]> {
    try {
      const res = await apiClient.get("/dashboard/recent-checks", { params: { limit } });
      return res.data;
    } catch {
      return mockCheckResults;
    }
  },
};
