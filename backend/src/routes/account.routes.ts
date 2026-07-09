import express from "express";

import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountSummary,
} from "../controllers/account.controller";

import authMiddleware from "../middlewares/auth.middleware";
import roleMiddleware from "../middlewares/role.middleware";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAccounts);

router.get("/summary", getAccountSummary);

router.post("/", createAccount);

router.put("/:id", updateAccount);

router.delete("/:id", deleteAccount);

export default router;