// api/xendit/webhook.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/orders";
import { sendWhatsAppNotification } from "@/lib/waService";

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log("Xendit Webhook payload:", body);

    const external_id = body.external_id || body.data?.external_id;
    const status = body.status || body.data?.status;
    const invoiceId = body.id || body.data?.id;
    const amount = body.amount || body.data?.amount;
    const paidAmount = body.paid_amount || body.data?.paid_amount;
    const paidAt = body.paid_at || body.data?.paid_at;
    const paymentMethod = body.payment_method || body.data?.payment_method;
    const paymentChannel = body.payment_channel || body.data?.payment_channel;
    const payerEmail = body.payer_email || body.data?.payer_email;

    if (!external_id || !status) {
      console.log("Webhook missing external_id or status:", body);
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    // Tentukan status baru
    let newStatus = "PENDING";
    if (status === "PAID" || status === "SUCCEEDED") newStatus = "PAID";
    else if (status === "EXPIRED") newStatus = "EXPIRED";
    else if (status === "CANCELLED" || status === "FAILED") newStatus = "CANCELLED";

    // Update order & populate user
    const order = await Order.findOneAndUpdate(
      { orderId: external_id },
      {
        status: newStatus,
        xenditInvoiceId: invoiceId,
        paymentDetails: {
          invoiceId,
          amount,
          paidAmount,
          status,
          paidAt,
          paymentMethod,
          paymentChannel,
          payerEmail,
          rawPayload: body,
        },
      },
      { new: true }
    ).populate("user", "name phone"); // <-- populate user di sini

    if (!order) {
      console.log("Order not found for external_id:", external_id);
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    console.log("Order updated via webhook:", order);

    // 🔹 Kirim WA notifikasi sesuai status
    if (order.user?.phone) {
      let message = `Halo ${order.user.name}, status pesanan Anda dengan kode *${order.orderId}* kini: *${newStatus}*.\nTotal: Rp${(Number(order.total) || 0).toLocaleString("id-ID")}.`;

      switch (newStatus) {
        case "PAID":
          message += `\n\nTerima kasih telah melakukan pembayaran! Pesanan Anda sedang diproses.`;
          break;
        case "EXPIRED":
          message += `\n\nMaaf, pesanan Anda telah kedaluwarsa. Silakan buat pesanan baru jika ingin membeli.`;
          break;
        case "CANCELLED":
          message += `\n\nPesanan Anda telah dibatalkan. Jika ada pertanyaan, hubungi customer service.`;
          break;
      }

      await sendWhatsAppNotification(order.user.phone, message);
      console.log("WA notification sent to", order.user.phone);
    } else {
      console.warn("User phone not found, WA not sent");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
