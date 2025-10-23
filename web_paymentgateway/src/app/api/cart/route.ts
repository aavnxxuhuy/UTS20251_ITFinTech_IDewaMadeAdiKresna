// app/api/cart/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/cart";
import User from "@/models/user";
import { verifyToken } from "@/lib/jwt";

async function getUserFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("token="));
  const token = match ? match.split("=")[1] : null;
  if (!token) return null;

  const payload: any = verifyToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.sub).select("_id name email");
  return user;
}

export async function GET(req: Request) {
  await dbConnect();
  
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cart = await Cart.findOne({ user: user._id }).populate("items.productId");
  return NextResponse.json(cart || { items: [] });
}

export async function POST(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, name, price, image, qty = 1 } = await req.json();
  if (!productId || !name)
    return NextResponse.json({ error: "productId & name required" }, { status: 400 });

  let cart = await Cart.findOne({ user: user._id });
  if (!cart) cart = new Cart({ user: user._id, items: [] });

  const idx = cart.items.findIndex((i: any) => i.productId === productId);
  if (idx >= 0) {
    cart.items[idx].quantity += qty; // gunakan quantity
  } else {
    cart.items.push({ productId, name, price, image, quantity: qty }); // gunakan quantity
  }

  await cart.save();
  return NextResponse.json(cart);
}

export async function PATCH(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, qty } = await req.json();
  if (!productId || typeof qty !== "number")
    return NextResponse.json({ error: "productId & qty required" }, { status: 400 });

  let cart = await Cart.findOne({ user: user._id });
  if (!cart) cart = new Cart({ user: user._id, items: [] });

  const idx = cart.items.findIndex((i: any) => i.productId === productId);
  if (idx === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  if (qty <= 0) cart.items.splice(idx, 1);
  else cart.items[idx].quantity = qty; // gunakan quantity

  await cart.save();
  return NextResponse.json(cart);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const user = await getUserFromCookie(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await Cart.deleteOne({ user: user._id });
  return NextResponse.json({ success: true });
}
