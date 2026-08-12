import { apiClient, getOrgContext } from "@/lib/api";

// --- Types matching backend OpenAPI spec ---

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

// --- Service: PUBLIC endpoints (no auth required) ---

export const vendorService = {
  async listPublicVendors(): Promise<VendorResponse[]> {
    const res = await apiClient.get<VendorResponse[]>("/public/vendors");
    return res.data;
  },

  async getVendorDetail(vendorName: string): Promise<VendorDetailResponse> {
    const res = await apiClient.get<VendorDetailResponse>(`/public/vendors/${vendorName}`);
    return res.data;
  },

  async getVendorHistory(vendorName: string): Promise<VendorHistoryResponse> {
    const res = await apiClient.get<VendorHistoryResponse>(`/public/vendors/${vendorName}/history`);
    return res.data;
  },

  async getVendorMetrics(vendorName: string, window?: string): Promise<VendorMetricsResponse> {
    const params = window ? { window } : {};
    const res = await apiClient.get<VendorMetricsResponse>(`/public/vendors/${vendorName}/metrics`, { params });
    return res.data;
  },

  async getVendorIncidents(vendorName: string, limit = 50): Promise<VendorIncidentsResponse> {
    const res = await apiClient.get<VendorIncidentsResponse>(`/public/vendors/${vendorName}/incidents`, {
      params: { limit },
    });
    return res.data;
  },
};
