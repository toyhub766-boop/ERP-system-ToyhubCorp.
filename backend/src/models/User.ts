import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "FOUNDER",
        "INVENTORY",
        "PRODUCTION",
        "ACCOUNTANT",
        "ATTENDANCE/HR",
        "CRM",
      ],
      required: true,
    },

    // Attendance / wage configuration
    wageType: {
      type: String,
      enum: ["DAILY", "MONTHLY"],
      default: "MONTHLY",
    },

    wageAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Individual attendance shift
    attendanceShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceShift",
      default: null,
    },

    status: {
      type: String,
      default: "ACTIVE",
    },
  },

  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);