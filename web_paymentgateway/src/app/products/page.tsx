"use client";
import useSWR from "swr";
import ProductList from "../components/ProductList";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function ProductsPage() {
  const { data, error } = useSWR("/api/products", fetcher);

  if (error) return <p>Failed to load products</p>;
  if (!data) return <p>Loading products...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Our Products</h1>
      <ProductList products={data} />
    </div>
  );
}
