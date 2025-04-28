import mongoose, { model, Schema } from "mongoose";
import { IWallet } from "../interfaces/IWallet";

const WalletTransactionSchema = new Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  description: { type: String, required: true },
  orderId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const WalletSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: { type: Number, default: 0 },
  transactions: [WalletTransactionSchema],
});

export const WalletModel = model<IWallet>("Wallet", WalletSchema);
