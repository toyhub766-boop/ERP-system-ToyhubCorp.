import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  stockIn,
  stockOut,
  getTransactions,
} from "../controllers/inventory.controller";

const router = Router();

router.post(
  "/stock-in",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "INVENTORY",
  ]),
  stockIn
);

router.post(
  "/stock-out",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "INVENTORY",
  ]),
  stockOut
);

router.get(
  "/transactions",
  authMiddleware,
  roleMiddleware([
    "FOUNDER",
    "INVENTORY",
  ]),
  getTransactions
);

export default router;