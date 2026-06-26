import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";

const router = Router();

router.get(
  "/",
  authMiddleware,
  getCategories
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["FOUNDER"]),
  deleteCategory
);

export default router;