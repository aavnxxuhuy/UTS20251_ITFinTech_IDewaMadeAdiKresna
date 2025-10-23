"use client";
import { useCart } from "./CartContext";

export default function ProductCard({ product }: { product: any }) {
  const { addItem } = useCart();
  const handleAddToCart = async () => {
    await addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description || "",
      quantity: 1,
    });
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <figure className="aspect-square bg-gray-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title">{product.name}</h2>
        <p className="text-sm">{product.description}</p>
        <div className="flex justify-between items-center mt-2">
          <span className="font-semibold">Rp.{product.price}</span>
          <button className="btn btn-sm btn-primary" onClick={handleAddToCart}>
            Add +
          </button>
        </div>
      </div>
    </div>
  );
}
