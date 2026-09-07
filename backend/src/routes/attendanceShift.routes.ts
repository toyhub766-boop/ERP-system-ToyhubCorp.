import express from "express";
import authMiddleware from "../middlewares/auth.middleware";

import {
  getAttendanceShifts,
  getActiveAttendanceShifts,
  getAttendanceShiftById,
  createAttendanceShift,
  updateAttendanceShift,
  deleteAttendanceShift,
} from "../controllers/attendanceShift.controller";

const router = express.Router();

router.use(authMiddleware);

/* =========================================================
   ACTIVE SHIFTS
========================================================= */

router.get(
  "/active",
  getActiveAttendanceShifts
);

/* =========================================================
   ALL SHIFTS
========================================================= */

router.get(
  "/",
  getAttendanceShifts
);

/* =========================================================
   SINGLE SHIFT
========================================================= */

router.get(
  "/:id",
  getAttendanceShiftById
);

/* =========================================================
   CREATE
========================================================= */

router.post(
  "/",
  createAttendanceShift
);

/* =========================================================
   UPDATE
========================================================= */

router.put(
  "/:id",
  updateAttendanceShift
);

/* =========================================================
   DELETE
========================================================= */

router.delete(
  "/:id",
  deleteAttendanceShift
);

export default router;