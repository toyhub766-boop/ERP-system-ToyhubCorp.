import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";


import {
  createProduction,
  getProductions,
  getProductionById,
  updateProduction,
  getMaterialConsumption,
  deleteProduction,
  calculateProduction,
} from "../controllers/production.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getProductions
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  createProduction
);

router.post(
  "/calculate",
  authMiddleware,
  calculateProduction
);

router.get(
  "/:id",
  authMiddleware,
  getProductionById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  updateProduction
);

router.get(
  "/:id/material-consumption",
  authMiddleware,
  getMaterialConsumption
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  deleteProduction
);

export default router;