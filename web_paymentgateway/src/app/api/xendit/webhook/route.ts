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
    );

    if (!order) {
      console.log("Order not found for external_id:", external_id);
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    console.log("Order updated via webhook:", order);

    if (order.customerPhone) {
      await sendWhatsAppNotification(order.customerPhone, `Halo ${order.customerName || "Pelanggan"}, pembayaran Anda telah *${newStatus}*. Terima kasih telah berbelanja!`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}
