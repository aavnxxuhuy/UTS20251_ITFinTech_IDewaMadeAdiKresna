// models/cart.ts
import mongoose, { Schema, Document } from "mongoose";

interface ICart extends Document {
  user: mongoose.Types.ObjectId;
  items: Array<{
    productId: string;
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
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
