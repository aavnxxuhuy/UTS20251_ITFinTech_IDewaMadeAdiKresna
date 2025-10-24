// models/cart.ts
import mongoose, { Schema, Document } from "mongoose";

interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    productId: mongoose.Types.ObjectId; // ubah jadi ObjectId
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId, // ubah ke ObjectId
          ref: "Product", // tambahkan reference
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
