"use client";
import { useCart } from "../components/CartContext";
import { useState } from "react";

export default function PaymentPage() {
  const { items, clear } = useCart();
  const [method, setMethod] = useState("card");
  const total = items.reduce((s, i) => s + i.price * i.qty, 0) * 1.1;

  const handlePay = () => {
    alert(`Paid $${total.toFixed(2)} with ${method}`);
    clear();
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="font-bold mb-2">Shipping Address</h2>
        <div className="bg-gray-100 h-16 rounded"></div>
      </div>
      <div>
        <h2 className="font-bold mb-2">Payment Method</h2>
        {["card", "paypal", "other"].map((m) => (
          <label key={m} className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              className="radio"
              checked={method === m}
              onChange={() => setMethod(m)}
            />
            {m === "card" ? "Credit/Debit Card" : m === "paypal" ? "PayPal" : "Other"}
          </label>
        ))}
      </div>
      <div>
        <h2 className="font-bold mb-2">Order Summary</h2>
        <p>Total: ${total.toFixed(2)}</p>
      </div>
      <button className="btn btn-primary w-full" onClick={handlePay}>
        Confirm & Pay
      </button>
    </div>
  );
}
