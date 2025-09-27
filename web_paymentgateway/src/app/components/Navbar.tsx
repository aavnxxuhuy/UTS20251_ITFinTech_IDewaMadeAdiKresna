"use client";
import { useCart } from "./CartContext";
import Link from "next/link";
import { MouseEvent } from "react";


export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);

  const handleCheckoutClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (count === 0) {
      e.preventDefault(); // hentikan navigasi ke /checkout
      alert("Tolong masukkan produk terlebih dahulu, tidak ada produk dalam keranjang");
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1">
        <Link href="/" className="font-bold text-lg">Logo</Link>
      </div>
      <div className="flex-none">
        <Link href="/checkout" className="btn btn-ghost relative">
          🛒
          {count > 0 && (
            <span className="badge badge-sm indicator-item">{count}</span>
          )}
        </Link>
      </div>
    </div>
  );
}
