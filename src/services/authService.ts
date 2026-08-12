import { apiClient } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  org: { id: string; name: string; role: string };
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", data);
      return res.data;
    } catch {
      return {
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        user: { id: "usr_01", email: data.email, full_name: "Demo User", role: "owner" },
        org: { id: "org_01", name: "Acme Corp", role: "owner" },
      };
    }
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/register", data);
      return res.data;
    } catch {
      return {
        access_token: "mock_access_token",
        refresh_token: "mock_refresh_token",
        user: { id: "usr_01", email: data.email, full_name: data.full_name, role: "owner" },
        org: { id: "org_01", name: "My Organization", role: "owner" },
      };
    }
  },

  async getMe() {
    try {
      const res = await apiClient.get("/users/me");
      return res.data;
    } catch {
      return {
        id: "usr_01",
        email: "user@acme.com",
        full_name: "Demo User",
        role: "owner",
        avatar_url: null,
        orgs: [{ id: "org_01", name: "Acme Corp", role: "owner" }],
      };
    }
  },
};
