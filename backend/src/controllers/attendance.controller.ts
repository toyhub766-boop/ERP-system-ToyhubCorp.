import { Request, Response } from "express";
import Attendance, {
  AttendanceEventType,
  IAttendanceEvent,
} from "../models/Attendance";
import AttendanceShift from "../models/AttendanceShift";
import User from "../models/User";
import Labour from "../models/Labour";
import { AuthRequest } from "../middlewares/auth.middleware";

const getStartOfDay = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

const getEndOfDay = (date: Date) => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

const getDateFromRequest = (value?: string) => {
  if (!value) return getStartOfDay(new Date());

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return getStartOfDay(date);
};

const minutesFromTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return 0;
  }

  return hours * 60 + minutes;
};

const formatMinutes = (minutes: number) => {
  const sign = minutes < 0 ? "-" : "";
  const absolute = Math.abs(Math.round(minutes));

  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;

  return `${sign}${hours}h ${mins}m`;
};

const validateNextEvent = (
  events: IAttendanceEvent[],
  nextType: AttendanceEventType
) => {
  const lastEvent =
    events.length > 0
      ? events[events.length - 1]
      : null;

  if (!lastEvent) {
    if (nextType !== "CHECK_IN") {
      return "The first attendance action must be Check In.";
    }

    return null;
  }

  switch (lastEvent.type) {
    case "CHECK_IN":
      if (
        nextType !== "BREAK_OUT" &&
        nextType !== "CHECK_OUT"
      ) {
        return "After Check In, the next action must be Break Out or Check Out.";
      }
      break;

    case "BREAK_OUT":
      if (nextType !== "BREAK_IN") {
        return "After Break Out, the next action must be Break In.";
      }
      break;

    case "BREAK_IN":
      if (
        nextType !== "BREAK_OUT" &&
        nextType !== "CHECK_OUT"
      ) {
        return "After Break In, the next action must be Break Out or Check Out.";
      }
      break;

    case "CHECK_OUT":
      return "Attendance for this day is already checked out.";
  }

  return null;
};

