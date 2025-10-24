// models/orders.ts
import mongoose, { Schema, Document } from "mongoose";

interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderId: string;
  items: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  paymentDetails?: object;
}

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, required: true },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product", // 🔥 tambahkan ini
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    paymentDetails: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
