"use client";
import { useEffect, useState } from "react";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  status: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  xenditInvoiceId?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then(res => res.json())
      .then(data => {
        setOrders(data);
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
      <h1 className="text-2xl font-bold mb-4">Orderan Saya</h1>

      {orders.length === 0 && <p>Belum ada orderan.</p>}

      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 mb-4 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{order.orderId}</span>
            <span
              className={`px-2 py-1 rounded text-sm font-medium ${
                order.status === "PAID"
                  ? "bg-green-100 text-green-700"
                  : order.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {order.items.length > 0 ? (
            <div className="space-y-2 mb-2">
              {order.items.map((item, idx) => (
                <div
                  key={`${order._id}-${item.productId}-${idx}`}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span>
                      {item.name} x {item.qty}
                    </span>
                  </div>
                  <span>Rp.{(item.price * item.qty).toLocaleString("id-ID")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-2">Tidak ada item</p>
          )}

          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total:</span>
            <span>Rp.{order.total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
