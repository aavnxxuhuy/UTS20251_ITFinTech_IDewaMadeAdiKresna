"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  description?: string; 
};

type CartCtx = {
  items: Item[];
  addItem: (item: Item) => Promise<void>;
  updateQty: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartCtx | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        setItems(data.items || []);
      } catch (err) {
        console.error("❌ load cart failed", err);
      }
    })();
  }, []);

  const addItem = async (item: Item) => {
    setItems(prev => {
      const exist = prev.find(p => p.id === item.id);
      return exist
        ? prev.map(p => (p.id === item.id ? { ...p, quantity: p.quantity + item.quantity } : p))
        : [...prev, item];
    });

    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.id, qty: item.quantity }),
    });
  };

  const updateQty = async (id: string, quantity: number) => {
    setItems(prev => prev.map(p => (p.id === id ? { ...p, quantity } : p)));
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, qty: quantity }),
    });
  };

  const removeItem = async (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: id, qty: 0 }),
    });
  };

  const clear = async () => {
    setItems([]);
    await fetch("/api/cart", { method: "DELETE" });
  };

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
};
