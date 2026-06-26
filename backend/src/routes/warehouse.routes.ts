import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "../controllers/warehouse.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getWarehouses
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  createWarehouse
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  updateWarehouse
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  deleteWarehouse
);

export default router;