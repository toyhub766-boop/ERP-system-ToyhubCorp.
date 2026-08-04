import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
} from "../controllers/reminder.controller";

const router = express.Router();

router.use(authMiddleware);

// Get All
router.get(
  "/",
  getReminders
);

// Create
router.post(
  "/",
  createReminder
);

// Update
router.put(
  "/:id",
  updateReminder
);

// Mark Complete
router.patch(
  "/:id/complete",
  completeReminder
);

// Delete
router.delete(
  "/:id",
  deleteReminder
);

export default router;