import mongoose, { model, Schema } from "mongoose";
import { ICart } from "../interfaces/ICart";

const CartItemSchema: Schema = new Schema({
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    color: {
      type: String,
      required: false,
    },
    size: {
      type: String, 
      required: false,
    },
  });

const CartSchema: Schema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [CartItemSchema],
});

export const CartModel = model<ICart>("Cart", CartSchema);
