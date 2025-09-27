import { CartProvider } from "./components/CartContext";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = { title: "E-Commerce Demo" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main className="mx-auto w-full">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
};