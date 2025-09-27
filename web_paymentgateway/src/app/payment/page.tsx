"use client";
import { useCart } from "../components/CartContext";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function PaymentPage() {
  const { items, clear } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  //statement untuk metode pembayaran
  const [paymentMethod, setPaymentMethod] = useState(""); 
  const [loading, setLoading] = useState(false);

  // ongkir tetap
  const shipping = 10000; 
  
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax + shipping;

  const router = useRouter();


  const handleSubmit = async () => {
    if (!name || !email || !address) {
      alert("Lengkapi semua data diri!");
      return;
    }
    if (!paymentMethod) {
      alert("Pilih metode pembayaran!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, email, address },
          items,
          subtotal,
          tax,
          shipping,
          total,
          paymentMethod
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.invoiceURL) {
        localStorage.setItem("lastOrderId", data.orderId);
        // kosongkan cart
        clear(); 
        // redirect ke Xendit
        window.location.href = data.invoiceURL;
      } else {
        alert("Checkout gagal, silakan dicoba lagi");
        console.error("Errornya kenapa sih", data);
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Terjadi kesalahan server");
    }
  };

  return (
    <div className="p-4 space-y-6 max-w-xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">Data Diri & Alamat</h2>
        <input
          className="input input-bordered w-full"
          placeholder="Nama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="input input-bordered w-full"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Alamat"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold">Metode Pembayaran</h2>
        <div
          className={`flex items-center p-3 border rounded cursor-pointer transition-colors duration-200
            ${
              paymentMethod === "XENDIT"
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400"
                : "border-gray-300 dark:border-gray-600 dark:bg-gray-800"
            }`}
          onClick={() => setPaymentMethod("XENDIT")}
        >
          <div
            className={`w-5 h-5 mr-3 rounded-full border flex items-center justify-center transition-colors duration-200
              ${
                paymentMethod === "XENDIT"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400 dark:border-gray-500 bg-gray-200 dark:bg-gray-700"
              }`}
          >
            {paymentMethod === "XENDIT" && (
              <div className="w-2 h-2 bg-white rounded-full" />
            )}
          </div>
          <span className={`font-medium ${paymentMethod === "XENDIT" ? "text-black dark:text-white" : "text-gray-700 dark:text-gray-200"}`}>
            Xendit
          </span>
        </div>
      </div>


      <div className="space-y-2 border-t pt-4">

        <h2 className="text-xl font-bold">Ringkasan Pesanan</h2>

        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>Rp.{subtotal.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between">
          <span>Pajak (10%):</span>
          <span>Rp.{tax.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between">
          <span>Ongkir:</span>
          <span>Rp.{shipping.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between font-bold">
          <span>Total Keseluruhan:</span>
          <span>Rp.{total.toLocaleString("id-ID")}</span>
        </div>


        <div className="mt-2">
          {items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <span>{i.name} x{i.qty}</span>
              <span>Rp.{(i.price * i.qty).toLocaleString("id-ID")}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-primary w-full mt-4"
      >
        {loading ? "Membuat Link Pembayaran..." : "Lanjut ke Pembayaran Xendit"}
      </button>
    </div>
  );
}
