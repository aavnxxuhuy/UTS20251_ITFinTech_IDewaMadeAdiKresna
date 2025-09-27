"use client";
import { useCart } from "../components/CartContext";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, updateQty } = useCart();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="p-4 space-y-4">
      {items.map((i) => (
        <div key={i.id} className="flex justify-between items-center border-b py-2">
          <span>{i.name}</span>
          <div className="flex items-center space-x-2">
            <button className="btn btn-xs" onClick={() => updateQty(i.id, Math.max(1, i.qty - 1))}>-</button>
            <span>{i.qty}</span>
            <button className="btn btn-xs" onClick={() => updateQty(i.id, i.qty + 1)}>+</button>
            <span className="font-semibold">${i.price * i.qty}</span>
          </div>
        </div>
      ))}
      <div className="text-right">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <p className="font-bold">Total: ${total.toFixed(2)}</p>
      </div>
      <Link href="/payment" className="btn btn-primary w-full">
        Continue to Payment →
      </Link>
    </div>
  );
}
