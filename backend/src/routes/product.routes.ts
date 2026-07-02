import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from "../controllers/product.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getProducts
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["FOUNDER", "INVENTORY"]),
  createProduct
);

router.get(
  "/:id",
  authMiddleware,
  getProductById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER", "INVENTORY"]),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  deleteProduct
);

export default router;