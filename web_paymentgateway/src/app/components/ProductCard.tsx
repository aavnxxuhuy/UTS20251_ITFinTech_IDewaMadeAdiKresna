"use client";
import { useCart } from "./CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  return (
    <div className="card bg-base-100 shadow-md">
      <figure className="aspect-square bg-gray-100" />
      <div className="card-body p-4">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-sm">{product.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold">${product.price}</span>
          <button
            className="btn btn-sm btn-primary"
            onClick={() =>
              addItem({ id: product.id, name: product.name, price: product.price, qty: 1 })
            }
          >
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
