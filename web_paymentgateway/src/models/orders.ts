import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productId: String,
  name: String,
  price: Number,
  qty: Number,
  image: String
}, { _id: false });

const PaymentDetailSchema = new Schema({
  invoiceId: String,
  amount: Number,
  paidAmount: Number,
  status: String,
  paidAt: Date,
  paymentMethod: String,
  paymentChannel: String,
  payerEmail: String,
  rawPayload: Schema.Types.Mixed
}, { _id: false });

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["PENDING","PAID","EXPIRED","CANCELLED"], default: "PENDING" },
  xenditInvoiceId: String,
  paymentDetails: PaymentDetailSchema
}, { timestamps: true });

export default models.Order || model("Order", orderSchema);
