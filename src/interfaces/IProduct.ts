import { Document } from "mongoose";

export interface VariantOption {
  value: string;
  images?: string[];
}

export interface Variant {
  type: string;
  options: VariantOption[];
}

export interface IProduct extends Document {
  name: string;
  description: string;
  sku: string;
  brandId: string;
  categoryId: string;
  tags: string[];
  price: number;
  salePrice?: number;
  costPerItem?: number;
  taxable: boolean;
  stock: number;
  lowStockThreshold: number;
  backorder: boolean;
  images: string[]; 
  variants: Variant[];
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  status:boolean
}
