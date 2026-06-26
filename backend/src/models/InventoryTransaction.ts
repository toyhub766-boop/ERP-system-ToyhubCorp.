import mongoose, { Document, Schema } from "mongoose";

export interface IInventoryTransaction extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;

  type: "IN" | "OUT";

  quantity: number;

  previousStock: number;
  currentStock: number;

  reason: string;
  notes?: string;

  performedBy: mongoose.Types.ObjectId;

  createdAt: Date;
}

const InventoryTransactionSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    warehouse: {
      type: Schema.Types.ObjectId,
      ref: "Warehouse",
      required: true,
    },

    type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    previousStock: {
      type: Number,
      required: true,
    },

    currentStock: {
      type: Number,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    notes: {
      type: String,
      default: "",
    },

    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInventoryTransaction>(
  "InventoryTransaction",
  InventoryTransactionSchema
);
