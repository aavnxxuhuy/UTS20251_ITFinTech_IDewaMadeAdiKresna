"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function FailedPage() {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
      return;
    }

    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="p-8 text-center">

      <h1 className="text-2xl font-bold">Pembayaran Gagal ❌</h1>

      <p className="my-2">Silakan ulangi transaksi Anda.</p>

      <div
        onClick={() => router.push("/")}
        className="mt-4 inline-block cursor-pointer underline px-3 py-1 rounded transition-colors duration-200
          text-gray-600 dark:text-gray-300
          hover:text-white dark:hover:text-black
          hover:bg-blue-500 dark:hover:bg-yellow-400">
        Kembali ke beranda dalam {countdown} detik...
      </div>

    </div>
  );
}