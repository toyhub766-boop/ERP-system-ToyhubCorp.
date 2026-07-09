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
    const attendance = await Attendance.create(req.body);

    res.status(201).json(attendance);
  } catch (error: any) {
  console.error("Attendance Create Error:");
  console.error(error);

  res.status(500).json({
    message: error.message,
    error,
  });
}
};

// UPDATE
export const updateAttendance = async (
  req: Request,
  res: Response
) => {
  try {
    const attendance =
      await Attendance.findByIdAndUpdate(
        req.params.id,
        req.body,
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
      message: "Failed to update attendance.",
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