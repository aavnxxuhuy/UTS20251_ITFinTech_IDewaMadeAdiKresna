import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";

export async function GET() {
  await dbConnect();
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}