const calculateAttendance = async (
  attendance: any
) => {
  const events = [...attendance.events].sort(
    (a: IAttendanceEvent, b: IAttendanceEvent) =>
      new Date(a.at).getTime() -
      new Date(b.at).getTime()
  );

  const checkIn = events.find(
    (event) => event.type === "CHECK_IN"
  );

  const checkOut = [...events]
    .reverse()
    .find(
      (event) => event.type === "CHECK_OUT"
    );

  let totalElapsedMinutes = 0;
  let breakMinutes = 0;

  if (checkIn && checkOut) {
    totalElapsedMinutes = Math.max(
      0,
      Math.round(
        (new Date(checkOut.at).getTime() -
          new Date(checkIn.at).getTime()) /
          60000
      )
    );
  }

  let breakStart: Date | null = null;

  for (const event of events) {
    if (event.type === "BREAK_OUT") {
      breakStart = new Date(event.at);
    }

    if (
      event.type === "BREAK_IN" &&
      breakStart
    ) {
      const breakEnd = new Date(event.at);

      breakMinutes += Math.max(
        0,
        Math.round(
          (breakEnd.getTime() -
            breakStart.getTime()) /
            60000
        )
      );

      breakStart = null;
    }
  }

  const actualWorkingMinutes = Math.max(
    0,
    totalElapsedMinutes - breakMinutes
  );

  let requiredWorkingMinutes = 0;
  let lateMinutes = 0;
  let earlyLeaveMinutes = 0;

  let shift: any = null;

  if (attendance.shift) {
    shift = await AttendanceShift.findById(
      attendance.shift
    );
  }

  if (shift) {
    requiredWorkingMinutes =
      Number(shift.durationMinutes) || 0;

    if (checkIn) {
      const attendanceDate = getStartOfDay(
        new Date(attendance.date)
      );

      const shiftStart = new Date(
        attendanceDate
      );

      const startMinutes =
        minutesFromTime(shift.startTime);

      shiftStart.setHours(
        Math.floor(startMinutes / 60),
        startMinutes % 60,
        0,
        0
      );

      const actualCheckIn = new Date(
        checkIn.at
      );

      const graceMinutes =
        Number(shift.graceMinutes) || 0;

      const lateDifference = Math.round(
        (actualCheckIn.getTime() -
          shiftStart.getTime()) /
          60000
      );

      lateMinutes = Math.max(
        0,
        lateDifference - graceMinutes
      );
    }

    if (checkOut) {
      const attendanceDate = getStartOfDay(
        new Date(attendance.date)
      );

      const shiftEnd = new Date(
        attendanceDate
      );

      const endMinutes =
        minutesFromTime(shift.endTime);

      shiftEnd.setHours(
        Math.floor(endMinutes / 60),
        endMinutes % 60,
        0,
        0
      );

      if (
        minutesFromTime(shift.endTime) <=
        minutesFromTime(shift.startTime)
      ) {
        shiftEnd.setDate(
          shiftEnd.getDate() + 1
        );
      }

      const actualCheckOut = new Date(
        checkOut.at
      );

      earlyLeaveMinutes = Math.max(
        0,
        Math.round(
          (shiftEnd.getTime() -
            actualCheckOut.getTime()) /
            60000
        )
      );
    }
  }

  const differenceMinutes =
    actualWorkingMinutes -
    requiredWorkingMinutes;

  let status:
    | "PRESENT"
    | "LATE"
    | "EARLY_LEAVE"
    | "LATE_AND_EARLY"
    | "HALF_DAY"
    | "ABSENT"
    | "LEAVE" = "PRESENT";

  let dayStatus:
    | "GREEN"
    | "YELLOW"
    | "ABSENT"
    | "LEAVE" = "GREEN";

  if (!checkIn) {
    status = "ABSENT";
    dayStatus = "ABSENT";
  } else if (!checkOut) {
    status = "LATE";
    dayStatus = "YELLOW";
  } else if (
    lateMinutes > 0 &&
    earlyLeaveMinutes > 0
  ) {
    status = "LATE_AND_EARLY";
    dayStatus = "YELLOW";
  } else if (lateMinutes > 0) {
    status = "LATE";
    dayStatus = "YELLOW";
  } else if (earlyLeaveMinutes > 0) {
    status = "EARLY_LEAVE";
    dayStatus = "YELLOW";
  } else if (
    requiredWorkingMinutes > 0 &&
    actualWorkingMinutes <
      requiredWorkingMinutes
  ) {
    status = "HALF_DAY";
    dayStatus = "YELLOW";
  } else {
    status = "PRESENT";
    dayStatus = "GREEN";
  }

  let score = 100;

  if (!checkIn) {
    score = 0;
  } else {
    score -= Math.min(
      30,
      Math.round(lateMinutes / 5)
    );

    score -= Math.min(
      30,
      Math.round(earlyLeaveMinutes / 5)
    );

    if (
      requiredWorkingMinutes > 0 &&
      actualWorkingMinutes <
        requiredWorkingMinutes
    ) {
      const shortage =
        requiredWorkingMinutes -
        actualWorkingMinutes;

      score -= Math.min(
        30,
        Math.round(shortage / 10)
      );
    }

    if (!checkOut) {
      score -= 20;
    }
  }

  score = Math.max(
    0,
    Math.min(100, score)
  );

  let stage:
    | "NEW"
    | "REGULAR"
    | "IMPROVING"
    | "WARNING"
    | "EXCELLENT" = "NEW";

  if (score >= 95) {
    stage = "EXCELLENT";
  } else if (score >= 85) {
    stage = "REGULAR";
  } else if (score >= 70) {
    stage = "IMPROVING";
  } else if (score > 0) {
    stage = "WARNING";
  }

  attendance.totalElapsedMinutes =
    totalElapsedMinutes;

  attendance.breakMinutes =
    breakMinutes;

  attendance.actualWorkingMinutes =
    actualWorkingMinutes;

  attendance.requiredWorkingMinutes =
    requiredWorkingMinutes;

  attendance.differenceMinutes =
    differenceMinutes;

  attendance.status = status;
  attendance.dayStatus = dayStatus;
  attendance.lateMinutes = lateMinutes;
  attendance.earlyLeaveMinutes =
    earlyLeaveMinutes;
  attendance.score = score;
  attendance.stage = stage;

  return {
    totalElapsedMinutes,
    breakMinutes,
    actualWorkingMinutes,
    requiredWorkingMinutes,
    differenceMinutes,
    lateMinutes,
    earlyLeaveMinutes,
    status,
    dayStatus,
    score,
    stage,
    formatted: {
      totalElapsed: formatMinutes(
        totalElapsedMinutes
      ),
      break: formatMinutes(
        breakMinutes
      ),
      actualWorking: formatMinutes(
        actualWorkingMinutes
      ),
      requiredWorking: formatMinutes(
        requiredWorkingMinutes
      ),
      difference: formatMinutes(
        differenceMinutes
      ),
    },
  };
};

