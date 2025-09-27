"use client";
import { useState } from "react";
import ProductCard from "./ProductCard";

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: "Makanan Ringan" | "Minuman" | "Bundle";
};

const categories = ["All", "Makanan Ringan", "Minuman", "Bundle"];

export default function ProductList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCat === "All" || p.category === activeCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input input-bordered w-full md:w-1/2"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-full border transition ${
              activeCat === cat
                ? "bg-primary text-white border-primary"
                : "bg-base-100 text-base-content border-gray-300 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
