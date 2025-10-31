"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminStore } from "@/lib/adminStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, token, hasHydrated, logout, setHydrated } = useAdminStore();

  useEffect(() => {
    // mark hydrated on client mount
    setHydrated();
    if (!hasHydrated) return;
    if (!isAuthenticated || !token) {
      router.replace("/admin/login");
    }
  }, [hasHydrated, isAuthenticated, token, router, setHydrated]);

  const nav = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/vendors", label: "Vendors" },
    { href: "/admin/riders", label: "Riders" },
    { href: "/admin/orders", label: "Orders" },
    { href: "/admin/delivery-services", label: "Delivery Services" },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr] bg-gray-50">
      <aside className="hidden md:block border-r p-4 space-y-2 bg-white">
        <div className="text-lg font-semibold mb-2">Useboi Admin</div>
        <nav className="flex flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${active ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-h-screen">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="md:hidden font-semibold">Useboi Admin</div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  router.replace("/admin/login");
                }}
                className="px-3 py-1.5 rounded-lg text-sm border hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}


