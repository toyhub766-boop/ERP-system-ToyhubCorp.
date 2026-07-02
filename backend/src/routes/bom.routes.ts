import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getBOMs,
  getBOMById,
  createBOM,
  updateBOM,
  deleteBOM,
} from "../controllers/bom.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getBOMs
);

router.get(
  "/:id",
  authMiddleware,
  getBOMById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  createBOM
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  updateBOM
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  deleteBOM
);

export default router;