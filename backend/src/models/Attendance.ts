import mongoose, { Document, Schema } from "mongoose";

export type AttendanceType = "EMPLOYEE" | "LABOUR";

export type AttendanceEventType =
  | "CHECK_IN"
  | "BREAK_OUT"
  | "BREAK_IN"
  | "CHECK_OUT";

export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "EARLY_LEAVE"
  | "LATE_AND_EARLY"
  | "HALF_DAY"
  | "ABSENT"
  | "LEAVE";

export type AttendanceDayStatus =
  | "GREEN"
  | "YELLOW"
  | "ABSENT"
  | "LEAVE";

export type AttendanceStage =
  | "NEW"
  | "REGULAR"
  | "IMPROVING"
  | "WARNING"
  | "EXCELLENT";

export interface IAttendanceEvent {
  type: AttendanceEventType;
  at: Date;
  photo?: string;
  note?: string;
}

export interface IAttendanceStageHistory {
  stage: AttendanceStage;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId | null;
  note?: string;
}

export interface IAttendance extends Document {
  attendanceType: AttendanceType;

  employee?: mongoose.Types.ObjectId | null;
  labour?: mongoose.Types.ObjectId | null;

  date: Date;

  shift?: mongoose.Types.ObjectId | null;

  events: IAttendanceEvent[];

  // Working-hours calculations
  totalElapsedMinutes: number;
  breakMinutes: number;
  actualWorkingMinutes: number;
  requiredWorkingMinutes: number;
  differenceMinutes: number;

  // Daily status
  status: AttendanceStatus;
  dayStatus: AttendanceDayStatus;

  lateMinutes: number;
  earlyLeaveMinutes: number;

  // Attendance performance
  stage: AttendanceStage;
  score: number;

  stageHistory: IAttendanceStageHistory[];

  remarks?: string;

  createdAt: Date;
  updatedAt: Date;
}

const attendanceEventSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "CHECK_IN",
        "BREAK_OUT",
        "BREAK_IN",
        "CHECK_OUT",
      ],
      required: true,
    },

    at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    photo: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    registeredBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true }
);

const attendanceStageHistorySchema =
  new Schema<IAttendanceStageHistory>(
    {
      stage: {
        type: String,
        enum: [
          "NEW",
          "REGULAR",
          "IMPROVING",
          "WARNING",
          "EXCELLENT",
        ],
        required: true,
      },

      changedAt: {
        type: Date,
        default: Date.now,
      },

      changedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      note: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: true,
    }
  );

const attendanceSchema = new Schema<IAttendance>(
  {
    attendanceType: {
      type: String,
      enum: ["EMPLOYEE", "LABOUR"],
      required: true,
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
      required: true,
      default: Date.now,
    },

    shift: {
      type: Schema.Types.ObjectId,
      ref: "AttendanceShift",
      default: null,
    },

    // All attendance actions for this day
    events: {
      type: [attendanceEventSchema],
      default: [],
    },

    // Calculated values
    totalElapsedMinutes: {
      type: Number,
      default: 0,
    },

    breakMinutes: {
      type: Number,
      default: 0,
    },

    actualWorkingMinutes: {
      type: Number,
      default: 0,
    },

    requiredWorkingMinutes: {
      type: Number,
      default: 0,
    },

    differenceMinutes: {
      type: Number,
      default: 0,
    },

    // Daily attendance status
    status: {
      type: String,
      enum: [
        "PRESENT",
        "LATE",
        "EARLY_LEAVE",
        "LATE_AND_EARLY",
        "HALF_DAY",
        "ABSENT",
        "LEAVE",
      ],
      default: "PRESENT",
    },

    dayStatus: {
      type: String,
      enum: [
        "GREEN",
        "YELLOW",
        "ABSENT",
        "LEAVE",
      ],
      default: "GREEN",
    },

    lateMinutes: {
      type: Number,
      default: 0,
    },

    earlyLeaveMinutes: {
      type: Number,
      default: 0,
    },

    // Gamified attendance
    stage: {
      type: String,
      enum: [
        "NEW",
        "REGULAR",
        "IMPROVING",
        "WARNING",
        "EXCELLENT",
      ],
      default: "NEW",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    stageHistory: {
      type: [attendanceStageHistorySchema],
      default: [],
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Employee attendance lookup
attendanceSchema.index({
  attendanceType: 1,
  employee: 1,
  date: -1,
});

// Labour attendance lookup
attendanceSchema.index({
  attendanceType: 1,
  labour: 1,
  date: -1,
});

// Date-based HR/calendar lookup
attendanceSchema.index({
  date: -1,
});

export default mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);

