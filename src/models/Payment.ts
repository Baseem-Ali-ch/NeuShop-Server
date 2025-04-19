import { model, Schema } from "mongoose";
import { IPaymentMethod } from "../interfaces/IPayment";

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: {
      type: String,
      required: true,
    },
    cardNumber: {
      type: String,
      required: true,
    },
    cardholderName: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: String,
      required: true,
    },
    expiryYear: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PaymentModel = model<IPaymentMethod>("Payment", PaymentMethodSchema);
