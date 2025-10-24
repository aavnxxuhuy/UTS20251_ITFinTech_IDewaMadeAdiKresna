"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const doRegister = async () => {
    if (password !== confirmPassword) return alert("Passwords don't match");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, confirmPassword })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Registration success. Please login.");
      router.push("/login");
    } else {
      alert(data.error || "Register failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-black">Register (Buyer)</h2>
        <input className="input input-bordered w-full mb-2" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="input input-bordered w-full mb-2" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="input input-bordered w-full mb-2" placeholder="Phone ex :(628...)" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        <input className="input input-bordered w-full mb-2" placeholder="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <input className="input input-bordered w-full mb-4" placeholder="Confirm password" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={doRegister}>Register</button>
      </div>
    </div>
  );
}
