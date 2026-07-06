import { Router } from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";

import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getCustomers);

router.get("/:id", getCustomerById);

router.post("/", createCustomer);

router.put("/:id", updateCustomer);

router.delete("/:id", deleteCustomer);

export default router;