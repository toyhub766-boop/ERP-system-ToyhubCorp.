import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getTasks,
  getTasksByUser,
  createTask,
  updateTask,
  toggleTaskCompletion,
  deleteTask,
} from "../controllers/task.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);

router.get(
  "/user/:userId",
  getTasksByUser
);

router.post("/", createTask);

router.put("/:id", updateTask);

router.patch(
  "/:id/toggle",
  toggleTaskCompletion
);

router.delete("/:id", deleteTask);

export default router;