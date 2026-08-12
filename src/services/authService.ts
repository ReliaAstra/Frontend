import { apiClient, BackendError } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  org_name?: string | null;
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get("/users/me");
    return res.data;
  },

  async refreshToken(refresh_token: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>("/auth/refresh", { refresh_token });
    return res.data;
  },

  async logout(refresh_token: string): Promise<void> {
    await apiClient.post("/auth/logout", { refresh_token });
  },
};
