// api/xendit/webhook.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";
import { sendWhatsAppNotification } from "@/lib/waService";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("Xendit Webhook payload:", body);

    const external_id = body.external_id || body.data?.external_id;
    const status = body.status || body.data?.status;
    const invoiceId = body.id || body.data?.id;

    if (!external_id || !status) {
      console.log("Webhook missing external_id or status:", body);
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    let newStatus = "PENDING";
    if (status === "PAID" || status === "SUCCEEDED") newStatus = "PAID";
    else if (status === "EXPIRED") newStatus = "EXPIRED";
    else if (status === "CANCELLED" || status === "FAILED") newStatus = "CANCELLED";

    const order = await Order.findOneAndUpdate(
      { orderId: external_id },
      {
        status: newStatus,
        xenditInvoiceId: invoiceId,
        paymentDetails: {
          ...body,
        },
      },
      { new: true }
    ).populate("user", "name email phone");

    if (!order) {
      console.log("Order not found for external_id:", external_id);
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    console.log("Order updated via webhook:", order);

    // Ambil items dari raw_payload
    const rawPayload = body.payment_details?.[0]?.payment_response?.raw_invoice_payload || body.data?.payment_details?.[0]?.payment_response?.raw_invoice_payload;
    const xenditItems = rawPayload?.items || [];

    const shippingFee = rawPayload?.shipping_amount || 0;
    const taxAmount = rawPayload?.tax_amount || 0;
    const totalAmount = rawPayload?.amount || body.amount || body.data?.amount || 0;

    // 🔹 Kirim WA
    if (order.user?.phone) {
      let itemsText = xenditItems.map((i: any) => `${i.name} (${i.quantity}) Rp${(i.price || 0).toLocaleString("id-ID")}`).join("\n");
      let waMessage = `Halo ${order.user.name}, status pesanan Anda dengan kode *${order.orderId}* kini: *${newStatus}*.\n\n${itemsText}\n\nOngkir: Rp${shippingFee.toLocaleString("id-ID")}\nPajak: Rp${taxAmount.toLocaleString("id-ID")}\nTotal: Rp${totalAmount.toLocaleString("id-ID")}`;

      if (newStatus === "PAID") {
        waMessage += "\n\nTerima kasih telah melakukan pembayaran! Pesanan Anda sedang diproses.";
      }

      await sendWhatsAppNotification(order.user.phone, waMessage);
    }

    // Buat email HTML
    const itemsHtml = xenditItems.map((i: any) => `
      <tr>
        <td style="padding:5px 10px;">${i.name}</td>
        <td style="padding:5px 10px; text-align:center;">${i.quantity}</td>
        <td style="padding:5px 10px; text-align:right;">Rp${(i.price || 0).toLocaleString("id-ID")}</td>
      </tr>
    `).join("");

    const emailHtml = `
      <div style="font-family:sans-serif; max-width:600px; margin:auto; padding:20px; border:1px solid #ddd; border-radius:8px;">
        <h2 style="text-align:center;">PrasmulEats</h2>
        <p>Halo ${order.user.name},</p>
        <p>Status pesanan Anda dengan kode <b>${order.orderId}</b> kini: <b>${newStatus}</b>.</p>

        <table style="width:100%; border-collapse: collapse; margin-top:15px;">
          <thead>
            <tr style="background:#f5f5f5;">
              <th style="padding:5px 10px; text-align:left;">Produk</th>
              <th style="padding:5px 10px; text-align:center;">Qty</th>
              <th style="padding:5px 10px; text-align:right;">Harga</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding:5px 10px; text-align:right;">Ongkir</td>
              <td style="padding:5px 10px; text-align:right;">Rp${shippingFee.toLocaleString("id-ID")}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:5px 10px; text-align:right;">Pajak</td>
              <td style="padding:5px 10px; text-align:right;">Rp${taxAmount.toLocaleString("id-ID")}</td>
            </tr>
            <tr style="font-weight:bold; border-top:2px solid #000;">
              <td colspan="2" style="padding:5px 10px; text-align:right;">Total</td>
              <td style="padding:5px 10px; text-align:right;">Rp${totalAmount.toLocaleString("id-ID")}</td>
            </tr>
          </tbody>
        </table>

        <p style="margin-top:15px;">
          Silakan cek detail invoice <a href="https://xendit.co/invoice/${invoiceId}" target="_blank">di sini</a>.
        </p>
        <p>Terima kasih telah berbelanja di PrasmulEats!</p>
      </div>
    `;

    const emailSubject = `Status Pesanan Anda: ${newStatus}`;

    try {
      await sendEmail(order.user.email, emailSubject, emailHtml);
      console.log("Email sent to", order.user.email);
    } catch (err) {
      console.error("Failed to send email:", err);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
