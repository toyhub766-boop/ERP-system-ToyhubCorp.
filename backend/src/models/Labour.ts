import mongoose, { Schema, Document } from "mongoose";

export interface ILabour extends Document {
  name: string;
  department: string;
  dailyWage: number;
  phone?: string;
  status: "ACTIVE" | "INACTIVE";
}

const labourSchema = new Schema<ILabour>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    dailyWage: {
      type: Number,
      default: 0,
    },

    phone: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILabour>(
  "Labour",
  labourSchema
);