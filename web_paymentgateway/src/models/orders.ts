import { Schema, model, models } from "mongoose";

const OrderItemSchema = new Schema({
  productId: String,
  name: String,
  price: Number,
  qty: Number,
  image: String
}, { _id: false });

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true }, // external_id we set for Xendit
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["PENDING","PAID","EXPIRED","CANCELLED"], default: "PENDING" },
  xenditInvoiceId: String
}, { timestamps: true });

export default models.Order || model("Order", orderSchema);