const populateAttendance = async (
  attendance: any
) => {
  return Attendance.findById(
    attendance._id
  )
    .populate(
      "employee",
      "name role employeeId wageType wageAmount attendanceShift"
    )
    .populate(
      "labour",
      "name department phone wageType wageAmount attendanceShift"
    )
    .populate(
      "shift",
      "name startTime endTime durationMinutes graceMinutes status"
    );
};

export const getAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const attendance =
      await Attendance.find()
        .populate(
          "employee",
          "name role employeeId wageType wageAmount attendanceShift"
        )
        .populate(
          "labour",
          "name department phone wageType wageAmount attendanceShift"
        )
        .populate(
          "shift",
          "name startTime endTime durationMinutes graceMinutes status"
        )
        .sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error(
      "GET ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch attendance.",
    });
  }
};

export const getAttendanceById = async (
  req: Request,
  res: Response
) => {
  try {
    const attendance =
      await Attendance.findById(
        req.params.id
      )
        .populate(
          "employee",
          "name role employeeId wageType wageAmount attendanceShift"
        )
        .populate(
          "labour",
          "name department phone wageType wageAmount attendanceShift"
        )
        .populate(
          "shift",
          "name startTime endTime durationMinutes graceMinutes status"
        );

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance not found.",
      });
    }

    res.json(attendance);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch attendance.",
    });
  }
};

export const getMyAttendance = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        message:
          "User authentication required.",
      });
    }

    const now = new Date();

    const attendance =
      await Attendance.findOne({
        attendanceType: "EMPLOYEE",
        employee: req.user.userId,
        date: {
          $gte: getStartOfDay(now),
          $lte: getEndOfDay(now),
        },
      })
        .populate(
          "employee",
          "name role employeeId wageType wageAmount attendanceShift"
        )
        .populate(
          "shift",
          "name startTime endTime durationMinutes graceMinutes status"
        );

    if (!attendance) {
      return res.json({
        attendance: null,
        status: "NOT_STARTED",
      });
    }

    const calculations =
      await calculateAttendance(
        attendance
      );

    await attendance.save();

    res.json({
      attendance,
      calculations,
      status:
        attendance.events.length > 0
          ? attendance.events[
              attendance.events.length - 1
            ].type
          : "NOT_STARTED",
    });
  } catch (error: any) {
    console.error(
      "GET MY ATTENDANCE ERROR:",
      error
    );

    res.status(500).json({
      message:
        error?.message ||
        "Failed to fetch your attendance.",
    });
  }
};

