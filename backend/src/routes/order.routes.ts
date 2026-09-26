import { Router } from "express";

import {
  getOrders,
  getOrderById,
  getOrdersByCustomer,
  createOrder,
  updateOrder,
  sendOrderToProduction,
  deleteOrder,
  deleteOrdersBulk,
} from "../controllers/order.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// ============================================================
// ORDERS
// ============================================================

router.get(
  "/",
  getOrders
);

router.get(
  "/customer/:customerId",
  getOrdersByCustomer
);

router.post(
  "/",
  createOrder
);

// ============================================================
// SEND ORDER TO PRODUCTION
// ============================================================
//
// Explicit action route.
// Must remain before /:id.
//
// Flow:
// Confirmed CRM Order
//        ↓
// POST /orders/:id/send-to-production
//        ↓
// order.controller.ts
//        ↓
// createProductionFromOrderInternal()
//        ↓
// Production created + linked
//

router.post(
  "/:id/send-to-production",
  sendOrderToProduction
);

// ============================================================
// UPDATE
// ============================================================

router.put(
  "/:id",
  updateOrder
);

// ============================================================
// BULK DELETE
// ============================================================
//
// IMPORTANT:
// /bulk must be before /:id.
//

router.delete(
  "/bulk",
  deleteOrdersBulk
);

// ============================================================
// SINGLE ORDER
// ============================================================

router.get(
  "/:id",
  getOrderById
);

router.delete(
  "/:id",
  deleteOrder
);

export default router;