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
  updateQty: (id: string, qty: number) => Promise<void>;
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
        const serverItems = (data?.items || []).map((it: any) => ({
          id: it.productId,
          name: it.name,
          price: it.price,
          qty: it.qty,
          image: it.image,
          description: it.description || "",
        }));
        setItems(serverItems);
      } catch (err) {
        console.error("failed load cart", err);
      }
    })();
  }, []);

  const addItem = async (item: Item) => {
    setItems((prev) => {
      const exist = prev.find((p) => p.id === item.id);
      return exist
        ? prev.map((p) => (p.id === item.id ? { ...p, qty: p.quantity + item.quantity } : p))
        : [...prev, item];
    });

    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: item.quantity,
        }),
      });
    } catch (err) {
      console.error("failed persist addItem", err);
    }
  };

  const updateQty = async (id: string, qty: number) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));

    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, qty }),
      });
    } catch (err) {
      console.error("failed persist updateQty", err);
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id, qty: 0 }),
      });
    } catch (err) {
      console.error("failed persist removeItem", err);
    }
  };

  const clear = async () => {
    setItems([]);
    try {
      await fetch("/api/cart", { method: "DELETE" });
    } catch (err) {
      console.error("failed clear cart", err);
    }
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
