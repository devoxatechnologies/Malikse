import axios from "axios";
import { useAuthStore } from "../store/authStore";
import type { UserProfile } from "../types/auth.types";

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({ baseURL: API_URL });

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/login" && originalRequest.url !== "/auth/refresh") {
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        
        useAuthStore.getState().setTokens({ 
          accessToken: data.accessToken, 
          refreshToken: data.refreshToken 
        });

        originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
        
        processQueue(null, data.accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearSession();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async register(role: string, name: string, mobile: string, password?: string, email?: string) {
    const res = await api.post("/auth/register", { role, name, mobile, email, password });
    return res.data;
  },

  async login(mobile: string, password?: string) {
    const res = await api.post("/auth/login", { mobile, password });
    const { accessToken, refreshToken, user } = res.data;
    
    useAuthStore.getState().setTokens({ accessToken, refreshToken });
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setAuthState("AUTHENTICATED");
    
    return user;
  },

  async demoLogin(role: string) {
    try {
      const res = await api.post("/auth/demo-login", { role });
      const { accessToken, refreshToken, user } = res.data;
      useAuthStore.getState().setTokens({ accessToken, refreshToken });
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setAuthState("AUTHENTICATED");
      return user;
    } catch (e) {
      // Fallback if backend demo-login endpoint isn't reached
      useAuthStore.getState().setTokens({ accessToken: "dummy_access", refreshToken: "dummy_refresh" });
      useAuthStore.getState().setUser({
        id: "650000000000000000000001",
        role: role as any,
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        mobile: "9999999991",
        isVerifiedIdentity: true,
        createdAt: new Date().toISOString(),
      });
      useAuthStore.getState().setAuthState("AUTHENTICATED");
      return useAuthStore.getState().user;
    }
  },

  async getMe() {
    try {
      const res = await api.get("/auth/me");
      useAuthStore.getState().setUser(res.data);
      useAuthStore.getState().setAuthState("AUTHENTICATED");
      return res.data;
    } catch (e) {
      useAuthStore.getState().clearSession();
      throw e;
    }
  },

  async logout() {
    try {
      // Best effort backend logout to invalidate refresh token
      await api.post("/auth/logout");
    } catch (e) {
      console.warn("Backend logout failed, clearing local session anyway.");
    } finally {
      useAuthStore.getState().clearSession();
    }
  }
};

export default api;
