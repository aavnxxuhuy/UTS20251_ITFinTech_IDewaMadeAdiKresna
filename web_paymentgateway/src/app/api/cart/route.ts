// app/api/cart/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/cart";
import Product from "@/models/products";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

async function getUserFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const tokenPair = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("token="));
  const token = tokenPair ? tokenPair.split("=")[1] : null;
  if (!token) return null;

  const payload: any = verifyToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.sub).select("_id name email");
  return user;
}

// 🔹 GET — ambil isi keranjang
export async function GET(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await Cart.findOne({ user: user._id }).populate("items.productId");

  if (!cart) return NextResponse.json({ items: [] });

  // Format ulang hasil populate agar frontend dapat field lengkap
  const formattedItems = cart.items.map((i: any) => ({
    id: i.productId._id.toString(),
    name: i.productId.name,
    image: i.productId.image,
    price: i.productId.price,
    quantity: i.quantity,
  }));

  return NextResponse.json({ items: formattedItems });
}

// 🔹 POST — tambah produk ke keranjang
export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, qty = 1 } = await req.json();

  const product = await Product.findById(productId);
  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  let cart = await Cart.findOne({ user: user._id });
  if (!cart) cart = new Cart({ user: user._id, items: [] });

  const idx = cart.items.findIndex(
    (i: any) => i.productId.toString() === productId
  );
  if (idx >= 0) cart.items[idx].quantity += qty;
  else cart.items.push({ productId: product._id, quantity: qty });

  await cart.save();

  return NextResponse.json({ success: true });
}

// 🔹 PATCH — ubah jumlah item
export async function PATCH(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, qty } = await req.json();
  if (!productId || typeof qty !== "number")
    return NextResponse.json({ error: "productId & qty required" }, { status: 400 });

  const cart = await Cart.findOne({ user: user._id });
  if (!cart) return NextResponse.json({ error: "Cart not found" }, { status: 404 });

  const idx = cart.items.findIndex((i: { productId: { toString: () => any; }; }) => i.productId.toString() === productId);
  if (idx === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  if (qty <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = qty;

  await cart.save();
  return NextResponse.json({ success: true });
}

// 🔹 DELETE — hapus seluruh cart user
export async function DELETE(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await Cart.deleteOne({ user: user._id });
  return NextResponse.json({ success: true });
}
