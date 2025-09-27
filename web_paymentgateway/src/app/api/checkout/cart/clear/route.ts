import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import Checkout from "@/models/checkout";

export async function POST(req: Request) {
  await dbConnect();
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ status: "ok" });
  await Checkout.deleteOne({ sessionId });
  return NextResponse.json({ status: "ok" });
}
