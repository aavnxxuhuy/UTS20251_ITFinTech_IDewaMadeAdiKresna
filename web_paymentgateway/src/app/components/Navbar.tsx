"use client";
import { useCart } from "./CartContext";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const [open, setOpen] = useState(false);


  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1 px-5">
        <Link href="/" className="font-bold text-lg">PrasmulEats</Link>
      </div>



      <div className="hidden md:flex flex-none px-5 space-x-4 items-center">
        <Link href="/orders" className="btn btn-ghost">Orderan</Link>
        <Link href="/checkout" className="btn btn-ghost relative">
          🛒
          {count > 0 && <span className="badge badge-sm indicator-item">{count}</span>}
        </Link>
      </div>



      <div className="md:hidden flex-none">
        <button className="btn btn-square btn-ghost" onClick={() => setOpen(!open)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute top-16 right-4 bg-base-100 shadow-lg rounded-lg p-4 flex flex-col space-y-2 md:hidden z-50">
          <Link href="/" className="btn btn-ghost w-full" onClick={() => setOpen(false)}>Beranda</Link>
          <Link href="/orders" className="btn btn-ghost w-full" onClick={() => setOpen(false)}>Orderan</Link>
          <Link href="/checkout" className="btn btn-ghost w-full" onClick={() => setOpen(false)}>Checkout</Link>
        </div>
      )}
    </div>
  );
}