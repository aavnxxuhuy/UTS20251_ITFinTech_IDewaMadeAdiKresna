// app/admin/page.tsx
"use client";
import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const { data, error } = useSWR("/api/admin/summary", (url)=>fetch(url).then(r=>r.json()));

  useEffect(()=> {
    if (error && (error as any).status === 401) router.push("/login");
  }, [error, router]);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Products</div>
          <div className="text-2xl font-bold">{data.totalProducts}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Pending Orders</div>
          <div className="text-2xl font-bold">{data.pendingOrders}</div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Total Revenue</div>
          <div className="text-2xl font-bold">Rp {data.totalRevenue.toLocaleString("id-ID")}</div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Manage Products</h2>
        <a href="/admin/products" className="btn btn-primary">Go to Products</a>
      </div>
    </div>
  );
}
