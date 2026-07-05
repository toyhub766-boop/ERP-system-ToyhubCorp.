import mongoose, { Document, Schema } from "mongoose";

export interface IProduction extends Document {
  orderNumber: string;

  bom: mongoose.Types.ObjectId;

  finishedProduct: mongoose.Types.ObjectId;

  quantity: number;

  team: string;

  status:
    | "Draft"
    | "Approved"
    | "Started"
    | "In Progress"
    | "Completed"
    | "Cancelled";

  targetDate: Date;

  notes?: string;

  createdBy: mongoose.Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

const ProductionSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    bom: {
      type: Schema.Types.ObjectId,
      ref: "BOM",
      required: true,
    },

    finishedProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    team: {
      type: String,
      default: "Unassigned",
    },

    status: {
      type: String,
      enum: [
        "Draft",
        "Approved",
        "Started",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Draft",
    },

    targetDate: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      default: "",
    },

    actualQuantity: {
      type: Number,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    remarks: {
      type: String,
      default: "",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProduction>("Production", ProductionSchema);
