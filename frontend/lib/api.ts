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
    let errorMessage = `Request failed with ${res.status}`;
    try {
      const errorData = await res.json();
      // Handle different error response formats
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch {
      // If JSON parsing fails, try text
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch {
        // Use default error message
      }
    }
    throw new Error(errorMessage);
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
  addCartItem: (cartId: string, body: any) => apiFetch(`/api/carts/${cartId}/items`, { method: "POST", body }),
  updateCartItem: (cartId: string, itemId: string, body: any) => apiFetch(`/api/carts/${cartId}/items/${itemId}`, { method: "PATCH", body }),
  deleteCartItem: (cartId: string, itemId: string) => apiFetch(`/api/carts/${cartId}/items/${itemId}`, { method: "DELETE" }),
  checkout: (body: any) => apiFetch(`/api/orders/checkout`, { method: "POST", body }),
  initTopup: (body: any) => apiFetch(`/api/wallet/initializeTransaction`, { method: "POST", body }),
  registerDevice: (token: string) => apiFetch(`/api/notifications/registerDevice`, { method: "POST", body: { token } }),
  updateUser: (id: string, body: any) => apiFetch(`/api/user/${id}`, { method: "PATCH", body }),
  searchItems: (query: string) => apiFetch(`/api/items/search?q=${encodeURIComponent(query)}`),
  allVendorsWithItems: () => apiFetch(`/api/vendors/with-items`),
  
  // Enhanced Cart Management
  createCart: (body: { storeId: string }) => apiFetch(`/api/carts`, { method: "POST", body }),
  getCart: (userId: string) => apiFetch(`/api/carts/user/${userId}`),
  
  // Payment & Wallet
  createBankAccount: () => apiFetch(`/api/createBankAccount`, { method: "POST" }),
  refreshWallet: () => apiFetch(`/api/wallet/refresh`),
  walletWithdrawals: (body: any) => apiFetch(`/api/wallet/withdrawals`, { method: "POST", body }),
  getWalletTransactions: () => apiFetch(`/api/user/wallet/transactions`),
  getPendingWithdrawals: () => apiFetch(`/api/user/wallet/withdrawalRequests`),
  
  // Enhanced Order Management
  completeOrder: (id: string, code: string) => apiFetch(`/api/orders/${id}/complete`, { 
    method: "POST", 
    body: { code } 
  }),
  cancelOrder: (id: string) => apiFetch(`/api/orders/${id}/cancel`, { method: "PATCH" }),
  updateOrderProgress: (id: string, body: any) => apiFetch(`/api/orders/${id}/orderProgress`, { method: "PATCH", body }),
  
  // Coupons & Discounts
  getCoupons: () => apiFetch(`/api/coupons`),
  
  // Notifications
  registerDeviceToken: (body: { token: string; type: string }) => apiFetch(`/api/notifications/registerDevice`, { method: "POST", body }),
  
  // Card Management
  getCardAuthorizationUrl: (email: string, callbackUrl: string) => apiFetch(`/api/payment/cards/authorization`, { 
    method: "POST", 
    body: {
      email,
      amount: "10000", // ₦100 for card verification (in kobo)
      callback_url: callbackUrl,
      channels: ["card"],
      metadata: {
        purpose: "card_verification"
      }
    }
  }),
  verifyCardAndAdd: (reference: string) => apiFetch(`/api/payment/cards/verify/${reference}`),
  deleteCard: (cardId: number) => apiFetch(`/api/payment/cards/${cardId}`, { method: "DELETE" }),

  // Password Reset
  forgotPassword: (email: string) => apiFetch(`/api/auth/forgotPassword`, { 
    method: "POST", 
    body: { email } 
  }),
  resetPassword: (email: string, token: string, password: string) => apiFetch(`/api/auth/resetPassword`, { 
    method: "POST", 
    body: { email, token, password } 
  }),

  // Admin
  adminLogin: (key: string) => apiFetch<{ token: string }>(`/api/auth/admin/login`, { method: "POST", body: { key } }),
  adminStores: (token: string) => apiFetch(`/api/admin/stores`, { headers: { Authorization: `Bearer ${token}` } }),
  adminRiders: (token: string) => apiFetch(`/api/admin/riders`, { headers: { Authorization: `Bearer ${token}` } }),
  adminOrders: (token: string) => apiFetch(`/api/admin/orders`, { headers: { Authorization: `Bearer ${token}` } }),
  adminDeliveryServices: (token: string) => apiFetch(`/api/admin/deliveryServices`, { headers: { Authorization: `Bearer ${token}` } }),
};


