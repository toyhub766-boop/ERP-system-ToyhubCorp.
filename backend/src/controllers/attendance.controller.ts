import { Request, Response } from "express";
import Attendance from "../models/Attendance";

// GET ALL
export const getAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const attendance = await Attendance.find()
  .populate("employee", "name role employeeId")
  .populate("labour", "name department")
      .sort({ date: -1 });

    const data = attendance.map((record: any) => ({
      ...record.toObject(),
      score:
        record.tasksAssigned === 0
          ? 0
          : Math.round(
              (record.tasksCompleted /
                record.tasksAssigned) *
                100
            ),
    }));

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch attendance.",
    });
  }
};

// CREATE
export const createAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      attendanceType,
      employee,
      labour,
      date,
      checkIn,
      checkOut,
      status,
      tasksAssigned,
      tasksCompleted,
      remarks,
    } = req.body;

    if (
      attendanceType === "EMPLOYEE" &&
      !employee
    ) {
      return res.status(400).json({
        message: "Employee is required.",
      });
    }

    if (
      attendanceType === "LABOUR" &&
      !labour
    ) {
      return res.status(400).json({
        message: "Labour is required.",
      });
    }

    if (
      !date ||
      !checkIn ||
      !checkOut
    ) {
      return res.status(400).json({
        message:
          "Date, check-in and check-out are required.",
      });
    }

    const file = (req as any).file;

    const attendance =
      await Attendance.create({
        attendanceType,
        employee:
          attendanceType === "EMPLOYEE"
            ? employee
            : null,
        labour:
          attendanceType === "LABOUR"
            ? labour
            : null,
        date,
        checkIn,
        checkOut,
        status,
        tasksAssigned:
          Number(tasksAssigned) || 0,
        tasksCompleted:
          Number(tasksCompleted) || 0,
        remarks: remarks || "",
        photo: file
          ? file.path
          : "",
      });

    res.status(201).json(attendance);

  } catch (error: any) {
    console.error(
      "Attendance Create Error:",
      error
    );

    res.status(500).json({
      message:
        error.message ||
        "Failed to create attendance.",
    });
  }
};

// UPDATE
export const updateAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const updateData: any = {
      ...req.body,
    };

    const file = (req as any).file;

    if (file) {
      updateData.photo = file.path;
    }

    const attendance =
      await Attendance.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
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
        "Failed to update attendance.",
    });
  }
};

// DELETE
export const deleteAttendance = async (
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
        message: "Attendance not found.",
      });
    }

    res.json({
      message:
        "Attendance deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete attendance.",
    });
  }
};