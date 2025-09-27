"use client";
import { createContext, useContext, useState } from "react";

type Item = { id: string; name: string; price: number; qty: number };
type CartCtx = {
  items: Item[];
  addItem: (item: Item) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);
  const addItem = (item: Item) =>
    setItems((prev) => {
      const exist = prev.find((p) => p.id === item.id);
      return exist
        ? prev.map((p) =>
            p.id === item.id ? { ...p, qty: p.qty + item.qty } : p
          )
        : [...prev, item];
    });

  const updateQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
