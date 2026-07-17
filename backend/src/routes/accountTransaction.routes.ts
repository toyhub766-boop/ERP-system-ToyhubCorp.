import express from "express";

import authMiddleware from "../middlewares/auth.middleware";

import {
  getParties,
  getCustomerLedger,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "../controllers/accountTransaction.controller";

console.log("✅ accountTransaction.routes loaded");

const router = express.Router();

router.use(authMiddleware);

// Left Panel
router.get("/parties", getParties);


// Right Panel
router.get("/ledger/:customerId", getCustomerLedger);

// Money In / Money Out
router.post("/transaction", createTransaction);

//Update
router.put(
  "/transaction/:id",
  updateTransaction
);

//Delete
router.delete(
  "/transaction/:id",
  deleteTransaction
);

export default router;