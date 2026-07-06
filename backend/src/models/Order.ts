import mongoose, { Document, Schema } from "mongoose";

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  orderNumber: string;
  status: string;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "In Production",
        "Dispatched",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IOrder>(
  "Order",
  OrderSchema
);