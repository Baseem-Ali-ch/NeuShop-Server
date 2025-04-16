import { model } from "mongoose";
import { IOrder } from "../interfaces/IOrder";

const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  paymentInfo: {
    cardNumber: String,
    cardName: String,
    expiryDate: String,
    cvv: String,
    paymentMethod: String,
  },
  shippingInfo: {
    address: String,
    apartment: String,
    city: String,
    country: String,
    state: String,
    zipCode: String,
  },
  items: [
    {
      id: String,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
    },
  ],
  total: Number,
  tax: Number,
  orderId: String,
  userId: String,
  status: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const OrderModel = model<IOrder>("Order", OrderSchema);
