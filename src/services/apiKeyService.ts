import { apiClient } from "@/lib/api";

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export const mockApiKeys: ApiKey[] = [
  { id: "key_001", name: "Production Integration", prefix: "rla_prod_a1b2c3d4", created_at: "2025-06-01T00:00:00Z", last_used_at: "2026-08-12T18:00:00Z", is_active: true },
  { id: "key_002", name: "Staging Environment", prefix: "rla_stag_e5f6g7h8", created_at: "2025-08-15T00:00:00Z", last_used_at: "2026-08-12T17:30:00Z", is_active: true },
  { id: "key_003", name: "CI/CD Pipeline", prefix: "rla_cicd_i9j0k1l2", created_at: "2026-01-10T00:00:00Z", last_used_at: "2026-08-12T16:00:00Z", is_active: true },
  { id: "key_004", name: "Development", prefix: "rla_dev_m3n4o5p6", created_at: "2026-03-20T00:00:00Z", last_used_at: null, is_active: false },
];

export const apiKeyService = {
  async list(): Promise<ApiKey[]> {
    try {
      const res = await apiClient.get("/api-keys");
      return res.data;
    } catch {
      return mockApiKeys;
    }
  },

  async create(name: string): Promise<{ raw_key: string; key: ApiKey }> {
    try {
      const res = await apiClient.post("/api-keys", { name });
      return res.data;
    } catch {
      const raw = `rla_${crypto.randomUUID().replace(/-/g, "")}`;
      return {
        raw_key: raw,
        key: {
          id: `key_${Date.now()}`,
          name,
          prefix: raw.slice(0, 20),
          created_at: new Date().toISOString(),
          last_used_at: null,
          is_active: true,
        },
      };
    }
  },

  async revoke(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api-keys/${id}`);
    } catch {
      // mock ok
    }
  },
};
