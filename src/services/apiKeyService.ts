import { apiClient, getOrgContext } from "@/lib/api";

export interface ApiKeyResponse {
  id: string;
  org_id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface ApiKeyCreateResponse extends ApiKeyResponse {
  full_key: string;
}

export const apiKeyService = {
  async list(): Promise<ApiKeyResponse[]> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.get<ApiKeyResponse[]>(`/orgs/${orgId}/api-keys`);
    return res.data;
  },

  async create(name: string, scopes?: string[], expires_at?: string | null): Promise<ApiKeyCreateResponse> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    const res = await apiClient.post<ApiKeyCreateResponse>(`/orgs/${orgId}/api-keys`, {
      name,
      scopes: scopes || ["read:checks", "write:dependencies", "read:incidents", "read:evidence"],
      expires_at: expires_at || null,
    });
    return res.data;
  },

  async revoke(id: string): Promise<void> {
    const orgId = getOrgContext();
    if (!orgId) throw new Error("No organization context");
    await apiClient.delete(`/orgs/${orgId}/api-keys/${id}`);
  },
};
