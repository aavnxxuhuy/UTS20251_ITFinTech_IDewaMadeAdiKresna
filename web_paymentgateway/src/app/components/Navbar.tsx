"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const pathname = usePathname(); // ✅ detect route changes

  // fetch user setiap route berubah
  useEffect(() => {
    setLoading(true); // start loading
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user || null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
        setUser(null);
      } finally {
        setLoading(false); // finish loading
      }
    })();
  }, [pathname]); // ✅ refresh setiap route berubah

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-sm px-4">
      <div className="flex-1 px-5">
        <Link href="/" className="font-bold text-lg">
          PrasmulEats
        </Link>
      </div>

      <div className="hidden md:flex flex-none px-5 space-x-4 items-center">
        {loading ? (
          <span className="text-sm">Loading...</span>
        ) : user ? (
          <>
            {user.isAdmin ? (
              <>
                {/* Admin view */}
                <Link href="/admin" className="btn btn-ghost">
                  Admin
                </Link>
                <Link href="/orders" className="btn btn-ghost">
                  Orderan
                </Link>
              </>
            ) : (
              <>
                {/* Regular user view */}
                <Link href="/orders" className="btn btn-ghost">
                  Orderan
                </Link>
                <Link href="/checkout" className="btn btn-ghost relative">
                  🛒
                  {count > 0 && (
                    <span className="badge badge-sm indicator-item">{count}</span>
                  )}
                </Link>
              </>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm">Hi, {user.name}</span>
              <button className="btn btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden flex-none">
        {loading ? (
          <span className="text-sm">...</span>
        ) : user ? (
          user.isAdmin ? (
            <Link href="/admin" className="btn btn-ghost">
              Admin
            </Link>
          ) : (
            <Link href="/checkout" className="btn btn-ghost">
              🛒
            </Link>
          )
        ) : (
          <Link href="/login" className="btn btn-ghost">
            🛒
          </Link>
        )}
      </div>
    </div>
  );
}