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
    <div className="py-6 px-8 max-w-7xl mx-auto">

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="input input-bordered w-full md:w-1/2"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`
              px-4 py-2 rounded-full border transition
              ${activeCat === cat
                ? "bg-blue-500 text-white border-blue-500 dark:bg-gray-800 dark:text-white"
                : "bg-base-100 text-base-content border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}
