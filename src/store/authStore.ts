/**
 * MalikSe — Auth Store (JWT-backed, localStorage persisted)
 */
import { create } from "zustand";
import type { UserProfile, AuthTokens, UserRole } from "../types/auth.types";

// Simple helpers to persist tokens across page reloads without any middleware
const storage = {
  get: (key: string) => {
    try { return typeof window !== "undefined" ? JSON.parse(localStorage.getItem(key) || "null") : null; }
    catch { return null; }
  },
  set: (key: string, value: any) => {
    try { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  },
  remove: (key: string) => {
    try { if (typeof window !== "undefined") localStorage.removeItem(key); }
    catch {}
  }
};

interface AuthStore {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  authState: "NOT_AUTHENTICATED" | "AUTHENTICATED" | "LOADING";
  role: UserRole | null;

  setUser: (user: UserProfile | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  setAuthState: (state: "NOT_AUTHENTICATED" | "AUTHENTICATED" | "LOADING") => void;
  clearSession: () => void;
}

// Rehydrate from localStorage on startup
const savedToken = storage.get("malikse_access");
const savedRefresh = storage.get("malikse_refresh");
const savedUser = storage.get("malikse_user");

export const useAuthStore = create<AuthStore>((set) => ({
  user: savedUser,
  accessToken: savedToken,
  refreshToken: savedRefresh,
  authState: savedToken && savedUser ? "AUTHENTICATED" : "NOT_AUTHENTICATED",
  role: savedUser?.role ?? null,

  setUser: (user) => {
    storage.set("malikse_user", user);
    set({ user, role: user?.role ?? null });
  },
  setTokens: ({ accessToken, refreshToken }) => {
    storage.set("malikse_access", accessToken);
    storage.set("malikse_refresh", refreshToken);
    set({ accessToken, refreshToken });
  },
  setAuthState: (authState) => set({ authState }),
  clearSession: () => {
    storage.remove("malikse_access");
    storage.remove("malikse_refresh");
    storage.remove("malikse_user");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      authState: "NOT_AUTHENTICATED",
      role: null,
    });
  },
}));
