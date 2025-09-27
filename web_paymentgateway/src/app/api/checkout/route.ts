// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";    
import Xendit from "xendit-node";

export async function POST(req: Request) {
  await dbConnect();

  const { items } = await req.json();
  if (!items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items required" }, { status: 400 });
  }

  // hitung total (andalkan price sudah integer IDR)
  const total = items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0);

  // init xendit
  const x = new Xendit({ secretKey: process.env.XENDIT_API_KEY! });
  const { Invoice } = x;

  const external_id = `order-${Date.now()}`; // ID unik yang kita gunakan di Order.orderId

  let invoice;
  try {
    invoice = await Invoice.createInvoice({
      external_id,                                // snake_case untuk xendit-node v7
      amount: Math.round(total),                  // pastikan integer
      payer_email: "customer@example.com",        // gantikan dengan email sesungguhnya jika ada
      success_redirect_url: `${process.env.BASE_URL}/payment/success?orderId=${external_id}`,
      failure_redirect_url: `${process.env.BASE_URL}/payment/failed?orderId=${external_id}`,
    });
  } catch (err) {
    console.error("Xendit createInvoice error:", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }

  // simpan order di DB dengan mapping items
  const order = await Order.create({
    orderId: external_id,
    items: items.map((it: any) => ({
      productId: it.id ?? it.productId,
      name: it.name,
      price: it.price,
      qty: it.qty,
      image: it.image ?? ""
    })),
    total,
    status: (invoice?.status ?? "PENDING").toUpperCase(),
    xenditInvoiceId: invoice?.id ?? null,
  });

  return NextResponse.json({
    invoiceURL: invoice?.invoice_url,
    orderId: external_id,
  });
}
