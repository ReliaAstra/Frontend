import { apiClient, getOrgContext } from "@/lib/api";

export interface Client {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  sites_count: number;
  dependencies_count: number;
  open_incidents_count: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  client_id: string;
  org_id: string;
  name: string;
  url: string | null;
  dependencies_count: number;
  status: "up" | "degraded" | "down" | "unknown";
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
  created_at: string;
  updated_at: string;
}

export interface SiteDependency {
  id: string;
  site_id: string;
  org_id: string;
  name: string;
  endpoint_url: string;
  status: "up" | "down" | "degraded" | "unknown";
  uptime_percentage_24h: number;
  avg_latency_ms_24h: number;
  last_check_at: string | null;
  is_active: boolean;
}

export interface ClientListParams {
  status?: "active" | "inactive";
  search?: string;
  sort_by?: "name" | "sites_count" | "dependencies_count" | "open_incidents_count" | "created_at";
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const clientService = {
  async list(params?: ClientListParams): Promise<PaginatedResponse<Client>> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<PaginatedResponse<Client>>(`/orgs/${orgId}/clients`, { params });
    return res.data;
  },

  async getById(clientId: string): Promise<Client> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Client>(`/orgs/${orgId}/clients/${clientId}`);
    return res.data;
  },

  async listSites(clientId: string): Promise<Site[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Site[]>(`/orgs/${orgId}/clients/${clientId}/sites`);
    return res.data;
  },

  async getSiteById(clientId: string, siteId: string): Promise<Site> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<Site>(`/orgs/${orgId}/clients/${clientId}/sites/${siteId}`);
    return res.data;
  },

  async getSiteDependencies(clientId: string, siteId: string): Promise<SiteDependency[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<SiteDependency[]>(
      `/orgs/${orgId}/clients/${clientId}/sites/${siteId}/dependencies`
    );
    return res.data;
  },
};
