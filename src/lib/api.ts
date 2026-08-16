import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Production API is the default; NEXT_PUBLIC_API_URL overrides for local dev
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.zevcloud.app/v1";

/**
 * Standard backend error envelope:
 * { error: { code: string, message: string, details?: object } }
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

export class BackendError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "BackendError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Track org context :  set by AuthProvider after session load
let currentOrgId: string | null = null;

export function setOrgContext(orgId: string | null) {
  currentOrgId = orgId;
}

export function getOrgContext(): string | null {
  return currentOrgId;
}

// Request interceptor: attach Bearer token & idempotency keys
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("reliastra_access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (["post", "put", "delete", "patch"].includes(config.method || "")) {
    config.headers["Idempotency-Key"] = crypto.randomUUID();
  }
  return config;
});

// Response interceptor: unwrap error envelopes + silent token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Unwrap backend error envelope
    if (error.response?.data) {
      const envelope = error.response.data as { error?: ApiError };
      if (envelope.error) {
        const beError = new BackendError(
          envelope.error.code,
          envelope.error.message,
          error.response.status,
          envelope.error.details
        );
        // If 401, try refresh before rejecting
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken =
            typeof window !== "undefined"
              ? localStorage.getItem("reliastra_refresh_token")
              : null;
          if (refreshToken) {
            try {
              const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken,
              });
              localStorage.setItem("reliastra_access_token", data.access_token);
              if (data.refresh_token)
                localStorage.setItem("reliastra_refresh_token", data.refresh_token);
              if (originalRequest.headers)
                originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
              return apiClient(originalRequest);
            } catch {
              /* refresh failed :  fall through to clear tokens */
            }
          }
          if (typeof window !== "undefined") {
            localStorage.removeItem("reliastra_access_token");
            localStorage.removeItem("reliastra_refresh_token");
            // Only redirect if not already on auth pages
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
                window.location.href = "/login";
              }
            }
          }
        }
        return Promise.reject(beError);
      }
    }

    // Network error or non-envelope error
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("reliastra_refresh_token")
          : null;
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem("reliastra_access_token", data.access_token);
          if (data.refresh_token)
            localStorage.setItem("reliastra_refresh_token", data.refresh_token);
          if (originalRequest.headers)
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return apiClient(originalRequest);
        } catch {
          /* refresh failed */
        }
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("reliastra_access_token");
        localStorage.removeItem("reliastra_refresh_token");
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
