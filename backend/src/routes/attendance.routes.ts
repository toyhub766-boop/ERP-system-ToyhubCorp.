import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendance.controller";

import upload from "../middlewares/upload.middleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAttendance);

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

router.delete("/:id", deleteAttendance);

export default router;