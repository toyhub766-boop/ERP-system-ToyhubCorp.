import { Router } from "express";
import {
  getPayments,
  getPaymentById,
  getPaymentsByCustomer,
  createPayment,
  updatePayment,
  deletePayment,
} from "../controllers/payment.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getPayments);

router.get(
  "/customer/:customerId",
  getPaymentsByCustomer
);

router.get("/:id", getPaymentById);

router.post("/", createPayment);

router.put("/:id", updatePayment);

router.delete("/:id", deletePayment);

export default router;