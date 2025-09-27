import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";

export async function GET(req: Request, { params }: any) {
  await dbConnect();
  const order = await Order.findOne({ orderId: params.orderId }).lean();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}
