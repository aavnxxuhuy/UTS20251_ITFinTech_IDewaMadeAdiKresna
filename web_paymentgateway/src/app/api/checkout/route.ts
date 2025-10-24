import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user";
import Order from "@/models/orders";
import { verifyToken } from "@/lib/jwt";
import { sendWhatsAppNotification } from "@/lib/waService";
import { sendEmail } from "@/lib/email"; // <-- import email helper

async function getUserFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const tokenPair = cookie.split(";").map(s => s.trim()).find(s => s.startsWith("token="));
  const token = tokenPair ? tokenPair.split("=")[1] : null;
  if (!token) return null;

  const payload: any = verifyToken(token);
  if (!payload) return null;

  const user = await User.findById(payload.sub).select("_id name email phone");
  return user;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { customer, items, subtotal, tax, shipping, total } = body;

    if (!customer?.name || !customer?.email || !customer?.address) {
      return NextResponse.json({ error: "Data pelanggan tidak lengkap." }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Daftar produk kosong." }, { status: 400 });
    }

    const user = await getUserFromCookie(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const externalId = `order-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const fixedShipping = shipping || 10000;
    const computedTax = tax ?? Math.round(subtotal * 0.1);
    const computedTotal = total ?? subtotal + computedTax + fixedShipping;

    const newOrder = await Order.create({
      user: user._id,
      orderId: externalId,
      items: items.map((i: any) => ({
        productId: i.productId || i.id,
        quantity: i.quantity,
        price: i.price,
      })),
      total: computedTotal,
      status: "PENDING",
    });

    console.log("email customer:", customer.email, "user email:", user.email);
    console.log(externalId, "Order created:", newOrder);

    // Buat invoice Xendit
    const invoiceRes = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(process.env.XENDIT_SECRET_KEY + ":").toString("base64")}`,
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
          mobile_number: user.phone || "08123456789",
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
        items: [
          ...items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          { name: "Ongkos Kirim", quantity: 1, price: fixedShipping },
          { name: "Pajak (10%)", quantity: 1, price: computedTax },
        ],
        success_redirect_url: `${process.env.BASE_URL}/payment/success`,
        failure_redirect_url: `${process.env.BASE_URL}/payment/fail`,
        customer_notification: true,
      }),
    });

    const invoice = await invoiceRes.json();
    if (!invoice.id) {
      console.error("Xendit Error:", invoice);
      return NextResponse.json({ error: "Gagal membuat invoice Xendit", detail: invoice }, { status: 500 });
    }

    console.log("Invoice URL:", invoice.invoice_url);

    // ✅ Kirim WhatsApp
    const waMessage = `Halo ${user.name}, pesanan Anda dengan kode *${externalId}* telah dibuat dengan total Rp${computedTotal.toLocaleString(
      "id-ID"
    )}. Silakan lakukan pembayaran melalui link berikut:\n${invoice.invoice_url}\n\nTerima kasih telah berbelanja!`;

    await sendWhatsAppNotification(user.phone || "08123456789", waMessage);

    // ✅ Kirim Email
    const emailHtml = `
      <p>Halo ${user.name},</p>
      <p>Pesanan Anda dengan kode <b>${externalId}</b> telah dibuat.</p>
      <p>Total: Rp${computedTotal.toLocaleString("id-ID")}</p>
      <p>Silakan lakukan pembayaran melalui <a href="${invoice.invoice_url}">link ini</a>.</p>
      <p>Terima kasih telah berbelanja di PrasmulEats!</p>
    `;

    try {
      await sendEmail(customer.email, `Invoice Pesanan ${externalId}`, emailHtml);
      console.log("Email invoice sent to", customer.email);
    } catch (err) {
      console.error("Failed to send email:", err);
    }

    return NextResponse.json({
      success: true,
      invoiceURL: invoice.invoice_url,
      orderId: externalId,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan saat membuat invoice" }, { status: 500 });
  }
}
