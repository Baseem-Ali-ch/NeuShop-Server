import { Document } from "mongoose";

export interface IPaymentMethod extends Document {
    userId: string;
    cardNumber: string;
    cardholderName: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardType: string;
    isDefault: boolean;
  }