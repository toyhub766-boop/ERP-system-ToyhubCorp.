import express from "express";

import authMiddleware from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";

import {
  getAttendance,
  getAttendanceById,
  getMyAttendance,
  registerAttendanceEvent,
  registerLabourAttendanceEvent,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  assignEmployeeShift,
  assignLabourShift,
  updateEmployeeWage,
  updateLabourWage,
  getAttendanceCalculations,
} from "../controllers/attendance.controller";

const router =
  express.Router();

router.use(
  authMiddleware
);

router.get(
  "/my/today",
  getMyAttendance
);

router.post(
  "/my/event",
  upload.single("photo"),
  registerAttendanceEvent
);

router.post(
  "/labour/:labourId/event",
  upload.single("photo"),
  registerLabourAttendanceEvent
);

router.patch(
  "/employee/shift",
  assignEmployeeShift
);

router.patch(
  "/labour/shift",
  assignLabourShift
);

router.patch(
  "/employee/:id/wage",
  updateEmployeeWage
);

router.patch(
  "/labour/:id/wage",
  updateLabourWage
);

router.get(
  "/:id/calculations",
  getAttendanceCalculations
);

router.get(
  "/",
  getAttendance
);

router.get(
  "/:id",
  getAttendanceById
);

router.post(
  "/",
  upload.single("photo"),
  createAttendance
);

router.put(
  "/:id",
  upload.single("photo"),
  updateAttendance
);

router.delete(
  "/:id",
  deleteAttendance
);

export default router;