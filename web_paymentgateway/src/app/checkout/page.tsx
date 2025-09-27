"use client";
import { useCart } from "../components/CartContext";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, updateQty, removeItem, clear } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const router = useRouter();
  useEffect(() => { 
      if (items.length === 0) {
      router.push("/");}
    }, [items, router]);

  // ===== Update qty di DB & context =====
  const changeQty = async (id: string, newQty: number) => {
    // update MongoDB
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, qty: newQty }),
    });
    // update context
    if (newQty <= 0) removeItem(id);
    else updateQty(id, newQty);
  };

  // ===== Hapus item dari DB & context =====
  const deleteItem = async (id: string) => {
    await fetch(`/api/cart?productId=${id}`, { method: "DELETE" });
    removeItem(id);
  };

  // ===== Checkout (bayar) =====
  const handleCheckout = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data?.invoiceURL) {
        // Optional: simpan orderId untuk referensi di halaman success
        localStorage.setItem("lastOrderId", data.orderId);
        // kosongkan cart di DB & context
        await fetch("/api/cart", { method: "DELETE" }); // sesuai API Anda
        clear();
        // redirect ke Xendit hosted invoice
        window.location.href = data.invoiceURL;
      } else {
        alert("Gagal membuat invoice");
      }
    } catch (err) {
      console.error(err);
      alert("Server error ketika membuat invoice");
    }
  };

  return (
    <div className="p-4 space-y-4">
      {items.map((i) => (
        <div
          key={i.id}
          className="grid grid-cols-4 md:grid-cols-6 gap-4 items-center border-b py-3
                     [grid-template-columns:1fr_2fr_1fr]"
        >
          {/* Gambar produk */}
          <div className="col-span-1 flex justify-center overflow-hidden">
            <img
              src={i.image}
              alt={i.name}
              className="w-20 h-20 object-cover rounded object-center"
            />
          </div>

          {/* Nama + Qty Controls */}
          <div className="col-span-2 md:col-span-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="font-semibold">{i.name}</span>
            <div className="flex items-center space-x-2 mt-2">
              {/* – */}
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => changeQty(i.id, i.qty - 1)}
              >
                –
              </button>

              <input
                type="number"
                className="w-14 text-center border rounded"
                value={i.qty}
                min={1}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) changeQty(i.id, val);
                }}
              />

              {/* + */}
              <button
                className="px-2 py-1 bg-gray-700 text-white rounded"
                onClick={() => changeQty(i.id, i.qty + 1)}
              >
                +
              </button>
              
              {/* Hapus item */}
              <button
                className="ml-2 text-red-500"
                onClick={() => deleteItem(i.id)}
              >
                ✕
              </button>

            </div>
          </div>

          {/* Total harga item */}
          <div className="col-span-1 text-right font-semibold">
            Rp.{(i.price * i.qty).toLocaleString("id-ID")}
          </div>
        </div>
      ))}

      {/* Ringkasan Total */}
      <div className="flex flex-col md:items-end md:text-right space-y-1 pt-4 border-t">
        <div className="flex justify-between md:justify-end md:space-x-4">
          <p>Subtotal:</p>
          <p className="font-medium">Rp.{subtotal.toLocaleString("id-ID")}</p>
        </div>
        <div className="flex justify-between md:justify-end md:space-x-4">
          <p>Pajak:</p>
          <p className="font-medium">Rp.{tax.toLocaleString("id-ID")}</p>
        </div>
        <div className="flex justify-between md:justify-end md:space-x-4 font-bold">
          <p>Total:</p>
          <p>Rp.{total.toLocaleString("id-ID")}</p>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        className="btn btn-primary w-full mt-4"
      >
        Lanjutkan ke Pembayaran →
      </button>
    </div>
  );
}