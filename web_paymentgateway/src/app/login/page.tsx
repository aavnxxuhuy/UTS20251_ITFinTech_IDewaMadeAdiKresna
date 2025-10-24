"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [otp, setOtp] = useState("");
  const [infoEmail, setInfoEmail] = useState("");
  const router = useRouter();

  const doLogin = async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.mfaRequired) {
        setMfaRequired(true);
        setInfoEmail(data.email);
      } else {
        router.push("/");
      }
    } else {
      alert(data.error || "Login failed");
    }
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: infoEmail || email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      router.push("/");
    } else {
      alert(data.error || "OTP verify failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-6 rounded-xl shadow">
        {!mfaRequired ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-black">Login</h2>
            <input className="input input-bordered w-full mb-3" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <input className="input input-bordered w-full mb-3" type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn btn-primary w-full" onClick={doLogin}>Login</button>
            <p className="text-sm mt-3 text-gray-800">Belum punya akun? <a href="/register" className="text-blue-600">Register</a></p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-black">Enter OTP</h2>
            <p className="text-sm mb-3 text-gray-800">OTP sudah dikirim ke WhatsApp nomor terdaftar.</p>
            <input className="input input-bordered w-full mb-3" placeholder="6-digit OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
            <button className="btn btn-primary w-full" onClick={verifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}
