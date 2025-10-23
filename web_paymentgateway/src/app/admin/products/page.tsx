// app/admin/products/page.tsx
"use client";
import useSWR from "swr";
import { useState } from "react";

export default function AdminProducts() {
  const { data, mutate } = useSWR("/api/admin/products", (url)=>fetch(url).then(r=>r.json()));
  const [form, setForm] = useState({ name: "", price: "", description: "", image: "" });

  const add = async () => {
    await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ ...form }) });
    mutate();
    setForm({ name: "", price: "", description: "", image: "" });
  };

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      <div className="mb-6 bg-white p-4 rounded shadow">
        <input className="input input-bordered w-full mb-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} />
        <input className="input input-bordered w-full mb-2" placeholder="Price" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} />
        <input className="input input-bordered w-full mb-2" placeholder="Image URL" value={form.image} onChange={(e)=>setForm({...form, image:e.target.value})} />
        <textarea className="textarea textarea-bordered w-full mb-2" placeholder="Description" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} />
        <button className="btn btn-primary" onClick={add}>Add Product</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((p:any)=>(
          <div key={p._id} className="bg-white p-4 rounded shadow">
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded mb-2" />
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm">Rp.{p.price}</div>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-sm">Edit</button>
              <button className="btn btn-sm btn-ghost" onClick={async ()=>{ await fetch(`/api/admin/products/${p._id}`, { method: "DELETE" }); mutate(); }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
