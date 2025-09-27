"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const params = useSearchParams();
  const orderId = params?.get("orderId") || localStorage.getItem("lastOrderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    let mounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (mounted) setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const iv = setInterval(fetchStatus, 5000); // poll every 5s
    return () => { mounted = false; clearInterval(iv); };
  }, [orderId]);

  if (!orderId) return <div>Order ID tidak ditemukan.</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Status Pembayaran</h1>
      {loading ? <p>Memeriksa status...</p> : (
        <div className="mt-4">
          <p>Order: <strong>{orderId}</strong></p>
          <p>Status: <strong>{order?.status}</strong></p>
          <p>Total: Rp.{order?.total?.toLocaleString("id-ID")}</p>
          {order?.status === "PAID" ? (
            <div className="text-green-600">Pembayaran berhasil — terima kasih!</div>
          ) : (
            <div className="text-red-600">Belum terbayar / kadaluarsa</div>
          )}
        </div>
      )}
    </div>
  );
}
