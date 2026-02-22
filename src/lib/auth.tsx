"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiRequestError } from "./api";
import type { User, LoginData, RegisterData, LoginResponse } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ROLE_HOME: Record<string, string> = {
  CUSTOMER: "/customer",
  SUPPLIER: "/supplier",
  ADMIN: "/admin",
  DRIVER: "/driver",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.post<LoginResponse>("/auth/refresh");
      api.setAccessToken(res.data.accessToken);
      setState({ user: res.data.user, loading: false });
    } catch {
      api.setAccessToken(null);
      setState({ user: null, loading: false });
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginData) => {
      const res = await api.post<LoginResponse>("/auth/login", data);
      api.setAccessToken(res.data.accessToken);
      setState({ user: res.data.user, loading: false });
      router.push(ROLE_HOME[res.data.user.role] || "/");
    },
    [router]
  );

  const register = useCallback(async (data: RegisterData) => {
    const res = await api.post<{ user: User }>("/auth/register", data);
    return { message: res.message || "Registration successful. Please verify your email." };
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore errors on logout
    }
    api.setAccessToken(null);
    setState({ user: null, loading: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function useRequireAuth(allowedRoles?: string[]) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push("/login");
    }
    if (
      !auth.loading &&
      auth.user &&
      allowedRoles &&
      !allowedRoles.includes(auth.user.role)
    ) {
      router.push(ROLE_HOME[auth.user.role] || "/");
    }
  }, [auth.loading, auth.user, allowedRoles, router]);

  return auth;
}

export { ApiRequestError };
