"use client";
import ProductList from "./components/ProductList";

const mockProducts = [
  { id: "1", name: "Drink A", price: 3.2, description: "Refreshing drink", category: "Minuman" as const },
  { id: "2", name: "Snack B", price: 5.0, description: "Tasty snack", category: "Makanan Ringan" as const },
  { id: "3", name: "Bundle C", price: 9.9, description: "Combo pack", category: "Bundle" as const },
];

export default function ProductsPage() {
  return <ProductList products={mockProducts} />;
}