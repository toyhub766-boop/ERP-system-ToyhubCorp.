import { Request, Response } from "express";
import AttendanceShift from "../models/AttendanceShift";

/* =========================================================
   GET ALL SHIFTS
========================================================= */

export const getAttendanceShifts =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const shifts =
        await AttendanceShift.find()
          .sort({
            status: 1,
            createdAt: -1,
          });

      res.json(shifts);
    } catch (error) {
      console.error(
        "GET ATTENDANCE SHIFTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch attendance shifts.",
      });
    }
  };

/* =========================================================
   GET ACTIVE SHIFTS
========================================================= */

export const getActiveAttendanceShifts =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const shifts =
        await AttendanceShift.find({
          status: "ACTIVE",
        }).sort({
          name: 1,
        });

      res.json(shifts);
    } catch (error) {
      console.error(
        "GET ACTIVE SHIFTS ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch active attendance shifts.",
      });
    }
  };

/* =========================================================
   GET ONE SHIFT
========================================================= */

export const getAttendanceShiftById =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const shift =
        await AttendanceShift.findById(
          req.params.id
        );

      if (!shift) {
        return res.status(404).json({
          message:
            "Attendance shift not found.",
        });
      }

      res.json(shift);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch attendance shift.",
      });
    }
  };

/* =========================================================
   CREATE SHIFT
========================================================= */

export const createAttendanceShift =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        startTime,
        endTime,
        durationMinutes,
        graceMinutes,
        status,
      } = req.body;

      if (!name?.trim()) {
        return res.status(400).json({
          message:
            "Shift name is required.",
        });
      }

      if (
        !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
          startTime
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid shift start time.",
        });
      }

      if (
        !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
          endTime
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid shift end time.",
        });
      }

      const duration =
        Number(durationMinutes);

      if (
        Number.isNaN(duration) ||
        duration <= 0
      ) {
        return res.status(400).json({
          message:
            "Shift duration must be greater than zero.",
        });
      }

      const grace =
        Number(graceMinutes) || 0;

      if (grace < 0) {
        return res.status(400).json({
          message:
            "Grace time cannot be negative.",
        });
      }

      const shift =
        await AttendanceShift.create({
          name:
            name.trim(),
          startTime,
          endTime,
          durationMinutes:
            duration,
          graceMinutes:
            grace,
          status:
            status || "ACTIVE",
        });

      res.status(201).json(
        shift
      );
    } catch (error: any) {
      console.error(
        "CREATE ATTENDANCE SHIFT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to create attendance shift.",
      });
    }
  };

/* =========================================================
   UPDATE SHIFT
========================================================= */

export const updateAttendanceShift =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        startTime,
        endTime,
        durationMinutes,
        graceMinutes,
        status,
      } = req.body;

      const shift =
        await AttendanceShift.findById(
          req.params.id
        );

      if (!shift) {
        return res.status(404).json({
          message:
            "Attendance shift not found.",
        });
      }

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            message:
              "Shift name cannot be empty.",
          });
        }

        shift.name =
          name.trim();
      }

      if (startTime !== undefined) {
        if (
          !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
            startTime
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid shift start time.",
          });
        }

        shift.startTime =
          startTime;
      }

      if (endTime !== undefined) {
        if (
          !/^([01]\d|2[0-3]):([0-5]\d)$/.test(
            endTime
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid shift end time.",
          });
        }

        shift.endTime =
          endTime;
      }

      if (
        durationMinutes !==
        undefined
      ) {
        const duration =
          Number(
            durationMinutes
          );

        if (
          Number.isNaN(
            duration
          ) ||
          duration <= 0
        ) {
          return res.status(400).json({
            message:
              "Shift duration must be greater than zero.",
          });
        }

        shift.durationMinutes =
          duration;
      }

      if (
        graceMinutes !==
        undefined
      ) {
        const grace =
          Number(
            graceMinutes
          );

        if (
          Number.isNaN(grace) ||
          grace < 0
        ) {
          return res.status(400).json({
            message:
              "Grace time cannot be negative.",
          });
        }

        shift.graceMinutes =
          grace;
      }

      if (status !== undefined) {
        if (
          ![
            "ACTIVE",
            "INACTIVE",
          ].includes(status)
        ) {
          return res.status(400).json({
            message:
              "Invalid shift status.",
          });
        }

        shift.status =
          status;
      }

      await shift.save();

      res.json(shift);
    } catch (error: any) {
      console.error(
        "UPDATE ATTENDANCE SHIFT ERROR:",
        error
      );

      res.status(500).json({
        message:
          error?.message ||
          "Failed to update attendance shift.",
      });
    }
  };

/* =========================================================
   DELETE SHIFT
========================================================= */

export const deleteAttendanceShift =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const shift =
        await AttendanceShift.findByIdAndDelete(
          req.params.id
        );

      if (!shift) {
        return res.status(404).json({
          message:
            "Attendance shift not found.",
        });
      }

      res.json({
        message:
          "Attendance shift deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE ATTENDANCE SHIFT ERROR:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete attendance shift.",
      });
    }
  };