import mongoose, { Document, Schema } from "mongoose";

export interface IAttendanceShift extends Document {
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  durationMinutes: number;
  graceMinutes: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const attendanceShiftSchema = new Schema<IAttendanceShift>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 0,
    },

    graceMinutes: {
      type: Number,
      default: 0,
      min: 0,
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

export default mongoose.model<IAttendanceShift>(
  "AttendanceShift",
  attendanceShiftSchema
);