import mongoose, { Schema, Document } from "mongoose";
export interface IAttendance extends Document {
  attendanceType: "EMPLOYEE" | "LABOUR";

  employee?: mongoose.Types.ObjectId;

  labour?: mongoose.Types.ObjectId;

  date: Date;

  checkIn?: string;

  checkOut?: string;

  status: "Present" | "Absent" | "Half Day" | "Leave";

  tasksAssigned: number;

  tasksCompleted: number;

  remarks?: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    attendanceType: {
      type: String,
      enum: ["EMPLOYEE", "LABOUR"],
      default: "EMPLOYEE",
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    labour: {
      type: Schema.Types.ObjectId,
      ref: "Labour",
      default: null,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    checkIn: String,

    checkOut: String,

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Half Day",
        "Leave",
      ],
      default: "Present",
    },

    tasksAssigned: {
      type: Number,
      default: 0,
    },

    tasksCompleted: {
      type: Number,
      default: 0,
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

export default mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);