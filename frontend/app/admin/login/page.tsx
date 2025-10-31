"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminLoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAdminStore((s) => s.login);
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(key.trim());
      router.replace("/admin");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // If already authenticated (e.g., after refresh), go to dashboard
  if (isAuthenticated) {
    // Avoid flicker: client-only navigation
    if (typeof window !== "undefined") router.replace("/admin");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter Admin Key"
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}


