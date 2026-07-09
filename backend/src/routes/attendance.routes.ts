import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAttendance);

router.post("/", createAttendance);

router.put("/:id", updateAttendance);

router.delete("/:id", deleteAttendance);

export default router;