import { model, Schema } from "mongoose";
import { IOrder } from "../interfaces/IOrder";

const mongoose = require("mongoose");

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentInfo: {
      cardNumber: { type: String, required: true },
      cardholderName: { type: String, required: true },
      expiryMonth: { type: String, required: true },
      expiryYear: { type: String, required: true },
      cvv: { type: String, required: true },
      paymentMethod: {
        type: String,
        enum: ["creditCard", "paypal", "applePay"],
        required: true,
      },
    },
    shippingInfo: {
      address: { type: String, required: true },
      apartment: { type: String },
      city: { type: String, required: true },
      country: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "unpaid",
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    returnReason: {
      type: String,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    orderId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const OrderModel = model<IOrder>("Order", OrderSchema);
