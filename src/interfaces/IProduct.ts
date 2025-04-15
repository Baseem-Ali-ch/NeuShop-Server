import { Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    brandId: string;
    categoryId: string;
    price: number;
    salePrice?: number;
    stock: number;
    images: string[]; 
  }