import { model, Schema } from "mongoose";
import { IProduct } from "../interfaces/IProduct";

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    brandId: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    salePrice: {
      type: Number,
      default: null,
    },
    stock: {
      type: Number,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "draft", "out-of-stock"],
      default: "draft",
    },
    unitsSold: {
      type: Number,
      default: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  { timestamps: true }
);

export const ProductModel = model<IProduct>("Product", ProductSchema);