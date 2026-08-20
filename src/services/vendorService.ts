import { apiClient, unwrapItems, type PaginatedResponse } from "@/lib/api";

// --- Types matching the live OpenAPI spec ---

/** Matches live schema VendorResponse */
export interface VendorResponse {
  id: string;
  vendor_name: string;
  display_name: string;
  category: string;
  is_public: boolean;
  last_check_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Matches live schema VendorEndpointResponse */
export interface VendorEndpoint {
  id: string;
  endpoint_url: string;
  regions: string[];
  health_status: string;
  is_active: boolean;
  last_check_at: string | null;
}

/** Matches live schema VendorDetailResponse */
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

/** Matches live schema VendorHistoryResponse */
export interface VendorHistoryResponse {
  vendor_name: string;
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
  recent_checks_count: number;
}

/** Matches live schema VendorWindowMetrics */
export interface VendorWindowMetrics {
  window: string;
  total_observations: number;
  uptime_percentage: number;
  avg_latency_ms: number;
  p95_latency_ms: number | null;
}

/** Matches live schema VendorMetricsResponse */
export interface VendorMetricsResponse {
  vendor_name: string;
  metrics: Record<string, VendorWindowMetrics>;
}

/** Matches live schema VendorIncidentResponse */
export interface VendorIncident {
  incident_id: string;
  dependency_name: string;
  started_at: string;
  resolved_at: string | null;
  severity: string;
  status: string;
  duration_seconds: number | null;
}

/** Matches live schema VendorIncidentsResponse */
export interface VendorIncidentsResponse {
  vendor_name: string;
  incidents: VendorIncident[];
}

// ── Timeline types (live schema VendorTimelineResponse) ──────────────────────

export interface TimelineBucket {
  timestamp: string;
  avg_latency_ms: number;
  status_code: number | null;
  is_up: boolean;
  observation_count: number;
  incident_id: string | null;
}

export interface TimelineCurrent {
  timestamp: string | null;
  latency_ms: number | null;
  status_code: number | null;
  is_up: boolean | null;
}

export interface VendorTimelineResponse {
  vendor_name: string;
  window: string;
  resolution: string;
  region: string;
  from: string;
  to: string;
  current: TimelineCurrent;
  points: TimelineBucket[];
}

// --- Service: PUBLIC endpoints (no auth required) ---

export const vendorService = {
  /** GET /v1/vendors — cursor-paginated public vendor catalogue (unwrapped). */
  async listPublicVendors(limit = 100): Promise<VendorResponse[]> {
    const res = await apiClient.get<PaginatedResponse<VendorResponse>>("/vendors", {
      params: { limit, public: true },
    });
    return unwrapItems(res.data);
  },

  /** GET /v1/vendors/{vendor_name} */
  async getVendorDetail(vendorName: string): Promise<VendorDetailResponse> {
    const res = await apiClient.get<VendorDetailResponse>(`/vendors/${encodeURIComponent(vendorName)}`);
    return res.data;
  },

  /** GET /v1/vendors/{vendor_name}/history */
  async getVendorHistory(vendorName: string): Promise<VendorHistoryResponse> {
    const res = await apiClient.get<VendorHistoryResponse>(
      `/vendors/${encodeURIComponent(vendorName)}/history`
    );
    return res.data;
  },

  /** GET /v1/vendors/{vendor_name}/metrics?window= */
  async getVendorMetrics(vendorName: string, window?: string): Promise<VendorMetricsResponse> {
    const params = window ? { window } : {};
    const res = await apiClient.get<VendorMetricsResponse>(
      `/vendors/${encodeURIComponent(vendorName)}/metrics`,
      { params }
    );
    return res.data;
  },

  /** GET /v1/vendors/{vendor_name}/incidents?limit= */
  async getVendorIncidents(vendorName: string, limit = 50): Promise<VendorIncidentsResponse> {
    const res = await apiClient.get<VendorIncidentsResponse>(
      `/vendors/${encodeURIComponent(vendorName)}/incidents`,
      { params: { limit } }
    );
    return res.data;
  },

  /**
   * GET /v1/vendors/{vendor_name}/timeline
   * Public endpoint. Poll every 15-30s for live data.
   */
  async getVendorTimeline(
    vendorName: string,
    window: "1h" | "6h" | "24h" | "7d" | "30d" | "90d" = "24h",
    resolution?: "auto" | "1m" | "5m" | "15m" | "1h" | "6h",
    region?: string
  ): Promise<VendorTimelineResponse> {
    const params: Record<string, string> = { window };
    if (resolution && resolution !== "auto") params.resolution = resolution;
    if (region) params.region = region;
    const res = await apiClient.get<VendorTimelineResponse>(
      `/vendors/${encodeURIComponent(vendorName)}/timeline`,
      { params }
    );
    return res.data;
  },
};
