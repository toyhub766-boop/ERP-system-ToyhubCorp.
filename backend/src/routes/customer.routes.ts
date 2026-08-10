import { Router } from "express";

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  getSalesPipeline,
  updateCustomerPipeline,
} from "../controllers/customer.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// ==============================
// PIPELINE — MUST COME BEFORE /:id
// ==============================

router.get(
  "/pipeline",
  getSalesPipeline
);

router.put(
  "/:id/pipeline",
  updateCustomerPipeline
);

// ==============================
// CUSTOMERS
// ==============================

router.get(
  "/",
  getCustomers
);

router.get(
  "/:id",
  getCustomerById
);

router.post(
  "/",
  createCustomer
);

router.put(
  "/:id",
  updateCustomer
);

router.delete(
  "/:id",
  deleteCustomer
);

// ==============================
// CUSTOMER NOTES
// ==============================

router.post(
  "/:id/notes",
  addCustomerNote
);

router.put(
  "/:id/notes/:noteId",
  updateCustomerNote
);

router.delete(
  "/:id/notes/:noteId",
  deleteCustomerNote
);

export default router;