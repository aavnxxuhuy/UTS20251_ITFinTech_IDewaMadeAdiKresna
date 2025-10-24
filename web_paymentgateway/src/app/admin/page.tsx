"use client";
import useSWR from "swr";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminPage() {
  const router = useRouter();

  const [showOrders, setShowOrders] = useState<null | string>(null);
  const [showRevenueOrders, setShowRevenueOrders] = useState(false);
  const [chartType, setChartType] = useState<"daily" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);

  const query = new URLSearchParams();
  if (dateRange[0]) query.set("start", dateRange[0]);
  if (dateRange[1]) query.set("end", dateRange[1]);

  const { data, mutate } = useSWR(
    `/api/admin/summary?${query.toString()}`,
    (url) => fetch(url).then((r) => r.json())
  );

  useEffect(() => {
    if (data?.error) router.push("/login");
  }, [data, router]);

  if (!data) return <p>Loading...</p>;

  const {
    totalProducts = 0,
    orderStatusCounts = {},
    totalRevenue = 0,
    orders = [],
  } = data;

  const chartLabels =
    chartType === "daily"
      ? Array.from({ length: 31 }, (_, i) => `Day ${i + 1}`)
      : [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];

  const chartDataValues = chartLabels.map((label) => {
    if (!orders) return 0;
    if (chartType === "daily") {
      const day = parseInt(label.split(" ")[1], 10);
      return orders
        .filter(
          (o: any) =>
            o.status === "PAID" &&
            new Date(o.createdAt).getDate() === day &&
            (!dateRange[0] ||
              new Date(o.createdAt) >= new Date(dateRange[0])) &&
            (!dateRange[1] || new Date(o.createdAt) <= new Date(dateRange[1]))
        )
        .reduce((sum: number, o: any) => sum + o.total, 0);
    } else {
      const monthIdx = chartLabels.indexOf(label);
      return orders
        .filter(
          (o: any) =>
            o.status === "PAID" &&
            new Date(o.createdAt).getMonth() === monthIdx &&
            (!dateRange[0] ||
              new Date(o.createdAt) >= new Date(dateRange[0])) &&
            (!dateRange[1] || new Date(o.createdAt) <= new Date(dateRange[1]))
        )
        .reduce((sum: number, o: any) => sum + o.total, 0);
    }
  });

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Revenue",
        data: chartDataValues,
        backgroundColor: "rgba(34,197,94,0.6)",
      },
    ],
  };

  const renderOrderItem = (item: any) => {
    const productName = item.productId?.name || "Unknown";
    const quantity = item.quantity || 0;
    return `${productName} x ${quantity}`;
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-4 bg-white rounded shadow cursor-pointer"
          onClick={() => router.push("/admin/products")}
        >
          <div className="text-lg text-gray-500">Total Products</div>
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-2xl font-bold text-black">
                {totalProducts}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-lg text-gray-500">Orders</div>
          <div className="">
            <div
              className="flex justify-between cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => setShowOrders("all")}
            >
              <span className="text-2xl font-bold text-black">
                {orders?.length ?? "..."}
              </span>
            </div>
          </div>
        </div>

        <div
          className="p-4 bg-white rounded shadow cursor-pointer"
          onClick={() => setShowRevenueOrders(true)}
        >
          <div className="text-lg text-gray-500">Total Revenue</div>
          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span className="text-2xl font-bold text-black">
                Rp {totalRevenue.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl text-black font-semibold mb-4">Omset / Total Pembelian</h2>
        <div className="flex gap-2 mb-4">
          <button
            className={`btn btn-sm text-black ${
              chartType === "daily" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setChartType("daily")}
          >
            Harian
          </button>
          <button
            className={`btn btn-sm text-black ${
              chartType === "monthly" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setChartType("monthly")}
          >
            Bulanan
          </button>
        </div>
        <Bar data={chartData} />
      </div>

      {/* Modal Orders */}
      {showOrders && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded shadow w-11/12 md:w-2/3 max-h-[80vh] overflow-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setShowOrders(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black">Orders: {showOrders}</h2>
            {orders.map((o: any) => {
              let bgColor = "bg-gray-100"; // default
              if (o.status === "PAID") bgColor = "bg-green-100";
              else if (o.status === "PENDING") bgColor = "bg-yellow-100";
              else if (o.status === "CANCEL") bgColor = "bg-red-100";

              return (
                <div
                  key={o._id}
                  className={`p-2 border-b rounded mb-1 text-black ${bgColor}`}
                >
                  <div className="font-semibold">{o.orderId}</div>
                  {o.user && (
                    <p className="text-sm text-gray-500">
                      Pembeli: {o.user.name} ({o.user.email})
                    </p>
                  )}
                  <div className="text-sm">
                    {o.items.map(renderOrderItem).join(", ")}
                  </div>
                  <div className="font-bold">
                    Rp {o.total.toLocaleString("id-ID")}
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    Status: {o.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Revenue */}
      {showRevenueOrders && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white p-6 rounded shadow w-11/12 md:w-2/3 max-h-[80vh] overflow-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold text-lg"
              onClick={() => setShowRevenueOrders(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-black">Paid Orders</h2>
            {orders
              .filter((o: any) => o.status === "PAID")
              .map((o: any) => (
                <div key={o._id} className="p-2 border-b text-black">
                  <div className="font-semibold">{o.orderId}</div>
                  {o.user && (
                    <p className="text-sm text-gray-500">
                      Pembeli: {o.user.name} ({o.user.email})
                    </p>
                  )}
                  <div className="text-sm">
                    {o.items.map(renderOrderItem).join(", ")}
                  </div>
                  <div className="font-bold">
                    Rp {o.total.toLocaleString("id-ID")}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
