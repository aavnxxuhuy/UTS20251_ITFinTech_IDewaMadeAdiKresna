"use client";
import ProductList from "./components/ProductList";
import useSWR from "swr";


export default function ProductsPage() {
  const { data } = useSWR("/api/products", (url) => fetch(url).then(r => r.json()));
  if (!data) return <p>Loading...</p>;
  return <ProductList products={data} />;
}