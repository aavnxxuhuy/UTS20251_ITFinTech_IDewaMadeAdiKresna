"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-300 mt-10 border-t border-gray-300 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-bold text-lg mb-2">Tentang PrasmulEats</h3>
          <p className="text-sm">
            Platform belanja makanan online terbaik untuk mahasiswa dan umum.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">Navigasi</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/" className="hover:underline">Beranda</Link></li>
            <li><Link href="/orders" className="hover:underline">Orderan</Link></li>
            <li><Link href="/checkout" className="hover:underline">Checkout</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-2">Ikuti Kami</h3>
          <div className="flex space-x-4 text-sm">
            <Link href="https://www.instagram.com/prasmul" target="_blank" className="hover:text-pink-500">Instagram</Link>
            <Link href="https://x.com/prasmul?lang=en" target="_blank" className="hover:text-blue-400">Twitter</Link>
            <Link href="https://www.facebook.com/prasmul/" target="_blank" className="hover:text-blue-600">Facebook</Link>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700 py-4">
        © {new Date().getFullYear()} AAVNXX. All rights reserved.
      </div>
    </footer>
  );
}
