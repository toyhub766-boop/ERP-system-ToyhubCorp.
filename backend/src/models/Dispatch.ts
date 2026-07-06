import mongoose, { Document, Schema } from "mongoose";

export interface IDispatch extends Document {
  production: mongoose.Types.ObjectId;
  quantity: number;
  destination: string;
  vehicleNumber?: string;
  dispatchedBy: mongoose.Types.ObjectId;
  dispatchedAt?: Date;
  status: "Pending" | "Dispatched" | "Delivered";
  notes?: string;
}

const DispatchSchema = new Schema(
  {
    production: {
      type: Schema.Types.ObjectId,
      ref: "Production",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleNumber: {
      type: String,
      trim: true,
      default: "",
    },

    dispatchedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dispatchedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Dispatched", "Delivered"],
      default: "Pending",
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

export default mongoose.model<IDispatch>(
  "Dispatch",
  DispatchSchema
);