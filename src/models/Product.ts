import { Schema, model } from "mongoose";
import { IProduct, Variant, VariantOption } from "../interfaces/IProduct";

const VariantOptionSchema = new Schema<VariantOption>({
  value: { type: String, required: true },
  images: { type: [String], default: [] },
});

const VariantSchema = new Schema<Variant>({
  type: { type: String, required: true },
  options: { type: [VariantOptionSchema], required: true },
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String },
  sku: { type: String, },
  brandId: { type: String,  },
  categoryId: { type: String, required: true },
  tags: { type: [String], default: [] },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  costPerItem: { type: Number },
  stock: { type: Number, required: true },
  lowStockThreshold: { type: Number, default: 5 },
  images: { type: [String], required: true },
  variants: { type: [VariantSchema], default: [] },
  status:{
    type: Boolean,
    default: true
  }
});

export const ProductModel = model<IProduct>("Product", ProductSchema);
