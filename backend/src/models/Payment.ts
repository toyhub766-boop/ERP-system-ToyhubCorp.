import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  amountPaid: number;
  paymentDate: Date;
  paymentMethod: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>(
  "Payment",
  PaymentSchema
);