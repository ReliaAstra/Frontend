import { apiClient } from "@/lib/api";

/** Matches live schema ApiKeyResponse */
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

/** Matches live schema ApiKeyCreateResponse (includes the full key, shown once) */
export interface ApiKeyCreateResponse extends ApiKeyResponse {
  full_key: string;
}

const DEFAULT_SCOPES = ["read:checks", "write:dependencies", "read:incidents", "read:evidence"];

export const apiKeyService = {
  /** GET /v1/api-keys */
  async list(): Promise<ApiKeyResponse[]> {
    const res = await apiClient.get<ApiKeyResponse[]>("/api-keys");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /v1/api-keys */
  async create(name: string, scopes?: string[], expires_at?: string | null): Promise<ApiKeyCreateResponse> {
    const res = await apiClient.post<ApiKeyCreateResponse>("/api-keys", {
      name,
      scopes: scopes && scopes.length > 0 ? scopes : DEFAULT_SCOPES,
      expires_at: expires_at || null,
    });
    return res.data;
  },

  /** DELETE /v1/api-keys/{key_id} */
  async revoke(id: string): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`);
  },
};
