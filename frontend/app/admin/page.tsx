"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore, getAdminRoleCounts } from "@/lib/adminStore";

function StatCard({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="rounded-xl border p-5 shadow-sm bg-white hover:shadow-md transition-shadow">
			<div className="text-sm text-gray-500">{label}</div>
			<div className="text-3xl font-semibold mt-1 tracking-tight">{value}</div>
		</div>
	);
}

export default function AdminDashboardPage() {
	const router = useRouter();
	const { isAuthenticated, token, hasHydrated, loadDashboard, stores, riders, orders, deliveryServices, loading, error } = useAdminStore();

	useEffect(() => {
		if (!hasHydrated) return;
		if (!isAuthenticated || !token) {
			router.replace("/admin/login");
			return;
		}
		loadDashboard();
	}, [hasHydrated, isAuthenticated, token, loadDashboard, router]);

	const { vendors, riders: ridersCount } = getAdminRoleCounts({ stores, riders });

	const ordersByStatus = orders.reduce<Record<string, number>>((acc, o: any) => {
		const st = (o?.status || "unknown").toString();
		acc[st] = (acc[st] || 0) + 1;
		return acc;
	}, {});

	const activeCustomers = (() => {
		const set = new Set<string>();
		for (const o of orders) {
			const cid = (o?.customerId || o?.customerID || o?.customer?.id || "").toString();
			if (cid) set.add(cid);
		}
		return set.size;
	})();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
				<button
					onClick={() => router.refresh()}
					className="px-3 py-2 rounded-lg border hover:bg-gray-50"
				>
					Refresh
				</button>
			</div>

			{error ? (
				<div className="text-red-600 text-sm">{error}</div>
			) : null}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<StatCard label="Vendors" value={vendors} />
				<StatCard label="Riders" value={ridersCount} />
				<StatCard label="Delivery Services" value={deliveryServices?.length || 0} />
				<StatCard label="Total Orders" value={orders?.length || 0} />
				<StatCard label="Active Customers" value={activeCustomers} />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="rounded-xl border p-5 bg-white">
					<h2 className="font-medium mb-3">Orders by status</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{Object.entries(ordersByStatus).map(([k, v]) => (
							<div key={k} className="rounded-lg border p-4">
								<div className="text-sm text-gray-500">{k}</div>
								<div className="text-xl font-semibold">{v}</div>
							</div>
						))}
						{Object.keys(ordersByStatus).length === 0 ? (
							<div className="text-sm text-gray-500">No orders yet</div>
						) : null}
					</div>
				</div>

				<div className="rounded-xl border p-5 bg-white">
					<h2 className="font-medium mb-3">Recent orders</h2>
					<div className="space-y-2 max-h-[420px] overflow-auto pr-1">
						{orders.slice(0, 20).map((o: any) => (
							<div key={o?.id || o?._id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50">
								<div className="truncate">
									<div className="text-sm font-medium truncate">{o?.code || o?._id}</div>
									<div className="text-xs text-gray-500">
										<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-gray-50">
											{o?.status}
										</span>
									</div>
								</div>
								<div className="text-sm font-medium">₦{Number(o?.totalPrice || 0).toLocaleString()}</div>
							</div>
						))}
						{orders.length === 0 ? (
							<div className="text-sm text-gray-500">No orders to show</div>
						) : null}
					</div>
				</div>
			</div>

			<div className="rounded-xl border p-5 bg-white">
				<h2 className="font-medium mb-3">Vendors</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
					{stores.slice(0, 9).map((s: any) => (
						<div key={s?.id || s?._id} className="border rounded-lg p-3 hover:bg-gray-50">
							<div className="font-medium truncate">{s?.name || s?.storeName}</div>
							<div className="text-xs text-gray-500">
								<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide bg-gray-50">
									{s?.status || "unknown"}
								</span>
							</div>
						</div>
					))}
					{stores.length === 0 ? (
						<div className="text-sm text-gray-500">No vendors yet</div>
					) : null}
				</div>
			</div>

			{loading ? <div className="text-sm text-gray-500">Loading...</div> : null}
		</div>
	);
}


