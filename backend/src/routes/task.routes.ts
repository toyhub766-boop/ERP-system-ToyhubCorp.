import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getTasks,
  getTasksByUser,
  getMyTasks,
  createTask,
  updateTask,
  toggleTaskCompletion,
  toggleChecklistItem,
  deleteTask,
} from "../controllers/task.controller";

const router =
  express.Router();

router.use(
  authMiddleware
);

// =========================================================
// GENERAL / ADMIN
// =========================================================

router.get(
  "/",
  getTasks
);

// IMPORTANT:
// /my MUST come before /user/:userId
router.get(
  "/my",
  getMyTasks
);

router.get(
  "/user/:userId",
  getTasksByUser
);

// =========================================================
// TASK MANAGEMENT
// =========================================================

router.post(
  "/",
  createTask
);

router.put(
  "/:id",
  updateTask
);

// Whole task
router.patch(
  "/:id/toggle",
  toggleTaskCompletion
);

// Individual checklist item
router.patch(
  "/:taskId/checklist/:itemId",
  toggleChecklistItem
);

router.delete(
  "/:id",
  deleteTask
);

export default router;