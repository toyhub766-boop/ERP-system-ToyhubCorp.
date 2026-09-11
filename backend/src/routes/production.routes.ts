import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";
import upload from "../middlewares/upload.middleware";

import {
  createProduction,
  getProductions,
  getProductionById,
  updateProduction,
  updateProductionItem,
  getMaterialConsumption,
  deleteProduction,
  calculateProduction,
  uploadProductionImage,
} from "../controllers/production.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getProductions
);

router.post(
  "/upload-image",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "CRM",
  ]),
  upload.single("image"),
  uploadProductionImage
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "CRM",
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
    "CRM",
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
    "CRM",
  ]),
  deleteProduction
);

export default router;