import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getTasks);

router.post("/", createTask);

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;