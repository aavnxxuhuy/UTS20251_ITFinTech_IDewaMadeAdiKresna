import mongoose, { Schema, Document } from "mongoose";

interface IItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface ICart extends Document {
  items: IItem[];
}

const ItemSchema = new Schema<IItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true }
});

const CartSchema = new Schema<ICart>(
  { items: [ItemSchema] },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);