export const registerAttendanceEvent =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          message:
            "User authentication required.",
        });
      }

      const {
        eventType,
        note,
      } = req.body;

      const allowedEvents: AttendanceEventType[] =
        [
          "CHECK_IN",
          "BREAK_OUT",
          "BREAK_IN",
          "CHECK_OUT",
        ];

      if (
        !allowedEvents.includes(
          eventType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid attendance event.",
        });
      }

      const requiresSelfie =
        eventType === "CHECK_IN" ||
        eventType === "CHECK_OUT";

      const file = (
        req as any
      ).file;

      if (
        requiresSelfie &&
        !file
      ) {
        return res.status(400).json({
          message:
            "Selfie is required for check-in and check-out.",
        });
      }

      const now = new Date();

      let attendance =
        await Attendance.findOne({
          attendanceType: "EMPLOYEE",
          employee: req.user.userId,
          date: {
            $gte: getStartOfDay(now),
            $lte: getEndOfDay(now),
          },
        });

      if (!attendance) {
        attendance =
          new Attendance({
            attendanceType:
              "EMPLOYEE",
            employee:
              req.user.userId,
            labour: null,
            date:
              getStartOfDay(now),
            events: [],
            stage: "NEW",
          });
      }

      const validationError =
        validateNextEvent(
          attendance.events,
          eventType
        );

      if (validationError) {
        return res.status(400).json({
          message: validationError,
        });
      }

      const event = {
        type: eventType,
        at: now,
        photo: requiresSelfie
          ? file.path
          : "",
        note: note || "",
      };

      attendance.events.push(
        event
      );

      const employee =
        await User.findById(
          req.user.userId
        );

      if (
        employee?.attendanceShift &&
        !attendance.shift
      ) {
        attendance.shift =
          employee.attendanceShift;
      }

      const calculations =
        await calculateAttendance(
          attendance
        );

      await attendance.save();

      const populated =
        await populateAttendance(
          attendance
        );

      res.status(201).json({
        attendance:
          populated,
        calculations,
        registeredAt: now,
        event,
      });
    } catch (error: any) {
      console.error(
        "REGISTER ATTENDANCE EVENT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to register attendance event.",
      });
    }
  };

  export const registerLabourAttendanceEvent =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({
          message:
            "User authentication required.",
        });
      }

      const operator =
        await User.findById(
          req.user.userId
        );

      if (!operator) {
        return res.status(401).json({
          message:
            "Operator account not found.",
        });
      }

      const allowedRoles = [
        "FOUNDER",
        "ATTENDANCE/HR",
        "PRODUCTION",
      ];

      if (
        !allowedRoles.includes(
          operator.role
        )
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to record labour attendance.",
        });
      }

      const labour =
        await Labour.findById(
          req.params.labourId
        );

      if (!labour) {
        return res.status(404).json({
          message:
            "Labour not found.",
        });
      }

      if (
        labour.status !== "ACTIVE"
      ) {
        return res.status(400).json({
          message:
            "Inactive labour cannot be punched in.",
        });
      }

      const {
        eventType,
        note,
      } = req.body;

      const allowedEvents: AttendanceEventType[] =
        [
          "CHECK_IN",
          "BREAK_OUT",
          "BREAK_IN",
          "CHECK_OUT",
        ];

      if (
        !allowedEvents.includes(
          eventType
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid attendance event.",
        });
      }

      const requiresPhoto =
        eventType === "CHECK_IN" ||
        eventType === "CHECK_OUT";

      const file =
        (req as any).file;

      if (
        requiresPhoto &&
        !file
      ) {
        return res.status(400).json({
          message:
            "Photo is required for labour check-in and check-out.",
        });
      }

      const now = new Date();

      let attendance =
        await Attendance.findOne({
          attendanceType: "LABOUR",
          labour: labour._id,
          date: {
            $gte: getStartOfDay(now),
            $lte: getEndOfDay(now),
          },
        });

      if (!attendance) {
        attendance =
          new Attendance({
            attendanceType:
              "LABOUR",

            employee: null,

            labour:
              labour._id,

            date:
              getStartOfDay(now),

            events: [],

            stage: "NEW",
          });
      }

      const validationError =
        validateNextEvent(
          attendance.events,
          eventType
        );

      if (validationError) {
        return res.status(400).json({
          message:
            validationError,
        });
      }

      if (
        labour.attendanceShift &&
        !attendance.shift
      ) {
        attendance.shift =
          labour.attendanceShift;
      }

      const event = {
        type: eventType,
        at: now,

        photo:
          file?.path || "",

        note:
          note || "",

        registeredBy:
          operator._id,
      };

      attendance.events.push(
        event
      );

      const calculations =
        await calculateAttendance(
          attendance
        );

      await attendance.save();

      const populated =
        await Attendance.findById(
          attendance._id
        )
          .populate(
            "labour",
            "name department phone wageType wageAmount attendanceShift"
          )
          .populate(
            "shift",
            "name startTime endTime durationMinutes graceMinutes status"
          )
          .populate(
            "events.registeredBy",
            "name role employeeId"
          );

      return res.status(201).json({
        attendance:
          populated,

        calculations,

        registeredAt:
          now,

        registeredBy: {
          _id:
            operator._id,

          name:
            operator.name,

          role:
            operator.role,

          employeeId:
            operator.employeeId,
        },

        event,
      });
    } catch (error: any) {
      console.error(
        "REGISTER LABOUR ATTENDANCE EVENT ERROR:",
        error
      );

      return res.status(500).json({
        message:
          error?.message ||
          "Failed to register labour attendance event.",
      });
    }
  };

