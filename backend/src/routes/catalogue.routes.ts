import { Router } from "express";

import {
  getCatalogues,
  getCatalogueById,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
} from "../controllers/catalogue.controller";

import catalogueUpload from "../middlewares/catalogueUpload";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

// Get all catalogue products
router.get(
  "/",
  authMiddleware,
  getCatalogues
);

// Get one catalogue product
router.get(
  "/:id",
  authMiddleware,
  getCatalogueById
);

// Create catalogue product
router.post(
  "/",
  authMiddleware,
  catalogueUpload.single("image"),
  createCatalogue
);

// Update catalogue product
router.put(
  "/:id",
  authMiddleware,
  catalogueUpload.single("image"),
  updateCatalogue
);

// Delete catalogue product
router.delete(
  "/:id",
  authMiddleware,
  deleteCatalogue
);

export default router;