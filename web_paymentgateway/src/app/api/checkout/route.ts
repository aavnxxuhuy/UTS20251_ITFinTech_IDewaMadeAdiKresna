import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, subtotal, tax, shipping, total } = body;

    // Validasi sederhana
    if (!customer?.name || !customer?.email || !customer?.address) {
      return NextResponse.json(
        { error: "Data pelanggan tidak lengkap." },
        { status: 400 }
      );
    }

    // Buat ID unik untuk transaksi
    const externalId = `order-${Date.now()}-${crypto
      .randomBytes(4)
      .toString("hex")}`;

    // Hitung pajak & ongkir (fallback ke hardcode jika belum dikirim)
    const fixedShipping = 10000;
    const computedTax =
      tax ??
      Math.round(items.reduce((acc: number, i: { price: number; qty: number; }) => acc + i.price * i.qty, 0) * 0.1);
    const computedTotal = subtotal + computedTax + fixedShipping;

    // Kirim ke Xendit API
    const invoiceRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.XENDIT_SECRET_KEY + ":"
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: computedTotal,
        description: "Order Payment - E-Commerce Demo",
        currency: "IDR",
        payer_email: customer.email,
        customer: {
          given_names: customer.name,
          email: customer.email,
          mobile_number: customer.phone || "08123456789",
          addresses: [
            {
              city: "-",
              country: "Indonesia",
              postal_code: "-",
              state: "-",
              street_line1: customer.address,
            },
          ],
        },
        customer_notification_preference: {
          invoice_created: ["email"],
          invoice_reminder: ["email"],
          invoice_paid: ["email"],
          invoice_expired: ["email"],
        },
        items: [
          ...items.map((item: any) => ({
            name: item.name,
            quantity: item.qty,
            price: item.price,
          })),
          {
            name: "Ongkos Kirim",
            quantity: 1,
            price: fixedShipping,
          },
          {
            name: "Pajak (10%)",
            quantity: 1,
            price: computedTax,
          },
        ],
        success_redirect_url: `${process.env.BASE_URL}/payment/success`,
        failure_redirect_url: `${process.env.BASE_URL}/payment/fail`,
      }),
    });

    const invoice = await invoiceRes.json();

    if (!invoice.id) {
      console.error("Xendit Error:", invoice);
      return NextResponse.json(
        { error: "Gagal membuat invoice Xendit", detail: invoice },
        { status: 500 }
      );
    }

    // kirim response ke frontend
    return NextResponse.json({
      success: true,
      invoiceURL: invoice.invoice_url,
      orderId: externalId,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat membuat invoice" },
      { status: 500 }
    );
  }
}
