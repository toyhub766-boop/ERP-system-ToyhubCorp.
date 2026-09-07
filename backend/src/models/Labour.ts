import mongoose, { Schema, Document } from "mongoose";

export interface ILabour extends Document {
  name: string;
  department: string;
  dailyWage: number;
  phone?: string;
  status: "ACTIVE" | "INACTIVE";

  // Attendance / wage configuration
  wageType: "DAILY" | "MONTHLY";
  wageAmount: number;

  // Individual attendance shift
  attendanceShift?: mongoose.Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
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
      trim: true,
    },

    // Kept for compatibility with the existing Labour system
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

    // Attendance wage configuration
    wageType: {
      type: String,
      enum: ["DAILY", "MONTHLY"],
      default: "DAILY",
    },

    wageAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Individual shift assigned to this labour
    attendanceShift: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceShift",
      default: null,
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