"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/lib/adminStore";
import { apiFetch } from "@/lib/api";

export default function RidersPage() {
  const token = useAdminStore((s) => s.token);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<any[]>("/api/admin/riders", { headers: { Authorization: `Bearer ${token}` } });
        if (mounted) setRiders(res);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load riders");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 tracking-tight">Riders</h1>
      {error ? <div className="text-sm text-red-600 mb-3">{error}</div> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {riders.map((r) => (
          <div key={r?.id || r?._id} className="border rounded-lg p-3 bg-white hover:bg-gray-50">
            <div className="font-medium truncate">{r?.firstName} {r?.lastName}</div>
            <div className="text-xs text-gray-500">{r?.email}</div>
            <div className="text-xs mt-0.5">
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-gray-50">
                {r?.status || "unknown"}
              </span>
            </div>
          </div>
        ))}
      </div>
      {loading ? <div className="text-sm text-gray-500 mt-3">Loading...</div> : null}
      {!loading && riders.length === 0 ? <div className="text-sm text-gray-500">No riders found</div> : null}
    </div>
  );
}


