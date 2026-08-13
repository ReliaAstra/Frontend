import { apiClient, BackendError } from "@/lib/api";

// ── Shared Types ──────────────────────────────────────────────────────

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

// ── OAuth Types ─────────────────────────────────────────────────────

export interface OAuthUrlResponse {
  authorization_url: string;
  state: string;
}

export interface OAuthCallbackResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  is_new_user: boolean;
  user_id: string;
  email: string;
  full_name: string;
}

// ── Service ──────────────────────────────────────────────────────────

export const authService = {
  // Email auth
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

  // Google OAuth
  async getGoogleAuthUrl(): Promise<OAuthUrlResponse> {
    const res = await apiClient.get<OAuthUrlResponse>("/auth/google/url");
    return res.data;
  },

  async exchangeGoogleCode(code: string): Promise<OAuthCallbackResponse> {
    const res = await apiClient.post<OAuthCallbackResponse>("/auth/google", { code });
    return res.data;
  },

  /** Initiates Google OAuth: stores state, redirects to consent screen. */
  initiateGoogleLogin: async () => {
    const { authorization_url, state } = await authService.getGoogleAuthUrl();
    sessionStorage.setItem("google_oauth_state", state);
    window.location.href = authorization_url;
  },

  /** Handles Google OAuth callback: extracts code, exchanges for tokens. */
  handleGoogleCallback: async (): Promise<OAuthCallbackResponse> => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const savedState = sessionStorage.getItem("google_oauth_state");

    if (!code) throw new Error("No authorization code received from Google");
    if (returnedState !== savedState) throw new Error("OAuth state mismatch — possible CSRF");

    sessionStorage.removeItem("google_oauth_state");
    return await authService.exchangeGoogleCode(code);
  },

  // GitHub OAuth
  async getGitHubAuthUrl(): Promise<OAuthUrlResponse> {
    const res = await apiClient.get<OAuthUrlResponse>("/auth/github/url");
    return res.data;
  },

  async exchangeGitHubCode(code: string): Promise<OAuthCallbackResponse> {
    const res = await apiClient.post<OAuthCallbackResponse>("/auth/github", { code });
    return res.data;
  },

  /** Initiates GitHub OAuth: stores state, redirects to consent screen. */
  initiateGitHubLogin: async () => {
    const { authorization_url, state } = await authService.getGitHubAuthUrl();
    sessionStorage.setItem("github_oauth_state", state);
    window.location.href = authorization_url;
  },

  /** Handles GitHub OAuth callback: extracts code, exchanges for tokens. */
  handleGitHubCallback: async (): Promise<OAuthCallbackResponse> => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const returnedState = params.get("state");
    const savedState = sessionStorage.getItem("github_oauth_state");

    if (!code) throw new Error("No authorization code received from GitHub");
    if (returnedState !== savedState) throw new Error("OAuth state mismatch — possible CSRF");

    sessionStorage.removeItem("github_oauth_state");
    return await authService.exchangeGitHubCode(code);
  },
};