export const createAttendance =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        attendanceType,
        employee,
        labour,
        date,
        shift,
        events,
        remarks,
        status,
      } = req.body;

      if (
        attendanceType ===
          "EMPLOYEE" &&
        !employee
      ) {
        return res.status(400).json({
          message:
            "Employee is required.",
        });
      }

      if (
        attendanceType ===
          "LABOUR" &&
        !labour
      ) {
        return res.status(400).json({
          message:
            "Labour is required.",
        });
      }

      const attendanceDate =
        getDateFromRequest(date);

      const attendance =
        new Attendance({
          attendanceType:
            attendanceType ||
            "EMPLOYEE",

          employee:
            attendanceType ===
            "LABOUR"
              ? null
              : employee,

          labour:
            attendanceType ===
            "LABOUR"
              ? labour
              : null,

          date: attendanceDate,

          shift:
            shift || null,

          events:
            Array.isArray(events)
              ? events
              : [],

          remarks:
            remarks || "",
        });

      if (status === "LEAVE") {
        attendance.status =
          "LEAVE";
        attendance.dayStatus =
          "LEAVE";
        attendance.score = 0;
      } else {
        await calculateAttendance(
          attendance
        );
      }

      await attendance.save();

      const populated =
        await populateAttendance(
          attendance
        );

      res.status(201).json(
        populated
      );
    } catch (error: any) {
      console.error(
        "CREATE ATTENDANCE ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to create attendance.",
      });
    }
  };

export const updateAttendance =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const attendance =
        await Attendance.findById(
          req.params.id
        );

      if (!attendance) {
        return res.status(404).json({
          message:
            "Attendance not found.",
        });
      }

      const {
        date,
        shift,
        events,
        remarks,
        status,
      } = req.body;

      if (date) {
        attendance.date =
          getDateFromRequest(date);
      }

      if (
        shift !== undefined
      ) {
        attendance.shift =
          shift || null;
      }

      if (
        Array.isArray(events)
      ) {
        attendance.events =
          events;
      }

      if (
        remarks !== undefined
      ) {
        attendance.remarks =
          remarks;
      }

      if (status === "LEAVE") {
        attendance.status =
          "LEAVE";
        attendance.dayStatus =
          "LEAVE";
        attendance.score = 0;
      } else {
        await calculateAttendance(
          attendance
        );
      }

      await attendance.save();

      const populated =
        await populateAttendance(
          attendance
        );

      res.json(
        populated
      );
    } catch (error: any) {
      console.error(
        "UPDATE ATTENDANCE ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to update attendance.",
      });
    }
  };

export const deleteAttendance =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const attendance =
        await Attendance.findByIdAndDelete(
          req.params.id
        );

      if (!attendance) {
        return res.status(404).json({
          message:
            "Attendance not found.",
        });
      }

      res.json({
        message:
          "Attendance deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE ATTENDANCE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete attendance.",
      });
    }
  };

