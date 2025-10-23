// app/api/orders/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";
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

  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}
