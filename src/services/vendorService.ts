import { apiClient } from "@/lib/api";

// --- Types matching OpenAPI spec ---

export interface VendorResponse {
  id: string;
  vendor_name: string;
  display_name: string;
  category: string;
  slug: string;
  current_status: string;
  uptime_90d: number;
  last_checked_at: string;
}

export interface VendorEndpoint {
  id: string;
  endpoint_url: string;
  regions: string[];
  health_status: string;
  is_active: boolean;
  last_check_at: string | null;
}

export interface VendorDetailResponse {
  id: string;
  vendor_name: string;
  display_name: string;
  category: string;
  is_public: boolean;
  last_check_at: string | null;
  created_at: string;
  updated_at: string;
  recent_status: string;
  endpoints: VendorEndpoint[];
}

export interface VendorHistoryResponse {
  vendor_name: string;
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
  recent_checks_count: number;
}

export interface VendorWindowMetrics {
  window: string;
  total_observations: number;
  uptime_percentage: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  error_rate: number;
}

export interface VendorMetricsResponse {
  vendor_name: string;
  metrics: Record<string, VendorWindowMetrics>;
}

export interface VendorIncident {
  incident_id: string;
  dependency_name: string;
  started_at: string;
  resolved_at: string | null;
  severity: string;
  status: string;
  duration_seconds: number | null;
}

export interface VendorIncidentsResponse {
  vendor_name: string;
  incidents: VendorIncident[];
}

// --- Mock data fallbacks ---

export const mockVendors: VendorResponse[] = [
  { id: "v1", vendor_name: "Stripe", display_name: "Stripe", category: "Payments", slug: "stripe", current_status: "operational", uptime_90d: 99.99, last_checked_at: "2026-08-13T02:00:00Z" },
  { id: "v2", vendor_name: "Auth0", display_name: "Auth0", category: "Identity", slug: "auth0", current_status: "degraded_performance", uptime_90d: 99.92, last_checked_at: "2026-08-13T01:55:00Z" },
  { id: "v3", vendor_name: "Cloudflare", display_name: "Cloudflare", category: "CDN", slug: "cloudflare", current_status: "operational", uptime_90d: 99.99, last_checked_at: "2026-08-13T01:50:00Z" },
  { id: "v4", vendor_name: "OpenAI", display_name: "OpenAI", category: "AI/ML", slug: "openai", current_status: "operational", uptime_90d: 99.95, last_checked_at: "2026-08-13T01:45:00Z" },
  { id: "v5", vendor_name: "Twilio", display_name: "Twilio", category: "Communications", slug: "twilio", current_status: "partial_outage", uptime_90d: 99.88, last_checked_at: "2026-08-13T01:40:00Z" },
  { id: "v6", vendor_name: "Vercel", display_name: "Vercel", category: "Hosting", slug: "vercel", current_status: "operational", uptime_90d: 99.97, last_checked_at: "2026-08-13T01:35:00Z" },
];

function generateMockMetrics(): VendorMetricsResponse {
  const windows: Record<string, VendorWindowMetrics> = {};
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const h = new Date(now.getTime() - i * 3600000);
    const key = h.toISOString().slice(0, 13);
    const r = Math.sin(i * 1.7) * 0.5 + 0.5;
    windows[key] = {
      window: h.toISOString(),
      total_observations: 350 + Math.floor(r * 50),
      uptime_percentage: 99.5 + r * 0.5,
      avg_latency_ms: 80 + r * 120 + (i % 7 === 0 ? 200 : 0),
      p95_latency_ms: 150 + r * 200 + (i % 7 === 0 ? 300 : 0),
      error_rate: i % 7 === 0 ? 0.02 + r * 0.03 : r * 0.005,
    };
  }
  return { vendor_name: "mock", metrics: windows };
}

function generateMockHistory(): VendorHistoryResponse {
  return {
    vendor_name: "mock",
    uptime_percentage_24h: 99.94,
    avg_latency_ms_24h: 142.5,
    recent_checks_count: 8640,
  };
}

function generateMockIncidents(): VendorIncidentsResponse {
  const now = new Date();
  return {
    vendor_name: "mock",
    incidents: [
      { incident_id: "inc-1", dependency_name: "Payments API", started_at: new Date(now.getTime() - 86400000 * 3).toISOString(), resolved_at: new Date(now.getTime() - 86400000 * 3 + 7200000).toISOString(), severity: "high", status: "resolved", duration_seconds: 7200 },
      { incident_id: "inc-2", dependency_name: "Auth Endpoint", started_at: new Date(now.getTime() - 86400000 * 7).toISOString(), resolved_at: null, severity: "critical", status: "open", duration_seconds: null },
      { incident_id: "inc-3", dependency_name: "CDN Edge", started_at: new Date(now.getTime() - 86400000 * 14).toISOString(), resolved_at: new Date(now.getTime() - 86400000 * 14 + 1800000).toISOString(), severity: "medium", status: "resolved", duration_seconds: 1800 },
    ],
  };
}

// --- Service ---

export const vendorService = {
  async listPublicVendors(): Promise<VendorResponse[]> {
    try {
      const { data } = await apiClient.get<VendorResponse[]>("/status/public");
      return data;
    } catch {
      return mockVendors;
    }
  },

  async getVendorDetail(vendorName: string): Promise<VendorDetailResponse> {
    try {
      const { data } = await apiClient.get<VendorDetailResponse>(`/status/public/${vendorName}`);
      return data;
    } catch {
      const mock = mockVendors.find((v) => v.slug === vendorName || v.vendor_name.toLowerCase() === vendorName.toLowerCase());
      return {
        id: mock?.id || "unknown",
        vendor_name: mock?.vendor_name || vendorName,
        display_name: mock?.display_name || vendorName,
        category: mock?.category || "Unknown",
        is_public: true,
        last_check_at: mock?.last_checked_at || new Date().toISOString(),
        created_at: "2026-01-01T00:00:00Z",
        updated_at: new Date().toISOString(),
        recent_status: mock?.current_status || "unknown",
        endpoints: [
          {
            id: "ep-1",
            endpoint_url: `https://api.${vendorName.toLowerCase()}.com/v1`,
            regions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
            health_status: mock?.current_status || "operational",
            is_active: true,
            last_check_at: new Date().toISOString(),
          },
        ],
      };
    }
  },

  async getVendorHistory(vendorName: string): Promise<VendorHistoryResponse> {
    try {
      const { data } = await apiClient.get<VendorHistoryResponse>(`/status/public/${vendorName}/history`);
      return data;
    } catch {
      return generateMockHistory();
    }
  },

  async getVendorMetrics(vendorName: string, window?: string): Promise<VendorMetricsResponse> {
    try {
      const params = window ? { window } : {};
      const { data } = await apiClient.get<VendorMetricsResponse>(`/status/public/${vendorName}/metrics`, { params });
      return data;
    } catch {
      return generateMockMetrics();
    }
  },

  async getVendorIncidents(vendorName: string, limit = 50): Promise<VendorIncidentsResponse> {
    try {
      const { data } = await apiClient.get<VendorIncidentsResponse>(`/status/public/${vendorName}/incidents`, { params: { limit } });
      return data;
    } catch {
      return generateMockIncidents();
    }
  },
};
