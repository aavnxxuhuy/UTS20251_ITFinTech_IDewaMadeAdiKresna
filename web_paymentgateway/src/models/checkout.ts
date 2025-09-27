import { Schema, model, models } from "mongoose";

const checkoutSchema = new Schema({
  sessionId: { type: String, required: true, index: true },
  items: { type: Array, default: [] },
  total: { type: Number, default: 0 }
}, { timestamps: true });

export default models.Checkout || model("Checkout", checkoutSchema);
