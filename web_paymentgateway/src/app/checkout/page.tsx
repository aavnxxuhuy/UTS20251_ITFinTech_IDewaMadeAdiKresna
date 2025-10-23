"use client";
import { useCart } from "../components/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, updateQty, removeItem } = useCart();

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;


  // Update kuantitas di DB
  const changeQty = async (id: string, newQty: number) => {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, qty: newQty }),
    });
    // update context
    if (newQty <= 0) removeItem(id);
    else updateQty(id, newQty);
  };

  //  Hapus item dari DB keranjang
  const deleteItem = async (id: string) => {
    await fetch(`/api/cart?productId=${id}`, { method: "DELETE" });
    removeItem(id);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4">
      <div className="flex-1">
        {items.length === 0 ? (
          <>
            <div className="flex items-center justify-center h-full text-gray-400 text-xl">
              Keranjang Kosong! Silakan isi barang terlebih dahulu.
            </div>
            <Link
              href="/"
              className="flex items-center justify-center px 2 h-full"
            >
              <div
                className="mt-4 inline-block cursor-pointer underline px-3 py-1 rounded transition-colors duration-200
                  text-gray-600 dark:text-gray-300
                  hover:text-white dark:hover:text-black
                  hover:bg-blue-500 dark:hover:bg-yellow-400">
                Kembali ke beranda
              </div>
            </Link>
          </>
        ) : (
          <div className="space-y-4">
            {items.map((i) => (
              <div
                key={i.id}
                className="grid grid-cols-4 md:grid-cols-6 gap-4 items-center border-b py-3 [grid-template-columns:1fr_2fr_1fr]"
              >
                <div className="col-span-1 flex justify-center overflow-hidden">
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-20 h-20 object-cover rounded object-center"
                  />
                </div>
                <div className="col-span-2 md:col-span-4 flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="font-semibold">{i.name}</span>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-700 text-white rounded"
                      onClick={() => changeQty(i.id, i.quantity - 1)}
                    >
                      –
                    </button>
                    <input
                      type="number"
                      className="w-14 text-center border rounded"
                      value={i.quantity}
                      min={1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) changeQty(i.id, val);
                      }}
                    />
                    <button
                      className="px-2 py-1 bg-gray-700 text-white rounded"
                      onClick={() => changeQty(i.id, i.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="col-span-1 text-right font-semibold">
                  Rp.{(i.price * i.quantity).toLocaleString("id-ID")}
                </div>
              </div>
            ))}

            <div className="flex flex-col md:items-end md:text-right space-y-1 pt-4 border-t">
              <div className="flex justify-between md:justify-end md:space-x-4">
                <p>Subtotal:</p>
                <p className="font-medium">
                  Rp.{subtotal.toLocaleString("id-ID")}
                </p>
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

            <Link href="/payment">
              <button className="btn btn-primary w-full">
                Lanjut ke Pembayaran →
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
