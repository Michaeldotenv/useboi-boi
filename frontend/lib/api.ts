import { BASE_URL } from "@/app/lib/endpoints";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponse<T> {
  data: T;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("boiboi_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: any; headers?: Record<string, string> } = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`.replace(/\/+$/, "").replace(/([^:])\/\//g, "$1/"), {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed with ${res.status}`);
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as T;
}

// Convenience helpers
export const api = {
  me: () => apiFetch("/api/user/me"),
  orders: () => apiFetch("/api/orders"),
  ordersByCustomer: (customerId: string) => apiFetch(`/api/orders?customerId=${encodeURIComponent(customerId)}`),
  order: (id: string) => apiFetch(`/api/orders/${id}`),
  walletTransactions: () => apiFetch(`/api/user/wallet/transactions`),
  vendors: () => apiFetch(`/api/vendors`),
  vendor: (id: string) => apiFetch(`/api/vendors/${id}`),
  vendorItems: (id: string) => apiFetch(`/api/vendors/${id}/items`),
  likeVendor: (id: string) => apiFetch(`/api/vendors/${id}/like`, { method: "POST" }),
  unlikeVendor: (id: string) => apiFetch(`/api/vendors/${id}/like`, { method: "DELETE" }),
  savedVendors: () => apiFetch(`/api/vendors/saved/me`),
  createSupportTicket: (body: { subject: string; message: string }) => apiFetch(`/api/support/tickets`, { method: "POST", body }),
  mySupportTickets: () => apiFetch(`/api/support/tickets`),
  cartItems: (id: string) => apiFetch(`/api/carts/${id}/items`),
  checkout: (body: any) => apiFetch(`/api/orders/checkout`, { method: "POST", body }),
  initTopup: (body: any) => apiFetch(`/api/wallet/initializeTransaction`, { method: "POST", body }),
  registerDevice: (token: string) => apiFetch(`/api/notifications/registerDevice`, { method: "POST", body: { token } }),
  updateUser: (id: string, body: any) => apiFetch(`/api/user/${id}`, { method: "PATCH", body }),
  searchItems: (query: string) => apiFetch(`/api/items/search?q=${encodeURIComponent(query)}`),
  allVendorsWithItems: () => apiFetch(`/api/vendors/with-items`),
};


