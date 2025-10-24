import mongoose, { Schema } from "mongoose";

export type ProductDoc = {
  name: string;
  price: number;
  description: string;
  category: "Makanan Ringan" | "Minuman" | "Bundle";
  image: string;
};

const ProductSchema = new Schema<ProductDoc>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: "" },
  category: { type: String, enum: ["Makanan Ringan", "Minuman", "Bundle"], default: "Makanan Ringan" },
  image: { type: String, default: "" },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
