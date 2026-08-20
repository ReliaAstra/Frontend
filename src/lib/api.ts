import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { DEMO_FLAG, getDemoMock } from "./demo";

// Live production backend; NEXT_PUBLIC_API_URL overrides for local dev
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://reliastra-backend.zevcloud.app/v1";

// Demo mode helper — true when user opened the offline demo workspace
export function isDemoMode(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(DEMO_FLAG) === "true";
  } catch {
    return false;
  }
}

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

/**
 * Cursor-paginated envelope returned by list endpoints on the live API.
 * The backend exposes both `items` (flat) and `data` (nested) representations;
 * we normalise to the flat one.
 */
export interface PaginatedResponse<T> {
  items: T[];
  next_cursor: string | null;
  has_more: boolean;
  total?: number | null;
  page?: number | null;
  size?: number | null;
  pages?: number | null;
}

/** Unwrap a paginated list response to its item array, tolerating array fallbacks. */
export function unwrapItems<T>(data: PaginatedResponse<T> | T[] | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

/** FastAPI validation error item (HTTP 422) */
interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** Convert any axios error payload into a BackendError. */
function toBackendError(error: AxiosError): BackendError {
  const status = error.response?.status ?? 0;
  const data = error.response?.data as
    | { error?: ApiError; detail?: string | ValidationErrorItem[]; message?: string }
    | undefined;

  // 1. Standard error envelope
  if (data?.error && isApiError(data.error)) {
    return new BackendError(data.error.code, data.error.message, status, data.error.details);
  }

  // 2. FastAPI HTTPException with string detail
  if (typeof data?.detail === "string") {
    return new BackendError(`HTTP_${status || "ERROR"}`, data.detail, status);
  }

  // 3. FastAPI validation error array (422)
  if (Array.isArray(data?.detail)) {
    const first = data.detail[0];
    const field = first?.loc?.filter((l) => l !== "body" && l !== "query").join(".") || "";
    const msg = first?.msg ? (field ? `${field}: ${first.msg}` : first.msg) : "Validation error";
    return new BackendError("VALIDATION_ERROR", msg, status, { errors: data.detail });
  }

  // 4. Plain { message }
  if (typeof data?.message === "string") {
    return new BackendError(`HTTP_${status || "ERROR"}`, data.message, status);
  }

  // 5. Network / CORS / timeout
  if (error.code === "ECONNABORTED") {
    return new BackendError("TIMEOUT", "The request timed out. Please try again.", 0);
  }
  if (!error.response) {
    return new BackendError(
      "NETWORK_ERROR",
      "Unable to reach the Reliastra API. Please check your connection and try again.",
      0
    );
  }

  return new BackendError(`HTTP_${status}`, error.message || "Unexpected error", status);
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Track org context: set by AuthProvider after session load.
// The live API resolves the org from the bearer token, so this is kept
// for UI state (e.g. query keys) rather than URL construction.
let currentOrgId: string | null = null;

export function setOrgContext(orgId: string | null) {
  currentOrgId = orgId;
}

export function getOrgContext(): string | null {
  return currentOrgId;
}

// ── Token storage helpers ─────────────────────────────────────────────────

export const TOKEN_KEYS = {
  access: "reliastra_access_token",
  refresh: "reliastra_refresh_token",
} as const;

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.access);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEYS.refresh);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

// Request interceptor: attach Bearer token & idempotency keys
// Demo mode: short-circuit network with offline mocks so the dashboard is usable with no backend
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (isDemoMode()) {
    try {
      const mockData = getDemoMock({
        url: config.url,
        method: config.method,
        params: (config as any).params,
        data: config.data,
      });
      if (mockData !== undefined) {
        // Attach a custom adapter that resolves immediately with the mock — no network call
        (config as any).adapter = async () => ({
          data: mockData,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
        return config;
      }
    } catch {
      // fall through to normal flow if mock fails
    }
  }

  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (["post", "put", "delete", "patch"].includes(config.method || "")) {
    try {
      config.headers["Idempotency-Key"] = crypto.randomUUID();
    } catch {
      config.headers["Idempotency-Key"] = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
  }
  return config;
});

// Track whether a refresh is in-flight so parallel 401s only refresh once
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    localStorage.setItem(TOKEN_KEYS.access, data.access_token);
    if (data.refresh_token) localStorage.setItem(TOKEN_KEYS.refresh, data.refresh_token);
    return data.access_token as string;
  } catch {
    return null;
  }
}

function redirectToLogin() {
  if (typeof window === "undefined") return;
  const currentPath = window.location.pathname;
  if (!currentPath.startsWith("/login") && !currentPath.startsWith("/register")) {
    window.location.href = "/login";
  }
}

// Response interceptor: unwrap error envelopes + silent token refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // In demo mode never attempt token refresh or redirect — it's fully offline
    if (isDemoMode()) {
      return Promise.reject(toBackendError(error));
    }

    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Attempt a single silent refresh on 401 before rejecting
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      }
      // Refresh failed: clear session and redirect to login (app pages only)
      clearTokens();
      redirectToLogin();
    }

    return Promise.reject(toBackendError(error));
  }
);

export default apiClient;
