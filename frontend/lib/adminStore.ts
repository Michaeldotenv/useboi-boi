import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api";

type AdminState = {
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  loading: boolean;
  error: string | null;
  // Data
  stores: any[];
  riders: any[];
  orders: any[];
  deliveryServices: any[];
  // Actions
  login: (key: string) => Promise<void>;
  logout: () => void;
  loadDashboard: () => Promise<void>;
  setHydrated: () => void;
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      loading: false,
      error: null,
      stores: [],
      riders: [],
      orders: [],
      deliveryServices: [],

      async login(key: string) {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch<{ token: string }>(
            "/api/auth/admin/login",
            { method: "POST", body: { key } }
          );
          const token = (res as any).token ?? (res as any).data?.token ?? (res as any).jwt ?? null;
          if (!token) throw new Error("Invalid response from server");
          set({ token, isAuthenticated: true, loading: false, error: null });
        } catch (e: any) {
          set({ loading: false, error: e?.message || "Login failed" });
          throw e;
        }
      },

      logout() {
        set({ token: null, isAuthenticated: false, stores: [], riders: [], orders: [], deliveryServices: [] });
      },

      setHydrated() {
        const token = get().token;
        set({ hasHydrated: true, isAuthenticated: !!token });
      },

      async loadDashboard() {
        const { token } = get();
        if (!token) throw new Error("Not authenticated");
        set({ loading: true, error: null });
        try {
          const headers = { Authorization: `Bearer ${token}` } as Record<string, string>;
          const [stores, riders, orders, deliveryServices] = await Promise.all([
            apiFetch<any[]>("/api/admin/stores", { headers }),
            apiFetch<any[]>("/api/admin/riders", { headers }),
            apiFetch<any[]>("/api/admin/orders", { headers }),
            apiFetch<any[]>("/api/admin/deliveryServices", { headers }),
          ]);
          set({ stores, riders, orders, deliveryServices, loading: false });
        } catch (e: any) {
          set({ loading: false, error: e?.message || "Failed to load admin data" });
        }
      },
    }),
    {
      name: "admin-store",
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export function getAdminRoleCounts(state: Pick<AdminState, "stores" | "riders">) {
  return {
    riders: state.riders?.length || 0,
    vendors: state.stores?.length || 0,
  };
}


