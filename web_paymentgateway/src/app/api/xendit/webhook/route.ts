import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  // body example: { id, external_id, status, ... }

  // Verifikasi header callback token (opsional, gunakan callback-token di dashboard)
  // const token = req.headers.get("x-callback-token");
  // if (token !== process.env.XENDIT_CALLBACK_TOKEN) return NextResponse.json({}, { status: 403 });

  const { external_id, status } = body;

  // Map status Xendit → status DB
  let newStatus = "PENDING";
  if (status === "PAID") newStatus = "PAID";
  else if (status === "EXPIRED") newStatus = "EXPIRED";
  else if (status === "FAILED") newStatus = "FAILED";

  await Order.findOneAndUpdate(
    { orderId: external_id },
    { status: newStatus },
    { new: true }
  );

  return NextResponse.json({ success: true });
}
