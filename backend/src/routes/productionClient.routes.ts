import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getProductionClients,
  getProductionClientById,
  createProductionClient,
  updateProductionClient,
  deleteProductionClient,
} from "../controllers/productionClient.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getProductionClients
);

router.get(
  "/:id",
  authMiddleware,
  getProductionClientById
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  createProductionClient
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  updateProductionClient
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "PRODUCTION",
  ]),
  deleteProductionClient
);

export default router;