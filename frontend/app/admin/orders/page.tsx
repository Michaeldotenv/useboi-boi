"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminStore } from "@/lib/adminStore";
import { apiFetch } from "@/lib/api";

export default function OrdersPage() {
  const token = useAdminStore((s) => s.token);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<any[]>("/api/admin/orders", { headers: { Authorization: `Bearer ${token}` } });
        if (mounted) setOrders(res);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load orders");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [token]);

  const activeCustomers = useMemo(() => {
    const s = new Set<string>();
    for (const o of orders) {
      const id = (o?.customerId || o?.customerID || o?.customer?.id || "").toString();
      if (id) s.add(id);
    }
    return s.size;
  }, [orders]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Orders</h1>
        <div className="text-sm text-gray-600">Active customers (from orders): {activeCustomers}</div>
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="space-y-2">
        {orders.map((o) => (
          <div key={o?.id || o?._id} className="border rounded-lg p-3 bg-white flex items-center justify-between hover:bg-gray-50">
            <div className="truncate">
              <div className="text-sm font-medium truncate">{o?.code || o?._id}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-gray-50">
                  {o?.status}
                </span>
              </div>
            </div>
            <div className="text-sm font-medium">₦{Number(o?.totalPrice || 0).toLocaleString()}</div>
          </div>
        ))}
      </div>
      {loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
      {!loading && orders.length === 0 ? <div className="text-sm text-gray-500">No orders found</div> : null}
    </div>
  );
}


