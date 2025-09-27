import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";

export async function POST(req: Request) {
  await dbConnect();
  const { items, subtotal, tax, shipping, total, customer, paymentMethod } = await req.json();

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }

  const externalId = `order-${Date.now()}`;

  const order = await Order.create({
    orderId: externalId,
    items,
    total, 
    status: "PENDING",
    paymentDetails: {
      paymentMethod,
      amount: total,
      payerEmail: customer?.email || "customer@example.com"
    }
  });

  const resp = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic " + Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64")
    },
    body: JSON.stringify({
      external_id: externalId,
      amount: total,
      payer_email: customer?.email || "customer@example.com",
      success_redirect_url: `${process.env.BASE_URL}/payment/success`,
      failure_redirect_url: `${process.env.BASE_URL}/payment/fail`
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Xendit create invoice error:", errText);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }

  const invoice = await resp.json().catch(err => {
    console.error("Failed to parse Xendit response:", err);
    return null;
  });
  console.log("Xendit invoice response:", invoice);

  order.xenditInvoiceId = invoice.id;
  await order.save();

  return NextResponse.json({ invoiceURL: invoice.invoice_url, orderId: order._id });
}