export const assignEmployeeShift =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        employeeId,
        shiftId,
      } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          message:
            "Employee ID is required.",
        });
      }

      const employee =
        await User.findById(
          employeeId
        );

      if (!employee) {
        return res.status(404).json({
          message:
            "Employee not found.",
        });
      }

      if (shiftId) {
        const shift =
          await AttendanceShift.findById(
            shiftId
          );

        if (!shift) {
          return res.status(404).json({
            message:
              "Attendance shift not found.",
          });
        }
      }

      employee.attendanceShift =
        shiftId || null;

      await employee.save();

      const updated =
        await User.findById(
          employeeId
        ).populate(
          "attendanceShift"
        );

      res.json(updated);
    } catch (error) {
      console.error(
        "ASSIGN EMPLOYEE SHIFT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to assign employee shift.",
      });
    }
  };

export const assignLabourShift =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        labourId,
        shiftId,
      } = req.body;

      if (!labourId) {
        return res.status(400).json({
          message:
            "Labour ID is required.",
        });
      }

      const labour =
        await Labour.findById(
          labourId
        );

      if (!labour) {
        return res.status(404).json({
          message:
            "Labour not found.",
        });
      }

      if (shiftId) {
        const shift =
          await AttendanceShift.findById(
            shiftId
          );

        if (!shift) {
          return res.status(404).json({
            message:
              "Attendance shift not found.",
          });
        }
      }

      labour.attendanceShift =
        shiftId || null;

      await labour.save();

      const updated =
        await Labour.findById(
          labourId
        ).populate(
          "attendanceShift"
        );

      res.json(updated);
    } catch (error) {
      console.error(
        "ASSIGN LABOUR SHIFT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to assign labour shift.",
      });
    }
  };

export const updateEmployeeWage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        wageType,
        wageAmount,
      } = req.body;

      if (
        !["DAILY", "MONTHLY"].includes(
          wageType
        )
      ) {
        return res.status(400).json({
          message:
            "Wage type must be DAILY or MONTHLY.",
        });
      }

      const amount =
        Number(wageAmount);

      if (
        Number.isNaN(amount) ||
        amount < 0
      ) {
        return res.status(400).json({
          message:
            "Wage amount must be a valid non-negative number.",
        });
      }

      const employee =
        await User.findByIdAndUpdate(
          req.params.id,
          {
            wageType,
            wageAmount: amount,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!employee) {
        return res.status(404).json({
          message:
            "Employee not found.",
        });
      }

      res.json(employee);
    } catch (error) {
      console.error(
        "UPDATE EMPLOYEE WAGE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update employee wage configuration.",
      });
    }
  };

export const updateLabourWage =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        wageType,
        wageAmount,
      } = req.body;

      if (
        !["DAILY", "MONTHLY"].includes(
          wageType
        )
      ) {
        return res.status(400).json({
          message:
            "Wage type must be DAILY or MONTHLY.",
        });
      }

      const amount =
        Number(wageAmount);

      if (
        Number.isNaN(amount) ||
        amount < 0
      ) {
        return res.status(400).json({
          message:
            "Wage amount must be a valid non-negative number.",
        });
      }

      const labour =
        await Labour.findByIdAndUpdate(
          req.params.id,
          {
            wageType,
            wageAmount: amount,
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!labour) {
        return res.status(404).json({
          message:
            "Labour not found.",
        });
      }

      res.json(labour);
    } catch (error) {
      console.error(
        "UPDATE LABOUR WAGE ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to update labour wage configuration.",
      });
    }
  };

export const getAttendanceCalculations =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const attendance =
        await Attendance.findById(
          req.params.id
        );

      if (!attendance) {
        return res.status(404).json({
          message:
            "Attendance not found.",
        });
      }

      const calculations =
        await calculateAttendance(
          attendance
        );

      await attendance.save();

      res.json({
        attendanceId:
          attendance._id,
        calculations,
      });
    } catch (error: any) {
      console.error(
        "GET ATTENDANCE CALCULATIONS ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to calculate attendance.",
      });
    }
  };