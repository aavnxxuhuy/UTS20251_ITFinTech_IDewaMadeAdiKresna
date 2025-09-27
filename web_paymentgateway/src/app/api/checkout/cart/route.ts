import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Checkout from "@/models/checkout";

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ items: [], total: 0 });
  const cart = await Checkout.findOne({ sessionId }).lean();
  return NextResponse.json(cart || { items: [], total: 0 });
}

export async function POST(req: Request) {
  await dbConnect();
  const { sessionId, items, total } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  const updated = await Checkout.findOneAndUpdate(
    { sessionId },
    { items, total },
    { upsert: true, new: true }
  );
  return NextResponse.json(updated);
}
