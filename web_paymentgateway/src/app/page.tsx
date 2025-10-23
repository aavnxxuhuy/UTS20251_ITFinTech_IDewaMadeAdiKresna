"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [user, setUser] = useState<any>(undefined);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      const data = await res.json();

      if (data.user) {
        setUser(data.user);
        if (data.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/products");
        }
      } else {
        setUser(null);
      }
    })();
  }, [router]);

  // Sementara loading
  if (user === undefined) {
    return <p>Loading...</p>;
  }

  // Jika belum login
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold">Welcome to PrasmulEats</h1>
          <p className="text-gray-600">Shop tasty food & drinks</p>
          <div className="space-x-3">
            <a href="/login" className="btn btn-outline">
              Login
            </a>
            <a href="/register" className="btn btn-primary">
              Register
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User sudah login → sedang redirect
  return <p>Redirecting...</p>;
}
