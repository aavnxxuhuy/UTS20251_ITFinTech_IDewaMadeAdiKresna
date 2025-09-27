// app/api/xendit/webhook/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";

export async function POST(req: Request) {
  await dbConnect();

  const token = req.headers.get("x-callback-token") || "";
  if (process.env.XENDIT_WEBHOOK_TOKEN && token !== process.env.XENDIT_WEBHOOK_TOKEN) {
    console.warn("Invalid webhook token", token);
    return NextResponse.json({ ok: false, error: "invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const external_id = body.external_id || body.externalId || body.externalID;
  const rawStatus = (body.status || "").toString().toUpperCase();

  if (!external_id) {
    console.warn("Webhook missing external_id", body);
    return NextResponse.json({ ok: false, error: "missing external_id" }, { status: 400 });
  }

  let mappedStatus = "PENDING";
  if (rawStatus === "PAID") mappedStatus = "PAID";
  else if (rawStatus === "EXPIRED" || rawStatus === "FAILED" || rawStatus === "CANCELLED") mappedStatus = "EXPIRED";
  else if (rawStatus === "PENDING") mappedStatus = "PENDING";
  else mappedStatus = rawStatus; // fallback

  await Order.findOneAndUpdate(
    { orderId: external_id },
    { status: mappedStatus, xenditInvoiceId: body.id },
    { new: true }
  );

  return NextResponse.json({ received: true });
}
