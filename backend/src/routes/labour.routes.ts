import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getLabours,
  getActiveLabours,
  createLabour,
  updateLabour,
  deleteLabour,
} from "../controllers/labour.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getLabours);

router.get("/active", getActiveLabours);

router.post("/", createLabour);

router.put("/:id", updateLabour);

router.delete("/:id", deleteLabour);

export default router;