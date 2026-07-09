import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  type: "Income" | "Expense";
  category: string;
  amount: number;
  description?: string;
  paymentMethod: "Cash" | "Bank" | "UPI";
  reference?: mongoose.Types.ObjectId;
  referenceModel?: "Payment";
  date: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    type: {
      type: String,
      enum: ["Income", "Expense"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank", "UPI"],
      required: true,
    },

    reference: {
      type: Schema.Types.ObjectId,
      default: null,
      refPath: "referenceModel",
    },

    referenceModel: {
      type: String,
      enum: ["Payment"],
      default: null,
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

export default mongoose.model<IAccount>("Account", accountSchema);