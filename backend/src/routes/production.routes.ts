import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  createProduction,
  getProductions,
  getProductionById,
  updateProduction,
  updateProductionItem,
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
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
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
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  updateProduction
);

router.put(
  "/:id/items/:itemId",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  updateProductionItem
);

router.get(
  "/:id/material-consumption",
  authMiddleware,
  getMaterialConsumption
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  deleteProduction
);

export default router;