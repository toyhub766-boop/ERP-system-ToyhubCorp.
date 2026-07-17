import mongoose, { Document, Schema } from "mongoose";

export interface IAccountTransaction extends Document {
  customer: mongoose.Types.ObjectId;

  transactionType: "MONEY_IN" | "MONEY_OUT";

  amount: number;

  paymentMethod: "Cash" | "Bank Transfer" | "Cheque" | "UPI";

  remarks?: string;

  balanceAfterTransaction: number;

  createdBy: mongoose.Types.ObjectId;

  date: Date;
}

const accountTransactionSchema =
  new Schema<IAccountTransaction>(
    {
      customer: {
        type: Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
      },

      transactionType: {
        type: String,
        enum: ["MONEY_IN", "MONEY_OUT"],
        required: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      paymentMethod: {
        type: String,
        enum: [
          "Cash",
          "Bank Transfer",
          "Cheque",
          "UPI",
        ],
        default: "Cash",
      },

      remarks: {
        type: String,
        default: "",
      },

      balanceAfterTransaction: {
        type: Number,
        required: true,
      },

      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      date: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IAccountTransaction>(
  "AccountTransaction",
  accountTransactionSchema
);