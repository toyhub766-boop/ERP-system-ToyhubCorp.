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
  roleMiddleware(["FOUNDER",
  "PRODUCTION",]),
  createBOM
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER",
  "PRODUCTION",]),
  updateBOM
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER",
  "PRODUCTION",]),
  deleteBOM
);

export default router;