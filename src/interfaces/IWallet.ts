export interface IWalletTransaction {
  amount: number;
  type: "credit" | "debit";
  description: string;
  orderId?: string;
  createdAt: Date;
}

export interface IWallet extends Document {
  userId: string;
  balance: number;
  transactions: IWalletTransaction[];
}
