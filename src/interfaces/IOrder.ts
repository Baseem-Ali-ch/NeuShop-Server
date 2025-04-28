import { Document } from "mongoose";

export interface IOrder extends Document {
  paymentInfo: {
    cardNumber: string;
    cardName: string;
    expiryDate: string;
    cvv: string;
    paymentMethod: string;
  };
  shippingInfo: {
    address: string;
    apartment: string;
    city: string;
    country: string;
    state: string;
    zipCode: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  total: number;
  subtotal: number;
  tax: number
  orderId: string;
  userId: string
  createdAt?: Date;
  status?: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  paymentStatus?: ['Paid', 'Unpaid'];
  cancellationReason?: string;
  cancelledAt?: Date;
  returnReason?:string;
  returnedAt?: Date;
}
