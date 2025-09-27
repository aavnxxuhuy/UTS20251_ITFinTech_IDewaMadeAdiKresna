// app/payment/page.tsx
"use client";
import { useCart } from "../components/CartContext";
import { useState } from "react";

export default function PaymentPage() {
  const { items, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const total = items.reduce((s, i) => s + i.price * i.qty, 0) * 1.1;

  const handleSubmit = async () => {
    if (!name || !email || !address) {
      alert("Lengkapi data diri");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: { name, email, address },
        items
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (data.invoiceURL) {
      // redirect langsung ke halaman pembayaran Xendit
      window.location.href = data.invoiceURL;
    } else {
      alert("Gagal membuat invoice");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Data Diri</h2>
      <input className="input input-bordered w-full mb-2"
             placeholder="Nama"
             value={name}
             onChange={(e) => setName(e.target.value)} />
      <input className="input input-bordered w-full mb-2"
             placeholder="Email"
             value={email}
             onChange={(e) => setEmail(e.target.value)} />
      <textarea className="textarea textarea-bordered w-full mb-2"
                placeholder="Alamat"
                value={address}
                onChange={(e) => setAddress(e.target.value)} />

      <button
        className="btn btn-primary w-full"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? "Membuat Link Pembayaran..." : "Lanjut ke Pembayaran Xendit"}
      </button>
    </div>
  );
}
