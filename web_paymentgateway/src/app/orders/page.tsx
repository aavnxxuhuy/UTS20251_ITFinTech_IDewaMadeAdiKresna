// app/orders/page.tsx
"use client";
import { useEffect, useState } from "react";

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface OrderUser {
  name: string;
  email: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser; // ada jika admin
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders", { credentials: "include" })
      .then(res => res.json())
      .then((data) => {
        if (data?.error) {
          console.error("orders error:", data);
          setOrders([]);
        } else {
          setOrders(Array.isArray(data) ? data : []);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-8 text-center">Memuat orderan...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Orderan</h1>

      {orders.length === 0 && <p>Belum ada orderan.</p>}

      {orders.map((order, orderIdx) => (
        <div key={`${order._id}-${orderIdx}`} className="border rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{order.orderId}</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              order.status === "PAID"
                ? "bg-green-100 text-green-700"
                : order.status === "PENDING"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}>
              {order.status}
            </span>
          </div>

          {/* Info pembeli kalau ada */}
          {order.user && (
            <p className="text-sm text-gray-500 mb-2">
              Pembeli: {order.user.name} ({order.user.email})
            </p>
          )}

          {/* Daftar item */}
          {order.items && order.items.length > 0 ? (
            <div className="space-y-2 mb-2">
              {order.items.map((item, idx) => (
                <div key={`${order._id}-${item.productId || idx}`} className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name || "Product"}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span>
                      {item.name || "Unknown"} x {item.quantity}
                    </span>
                  </div>
                  <span>Rp.{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-2">Tidak ada item</p>
          )}

          {/* Total */}
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total:</span>
            <span>Rp.{(Number(order.total) || 0).toLocaleString("id-ID")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
