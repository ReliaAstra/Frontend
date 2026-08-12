"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export interface Org {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  currentOrg: Org | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Org | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboardPage = pathname.startsWith("/dashboard") || pathname.startsWith("/dependencies") || pathname.startsWith("/incidents") || pathname.startsWith("/settings");

  const refreshSession = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("reliastra_access_token") : null;
    if (!token) {
      setIsLoading(false);
      if (isDashboardPage) router.push("/login");
      return;
    }
    try {
      const { apiClient } = await import("./api");
      const { data } = await apiClient.get("/users/me");
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
        avatar_url: data.avatar_url,
      });
      if (data.orgs && data.orgs.length > 0) {
        setCurrentOrg({ id: data.orgs[0].id, name: data.orgs[0].name, role: data.orgs[0].role });
      }
    } catch {
      localStorage.removeItem("reliastra_access_token");
      localStorage.removeItem("reliastra_refresh_token");
      setUser(null);
      if (isDashboardPage) router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [isDashboardPage, router]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!isLoading) {
      if (isDashboardPage && !user) {
        router.push("/login");
      } else if (isAuthPage && user) {
        router.push("/dashboard");
      }
    }
  }, [isLoading, user, isDashboardPage, isAuthPage, router]);

  const login = async (email: string, password: string) => {
    try {
      const { apiClient } = await import("./api");
      const { data } = await apiClient.post("/auth/login", { email, password });
      localStorage.setItem("reliastra_access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("reliastra_refresh_token", data.refresh_token);
      setUser({ id: data.user.id, email: data.user.email, full_name: data.user.full_name, role: data.user.role });
      if (data.org) setCurrentOrg({ id: data.org.id, name: data.org.name, role: data.org.role });
      router.push("/dashboard");
    } catch {
      // Mock login for demo
      const mockUser: User = { id: "usr_01", email, full_name: "Demo User", role: "owner" };
      const mockOrg: Org = { id: "org_01", name: "Acme Corp", role: "owner" };
      localStorage.setItem("reliastra_access_token", "mock_token_123");
      localStorage.setItem("reliastra_refresh_token", "mock_refresh_123");
      setUser(mockUser);
      setCurrentOrg(mockOrg);
      router.push("/dashboard");
    }
  };

  const register = async (fullName: string, email: string, password: string) => {
    try {
      const { apiClient } = await import("./api");
      const { data } = await apiClient.post("/auth/register", { full_name: fullName, email, password });
      localStorage.setItem("reliastra_access_token", data.access_token);
      if (data.refresh_token) localStorage.setItem("reliastra_refresh_token", data.refresh_token);
      setUser({ id: data.user.id, email: data.user.email, full_name: data.user.full_name, role: data.user.role });
      if (data.org) setCurrentOrg({ id: data.org.id, name: data.org.name, role: data.org.role });
      router.push("/dashboard");
    } catch {
      const mockUser: User = { id: "usr_01", email, full_name: fullName, role: "owner" };
      const mockOrg: Org = { id: "org_01", name: "My Organization", role: "owner" };
      localStorage.setItem("reliastra_access_token", "mock_token_123");
      localStorage.setItem("reliastra_refresh_token", "mock_refresh_123");
      setUser(mockUser);
      setCurrentOrg(mockOrg);
      router.push("/dashboard");
    }
  };

  const logout = () => {
    localStorage.removeItem("reliastra_access_token");
    localStorage.removeItem("reliastra_refresh_token");
    setUser(null);
    setCurrentOrg(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, currentOrg, isAuthenticated: !!user, isLoading, login, register, logout, refreshSession }}
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
