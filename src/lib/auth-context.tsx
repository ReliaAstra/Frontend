"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  Suspense,
  type ReactNode,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { apiClient, BackendError, setOrgContext } from "./api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar_url: string | null;
  auth_provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: string;
  has_agency_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: Org | null;
  memberRole: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  registerError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, orgName?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  clearErrors: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Paths that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/dependencies", "/incidents", "/settings", "/clients", "/evidence"];
// Paths that are auth pages (should redirect away if already logged in)
const AUTH_PATHS = ["/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <_AuthProviderInner>{children}</_AuthProviderInner>
    </Suspense>
  );
}

function _AuthProviderInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isDashboardPage = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  // Restore session from stored tokens
  const refreshSession = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("reliastra_access_token") : null;
    if (!token) {
      setIsLoading(false);
      if (isDashboardPage) router.push("/login");
      return;
    }
    try {
      // 1. Get user profile
      const { data: userData } = await apiClient.get<User>("/users/me");
      setUser(userData);

      // 2. Get user's organizations
      const { data: orgsData } = await apiClient.get<Org[]>("/orgs");
      if (orgsData && orgsData.length > 0) {
        const org = orgsData[0];
        setCurrentOrg(org);
        setOrgContext(org.id);

        // 3. Get member role for this org
        try {
          const { data: members } = await apiClient.get<OrgMember[]>(`/orgs/${org.id}/members`);
          const myMembership = members.find((m) => m.user_id === userData.id);
          if (myMembership) {
            setMemberRole(myMembership.role);
          }
        } catch {
          // Role fetch failed :  continue without role
        }
      }
    } catch {
      localStorage.removeItem("reliastra_access_token");
      localStorage.removeItem("reliastra_refresh_token");
      setUser(null);
      setCurrentOrg(null);
      setMemberRole(null);
      setOrgContext(null);
      if (isDashboardPage) router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [isDashboardPage, router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      if (isDashboardPage && !user) {
        const returnTo = encodeURIComponent(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""));
        router.push(`/login?returnTo=${returnTo}`);
      } else if (isAuthPage && user) {
        // Redirect to intended destination or dashboard
        const returnTo = searchParams?.get("returnTo");
        router.push(returnTo || "/dashboard");
      }
    }
  }, [isLoading, user, isDashboardPage, isAuthPage, router, pathname, searchParams]);

  const clearErrors = () => {
    setLoginError(null);
    setRegisterError(null);
  };

  const login = async (email: string, password: string) => {
    clearErrors();
    try {
      const { data } = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>("/auth/login", { email, password });

      localStorage.setItem("reliastra_access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("reliastra_refresh_token", data.refresh_token);

      // Fetch user + org context after login
      const { data: userData } = await apiClient.get<User>("/users/me");
      setUser(userData);

      const { data: orgsData } = await apiClient.get<Org[]>("/orgs");
      if (orgsData && orgsData.length > 0) {
        const org = orgsData[0];
        setCurrentOrg(org);
        setOrgContext(org.id);
      }

      // Navigate to returnTo or dashboard
      const returnTo = searchParams?.get("returnTo");
      router.push(returnTo || "/dashboard");
    } catch (err) {
      if (err instanceof BackendError) {
        if (err.status === 401) {
          setLoginError("Invalid email or password.");
        } else if (err.status === 429) {
          setLoginError("Too many login attempts. Please wait a moment and try again.");
        } else {
          setLoginError(err.message);
        }
      } else {
        setLoginError("Unable to connect to the server. Please check your connection and try again.");
      }
      throw err;
    }
  };

  const register = async (fullName: string, email: string, password: string, orgName?: string) => {
    clearErrors();
    try {
      const { data } = await apiClient.post<{
        access_token: string;
        refresh_token: string;
        token_type: string;
        expires_in: number;
      }>("/auth/register", {
        full_name: fullName,
        email,
        password,
        org_name: orgName || null,
      });

      localStorage.setItem("reliastra_access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("reliastra_refresh_token", data.refresh_token);

      // Fetch user + org context after register
      const { data: userData } = await apiClient.get<User>("/users/me");
      setUser(userData);

      const { data: orgsData } = await apiClient.get<Org[]>("/orgs");
      if (orgsData && orgsData.length > 0) {
        const org = orgsData[0];
        setCurrentOrg(org);
        setOrgContext(org.id);
      }

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof BackendError) {
        if (err.status === 409) {
          setRegisterError("An account with this email already exists.");
        } else if (err.status === 422) {
          setRegisterError("Please check your input. Password must be at least 8 characters.");
        } else if (err.status === 429) {
          setRegisterError("Too many registration attempts. Please wait a moment and try again.");
        } else {
          setRegisterError(err.message);
        }
      } else {
        setRegisterError("Unable to connect to the server. Please check your connection and try again.");
      }
      throw err;
    }
  };

  const logout = async () => {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("reliastra_refresh_token") : null;
    // Best-effort revoke refresh token on server
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout", { refresh_token: refreshToken });
      } catch {
        // Ignore :  we're clearing local state anyway
      }
    }
    localStorage.removeItem("reliastra_access_token");
    localStorage.removeItem("reliastra_refresh_token");
    setUser(null);
    setCurrentOrg(null);
    setMemberRole(null);
    setOrgContext(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentOrg,
        memberRole,
        isAuthenticated: !!user,
        isLoading,
        loginError,
        registerError,
        login,
        register,
        logout,
        refreshSession,
        clearErrors,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
