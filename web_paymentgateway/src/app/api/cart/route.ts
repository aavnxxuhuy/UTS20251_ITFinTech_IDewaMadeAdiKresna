// app/api/cart/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Cart from "@/models/cart";

export async function GET() {
  await dbConnect();
  const cart = await Cart.findOne();
  return NextResponse.json(cart || { items: [] });
}

export async function POST(req: Request) {
  await dbConnect();
  const { productId, name, price, image, qty = 1 } = await req.json();
  if (!productId || !name) return NextResponse.json({ error: "productId & name required" }, { status: 400 });

  const cart = (await Cart.findOne()) || new Cart({ items: [] });
  const idx = cart.items.findIndex((i: any) => i.productId === productId);
  if (idx >= 0) {
    cart.items[idx].qty += qty;
  } else {
    cart.items.push({ productId, name, price, image, qty });
  }
  await cart.save();
  return NextResponse.json(cart);
}

export async function PATCH(req: Request) {
  await dbConnect();
  const { productId, qty } = await req.json();
  if (!productId || typeof qty !== "number") {
    return NextResponse.json({ error: "productId & qty required" }, { status: 400 });
  }

  const cart = (await Cart.findOne()) || new Cart({ items: [] });
  const idx = cart.items.findIndex((i: any) => i.productId === productId);

  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  if (qty <= 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = qty;
  }

  await cart.save();
  return NextResponse.json(cart);
}

export async function DELETE() {
  await dbConnect();
  await Cart.deleteMany({});
  return NextResponse.json({ success: true });
}
